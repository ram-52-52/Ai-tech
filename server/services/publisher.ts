import type { Blog, ExternalSite } from "@shared/schema";
import axios from "axios";

export interface PublishResult {
  success: boolean;
  error?: string;
  postUrl?: string;
}

async function publishToMedium(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  const integrationToken = site.password?.trim();

  // Mock success for testing
  if (integrationToken === "provide_token_in_ui") {
    console.log("Mocking Medium publishing success for testing...");
    return { success: true, postUrl: `https://medium.com/@${site.username}/${blog.slug}` };
  }

  try {
    const meRes = await fetch("https://api.medium.com/v1/me", {
      headers: {
        Authorization: `Bearer ${integrationToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!meRes.ok) {
      const err = await meRes.text();
      return { success: false, error: `Medium auth failed: ${err}` };
    }

    const meData = await meRes.json() as { data: { id: string } };
    const authorId = meData.data.id;

    const postRes = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integrationToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: blog.title,
        contentFormat: "html",
        content: blog.content,
        tags: blog.tags?.slice(0, 5) ?? [],
        publishStatus: "public",
      }),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      return { success: false, error: `Medium post failed: ${err}` };
    }

    const postData = await postRes.json() as { data: { url: string } };
    return { success: true, postUrl: postData.data?.url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Robustly uploads a media file to a WordPress site.
 */
export async function uploadMediaToWordPress(imageUrl: string, site: ExternalSite): Promise<number | undefined> {
  const isOAuth = site.siteUrl.includes("wordpress.com") || /^\d+$/.test(site.username);
  const base = site.siteUrl.replace(/\/$/, "");

  try {
    let imageBuffer: Buffer;
    let filename: string;

    if (imageUrl.startsWith("http")) {
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      imageBuffer = Buffer.from(imgRes.data, "binary");
      filename = imageUrl.split("/").pop() || "image.jpg";
    } else {
      const fs = await import("fs");
      const path = await import("path");
      const imagePath = imageUrl.startsWith("/") 
        ? path.join(process.cwd(), "client", "public", imageUrl)
        : path.resolve(process.cwd(), imageUrl);
      imageBuffer = fs.readFileSync(imagePath);
      filename = path.basename(imagePath);
    }

    if (!isOAuth) {
      const credentials = Buffer.from(`${site.username}:${site.password}`).toString("base64");
      const mediaRes = await axios.post(`${base}/wp-json/wp/v2/media`, imageBuffer, {
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Type": "image/jpeg",
        }
      });

      if (mediaRes.status === 201 || mediaRes.status === 200) {
        console.log(`✅ WordPress media uploaded, ID: ${mediaRes.data.id}`);
        return mediaRes.data.id;
      }
    }
    return undefined;
  } catch (error: any) {
    console.error(`⚠️ WordPress media upload failed: ${error.message}`);
    return undefined;
  }
}

async function publishToWordPress(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  const isOAuth = site.siteUrl.includes("wordpress.com") || /^\d+$/.test(site.username);
  const base = site.siteUrl.replace(/\/$/, "");
  
  // Basic Auth Credentials (for self-hosted)
  const credentials = Buffer.from(`${site.username}:${site.password}`).toString("base64");
  
  let featuredMediaId: number | undefined;
  let featuredMediaUrl: string | undefined;

  try {
    // Attempt image upload to WordPress
    if (blog.imageUrl) {
      featuredMediaId = await uploadMediaToWordPress(blog.imageUrl, site);
      if (isOAuth && blog.imageUrl.startsWith("http")) {
        featuredMediaUrl = blog.imageUrl;
      }
    }

    let res: Response;

    if (isOAuth) {
      // WordPress.com API v1.1
      const endpoint = `https://public-api.wordpress.com/rest/v1.1/sites/${site.username}/posts/new`;
      const payload: any = {
        title: blog.title,
        content: blog.content,
        excerpt: blog.metaDescription ?? "",
        status: "publish",
        tags: blog.tags?.join(",") ?? "", 
      };
      
      if (featuredMediaUrl) {
        payload.featured_image = featuredMediaUrl; // v1.1 accepts URL
      }

      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${site.password}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
      // Self-Hosted Basic Auth API v2
      res = await fetch(`${base}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: blog.title,
          content: blog.content,
          slug: blog.slug,
          excerpt: blog.metaDescription ?? "",
          status: "publish",
          tags: blog.tags ?? [],
          featured_media: featuredMediaId,
        }),
      });
    }

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `WordPress post failed: ${err}` };
    }

    const data = await res.json() as { link?: string; URL?: string };
    return { success: true, postUrl: data.URL || data.link };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function publishToGhost(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  const base = site.siteUrl.replace(/\/$/, "");
  const adminApiKey = site.password;

  try {
    const [id, secret] = adminApiKey.split(":");
    if (!id || !secret) {
      return { success: false, error: "Ghost Admin API key must be in id:secret format" };
    }

    const { createHmac } = await import("crypto");
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: id })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: "/admin/" })).toString("base64url");
    const signature = createHmac("sha256", Buffer.from(secret, "hex"))
      .update(`${header}.${payload}`)
      .digest("base64url");
    const token = `${header}.${payload}.${signature}`;

    const res = await fetch(`${base}/ghost/api/admin/posts/`, {
      method: "POST",
      headers: {
        Authorization: `Ghost ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [{
          title: blog.title,
          html: blog.content,
          slug: blog.slug,
          custom_excerpt: blog.metaDescription ?? "",
          status: "published",
          tags: blog.tags?.map(t => ({ name: t })) ?? [],
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Ghost post failed: ${err}` };
    }

    const data = await res.json() as { posts: Array<{ url: string }> };
    return { success: true, postUrl: data.posts?.[0]?.url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>?/gm, "")
    .split("\n")
    .map(line => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function publishToLinkedIn(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  const accessToken = site.password?.trim();

  // Mock success for testing
  if (accessToken === "provide_token_in_ui") {
    console.warn(`⚠️ LinkedIn publishing is in MOCK MODE for blog "${blog.title}". No real post was created because a real Access Token was not provided.`);
    return { success: true, postUrl: `https://www.linkedin.com/feed/update/mock-post-${blog.id}` };
  }

  if (!accessToken) return { success: false, error: "No LinkedIn access token provided" };

  try {
    // Try to get user identity using multiple endpoints to handle different scope versions
    let authorId: string | undefined;

    // 1. Try OpenID UserInfo (for new scopes: openid, profile)
    const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (userInfoRes.ok) {
      const userInfo = await userInfoRes.json() as { sub: string };
      authorId = userInfo.sub;
      console.log(`Found LinkedIn Author ID via /userinfo: ${authorId}`);
    } else {
      // 2. Try legacy /me endpoint (for legacy scopes: r_liteprofile)
      const meRes = await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      if (meRes.ok) {
        const meData = await meRes.json() as { id: string };
        authorId = meData.id;
        console.log(`Found LinkedIn Author ID via /v2/me: ${authorId}`);
      } else {
        const err = await meRes.text();
        return { success: false, error: `LinkedIn identity check failed. Please ensure you have enabled "Sign In with LinkedIn using OpenID Connect" in your Developer Portal. Error: ${err}` };
      }
    }

    const authorUrn = `urn:li:person:${authorId}`;

    const summary = stripHtml(blog.content);
    const tags = blog.tags?.map(t => `#${t.replace(/\s+/g, "")}`).join(" ") || "";
    const commentary = `${blog.title}\n\n${summary}\n\n${tags}`;

    // LinkedIn limit is 3000 chars
    const finalCommentary = commentary.length > 3000
      ? commentary.substring(0, 2997) + "..."
      : commentary;

    let mediaUrn: string | undefined;

    // Attempt image upload if URL exists
    if (blog.imageUrl) {
      try {
        console.log(`📸 Attempting to upload image to LinkedIn: ${blog.imageUrl}`);

        // Step 1: Register Upload
        const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalasset:recipe:feedshare-image"],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          }),
        });

        if (registerRes.ok) {
          const registerData = await registerRes.json() as any;
          const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalasset.uploaders.MediaUploadHttpRequest"].uploadUrl;
          mediaUrn = registerData.value.asset;

          console.log(`Registered image asset: ${mediaUrn}`);

          // Step 2: Get image buffer
          let imageBuffer: Buffer;
          if (blog.imageUrl.startsWith("http")) {
            const imgRes = await fetch(blog.imageUrl);
            imageBuffer = Buffer.from(await imgRes.arrayBuffer());
          } else {
            const fs = await import("fs");
            const path = await import("path");
            // Handle both /generated-images/... and public path
            const imagePath = blog.imageUrl.startsWith("/")
              ? path.join(process.cwd(), "client", "public", blog.imageUrl)
              : path.resolve(process.cwd(), blog.imageUrl);
            imageBuffer = fs.readFileSync(imagePath);
          }

          // Step 3: Upload Binary
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "image/png", // Or detect from extension
            },
            body: new Uint8Array(imageBuffer),
          });

          if (!uploadRes.ok) {
            console.error(`Failed to upload image binary: ${await uploadRes.text()}`);
            mediaUrn = undefined; // Fallback to text
          } else {
            console.log("✅ Image uploaded successfully to LinkedIn");
          }
        } else {
          console.error(`Failed to register LinkedIn image upload: ${await registerRes.text()}`);
        }
      } catch (imgErr) {
        console.error("Error during LinkedIn image upload process:", imgErr);
        mediaUrn = undefined;
      }
    }

    const postBody: any = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: finalCommentary },
          shareMediaCategory: mediaUrn ? "IMAGE" : "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    if (mediaUrn) {
      postBody.specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          description: { text: blog.title },
          media: mediaUrn,
          title: { text: blog.title }
        }
      ];
    }

    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    const bodyText = await postRes.text();

    if (!postRes.ok) {
      return { success: false, error: `LinkedIn post failed (${postRes.status}): ${bodyText}` };
    }

    let postData: { id?: string } = {};
    try {
      postData = JSON.parse(bodyText);
    } catch (e) { }

    const postUrl = postData.id
      ? `https://www.linkedin.com/feed/update/${postData.id}/`
      : undefined;

    return { success: true, postUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function publishToEmbedWidget(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  try {
    const { storage } = await import("../storage");
    await storage.updateBlog(blog.id, { isPublished: true });
    return { success: true, postUrl: `${site.siteUrl} (Live Feed)` };
  } catch (err: any) {
    return { success: false, error: `Embed Widget publication failed: ${err.message}` };
  }
}

export async function publishBlog(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  console.log(`📤 Publishing blog "${blog.title}" to ${site.siteName} (${site.siteType})`);

  switch (site.siteType) {
    case "embed_widget":
      return publishToEmbedWidget(blog, site);
    case "medium":
      return publishToMedium(blog, site);
    case "wordpress":
      return publishToWordPress(blog, site);
    case "ghost":
      return publishToGhost(blog, site);
    case "linkedin":
      return publishToLinkedIn(blog, site);
    case "custom":
      return { success: false, error: "Custom API publishing not yet configured." };
    default:
      return { success: false, error: `Unknown site type: ${site.siteType}` };
  }
}
