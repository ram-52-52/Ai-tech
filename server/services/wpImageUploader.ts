import axios from "axios";

// ============================================================================
// WordPress Featured Image Downloader & Uploader service
// Requires the following in your .env file:
// WP_USERNAME=your_wp_username
// WP_APPLICATION_PASSWORD=your_wp_application_password
// ============================================================================

/**
 * Downloads an image from the provided URL as an ArrayBuffer,
 * and uploads it directly to the WordPress REST API media endpoint.
 *
 * @param imageUrl The URL of the generated image to download.
 * @param blogTitle The title of the blog post.
 * @param wpSiteUrl The base URL of the WordPress site (e.g., https://myblog.com)
 * @returns Promise<number> The WordPress Media attachment ID
 */
export async function uploadFeaturedImageToWordPress(
  imageUrl: string,
  blogTitle: string,
  wpSiteUrl: string
): Promise<number> {
  try {
    // ------------------------------------------------------------------------
    // 1. Validate Environment Variables
    // ------------------------------------------------------------------------
    const wpUsername = process.env.WP_USERNAME;
    const wpAppPassword = process.env.WP_APPLICATION_PASSWORD;

    if (!wpUsername || !wpAppPassword) {
      throw new Error(
        "Missing WordPress credentials in .env (WP_USERNAME, WP_APPLICATION_PASSWORD)"
      );
    }

    if (!wpSiteUrl) {
      throw new Error("Missing WordPress site URL.");
    }

    const cleanWpUrl = wpSiteUrl.trim().replace(/\/$/, "");

    // ------------------------------------------------------------------------
    // 2. Download Image
    // ------------------------------------------------------------------------
    if (!imageUrl) {
      throw new Error("No imageUrl provided to upload.");
    }

    let imageBuffer: Buffer;
    
    // Check if the URL is absolute or relative
    if (imageUrl.startsWith("http")) {
      const downloadRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      imageBuffer = Buffer.from(downloadRes.data, "binary");
    } else {
      // Local file fallback
      const fs = await import("fs");
      const path = await import("path");
      const localPath = path.resolve(process.cwd(), "client", "public", imageUrl.replace(/^\//, ''));
      imageBuffer = fs.readFileSync(localPath);
    }

    // ------------------------------------------------------------------------
    // 3. Upload raw buffer to WordPress Media REST API
    // ------------------------------------------------------------------------

    // Create a URL-safe filename
    const sanitizedTitle = blogTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    const filename = `${sanitizedTitle}-featured-${Date.now()}.jpg`;

    // Construct Basic Auth Header
    const credentials = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");
    const authHeader = `Basic ${credentials}`;

    // POST the buffer directly to the /media endpoint
    const wpResponse = await axios.post(
      `${cleanWpUrl}/wp-json/wp/v2/media`,
      imageBuffer,
      {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Authorization": authHeader,
          "Accept": "application/json",
        },
      }
    );

    // ------------------------------------------------------------------------
    // 4. Output the Media ID
    // ------------------------------------------------------------------------
    const mediaId = wpResponse.data?.id;

    if (!mediaId) {
      throw new Error("WordPress upload succeeded but did not return a valid Media ID.");
    }

    return mediaId;

  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("WordPress Authentication Failed. Verify WP_USERNAME and WP_APPLICATION_PASSWORD.");
    }
    throw new Error(`Failed to upload feature image: ${error.message}`);
  }
}
