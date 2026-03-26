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
      <title>Welcome to AI-Tech SaaS</title>
      <style>
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background-color: #0b0f1a; 
          margin: 0; 
          padding: 0; 
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          background-color: #0b0f1a;
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #161b2c; 
          border-radius: 24px; 
          overflow: hidden; 
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3); 
        }
        .header { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); 
          padding: 60px 40px; 
          text-align: center; 
          color: white; 
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .header p {
          margin: 12px 0 0 0;
          font-size: 18px;
          opacity: 0.9;
          font-weight: 500;
        }
        .content { 
          padding: 48px 40px; 
          line-height: 1.6; 
          color: #e2e8f0; 
        }
        .welcome-text {
          font-size: 18px;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 16px;
        }
        .description {
          font-size: 15px;
          color: #94a3b8;
          margin-bottom: 32px;
        }
        .credential-container {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .credential-row {
          margin-bottom: 24px;
        }
        .credential-row:last-child {
          margin-bottom: 0;
        }
        .label { 
          font-size: 12px; 
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6366f1; 
          margin-bottom: 8px; 
          font-weight: 700;
        }
        .value { 
          font-family: 'JetBrains Mono', 'Fira Code', monospace; 
          font-size: 20px; 
          color: #ffffff; 
          font-weight: 600; 
          word-break: break-all;
        }
        .btn-wrapper {
          text-align: center;
          margin-top: 16px;
        }
        .button { 
          display: inline-block; 
          background: #6366f1; 
          color: white !important; 
          padding: 16px 40px; 
          border-radius: 14px; 
          text-decoration: none; 
          font-weight: 700; 
          font-size: 16px;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); 
          transition: transform 0.2s ease;
        }
        .security-note {
          margin-top: 40px;
          font-size: 13px;
          color: #64748b;
          text-align: center;
        }
        .footer { 
          padding: 32px; 
          text-align: center; 
          font-size: 12px; 
          color: #475569; 
          background: #0f172a;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>AutoBlog.ai</h1>
            <p>Your AI Content Command Center</p>
          </div>
          <div class="content">
            <div class="welcome-text">Hello, ${username}!</div>
            <div class="description">
              Your managed SaaS workspace has been successfully provisioned. You are now equipped with the power of advanced AI to generate, manage, and distribute premium content.
            </div>
            
            <div class="credential-container">
              <div class="credential-row">
                <div class="label">Access Username</div>
                <div class="value">${username}</div>
              </div>
              <div class="credential-row">
                <div class="label">Temporary Passphrase</div>
                <div class="value">${password}</div>
              </div>
            </div>

            <div class="btn-wrapper">
              <a href="${loginUrl}" class="button">Launch Dashboard</a>
            </div>

            <p class="security-note">
              For your protection, please update your temporary passphrase immediately in the account settings after your first sign-in.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AutoBlog.ai • The Future of Automated Content<br>
            Managed Multi-Tenant SaaS Platform
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"AI-Tech SaaS" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to AI-Tech SaaS - Your Credentials",
    html,
  });
}
