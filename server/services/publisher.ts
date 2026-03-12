import type { Blog, ExternalSite } from "@shared/schema";

export interface PublishResult {
  success: boolean;
  error?: string;
  postUrl?: string;
}

async function publishToMedium(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  const integrationToken = site.password;

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

async function publishToWordPress(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  const base = site.siteUrl.replace(/\/$/, "");
  const credentials = Buffer.from(`${site.username}:${site.password}`).toString("base64");

  try {
    const res = await fetch(`${base}/wp-json/wp/v2/posts`, {
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
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `WordPress post failed: ${err}` };
    }

    const data = await res.json() as { link: string };
    return { success: true, postUrl: data.link };
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

export async function publishBlog(blog: Blog, site: ExternalSite): Promise<PublishResult> {
  console.log(`📤 Publishing blog "${blog.title}" to ${site.siteName} (${site.siteType})`);

  switch (site.siteType) {
    case "medium":
      return publishToMedium(blog, site);
    case "wordpress":
      return publishToWordPress(blog, site);
    case "ghost":
      return publishToGhost(blog, site);
    case "linkedin":
      return { success: false, error: "LinkedIn publishing requires OAuth — not supported via password auth." };
    case "custom":
      return { success: false, error: "Custom API publishing not yet configured." };
    default:
      return { success: false, error: `Unknown site type: ${site.siteType}` };
  }
}
