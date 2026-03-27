import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendWelcomeEmail(to: string, username: string, password: string) {
  const loginUrl = `${process.env.APP_URL || 'http://localhost:5000'}/login`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AI TECH</title>
      <style>
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background-color: #fcfcfc; 
          margin: 0; 
          padding: 0; 
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          background-color: #fcfcfc;
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 32px; 
          overflow: hidden; 
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05); 
        }
        .header { 
          background: #0a0a0a; 
          padding: 60px 40px; 
          text-align: center; 
          color: white; 
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.05em;
          text-transform: uppercase;
        }
        .header p {
          margin: 12px 0 0 0;
          font-size: 14px;
          opacity: 0.6;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .content { 
          padding: 48px 40px; 
          line-height: 1.6; 
          color: #4b5563; 
        }
        .welcome-text {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }
        .description {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 32px;
        }
        .credential-container {
          background: #f9fafb;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 32px;
          border: 1px solid #f3f4f6;
        }
        .credential-row {
          margin-bottom: 24px;
        }
        .credential-row:last-child {
          margin-bottom: 0;
        }
        .label { 
          font-size: 11px; 
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #9ca3af; 
          margin-bottom: 8px; 
          font-weight: 800;
        }
        .value { 
          font-family: 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', monospace; 
          font-size: 18px; 
          color: #111827; 
          font-weight: 700; 
          word-break: break-all;
        }
        .btn-wrapper {
          text-align: center;
          margin-top: 16px;
        }
        .button { 
          display: inline-block; 
          background: #f97316; 
          color: white !important; 
          padding: 18px 48px; 
          border-radius: 16px; 
          text-decoration: none; 
          font-weight: 800; 
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.25); 
          transition: all 0.2s ease;
        }
        .security-note {
          margin-top: 40px;
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
        }
        .footer { 
          padding: 32px; 
          text-align: center; 
          font-size: 11px; 
          color: #9ca3af; 
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div style="display: inline-block; width: 48px; height: 48px; background: #f97316; border-radius: 12px; margin-bottom: 20px; line-height: 48px;">
              <span style="color: white; font-size: 24px; font-weight: 900;">⚡</span>
            </div>
            <h1>AI TECH</h1>
            <p>Content Automation</p>
          </div>
          <div class="content">
            <div class="welcome-text">Success! Your workspace is ready.</div>
            <div class="description">
              Hello ${username}, your premium AI content workspace has been provisioned. You can now start automating your blog production across all platforms.
            </div>
            
            <div class="credential-container">
              <div class="credential-row">
                <div class="label">Username</div>
                <div class="value">${username}</div>
              </div>
              <div class="credential-row">
                <div class="label">Temporary Password</div>
                <div class="value">${password}</div>
              </div>
            </div>
 
            <div class="btn-wrapper">
              <a href="${loginUrl}" class="button">Access Dashboard</a>
            </div>
 
            <p class="security-note">
              Please change your password immediately after your first sign-in for security.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AI TECH • Professional Content Automation<br>
            Managed B2B SaaS Solution
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
 
  await transporter.sendMail({
    from: `"AI TECH Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your AI TECH Workspace is Ready",
    html,
  });
}

export async function sendContactNotification(name: string, email: string, message: string) {
  const adminEmail = process.env.EMAIL_USER;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #f97316; color: white; padding: 10px 20px; border-radius: 5px; margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Inquiry</h2>
        </div>
        <div class="field">
          <span class="label">Name:</span> ${name}
        </div>
        <div class="field">
          <span class="label">Email:</span> ${email}
        </div>
        <div class="field">
          <span class="label">Message:</span>
          <p>${message}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"AI TECH Contact" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `New Inquiry from ${name}`,
    html,
  });
}
