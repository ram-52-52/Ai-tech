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
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif; 
          background-color: #f8fafc; 
          margin: 0; 
          padding: 0; 
        }
        .wrapper {
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 32px; 
          overflow: hidden; 
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 50px rgba(0,0,0,0.03); 
        }
        .header { 
          background: #0f172a; 
          padding: 48px 40px; 
          text-align: left; 
          color: white; 
        }
        .logo-box {
          display: inline-block;
          width: 44px;
          height: 44px;
          background: #f97316;
          border-radius: 12px;
          margin-bottom: 24px;
          line-height: 44px;
          text-align: center;
          font-size: 24px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.04em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 13px;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .content { 
          padding: 48px 40px; 
          line-height: 1.7; 
          color: #475569; 
        }
        .welcome-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .intro {
          font-size: 16px;
          margin-bottom: 32px;
        }
        .card {
          background: #f8fafc;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 40px;
          border: 1px solid #f1f5f9;
        }
        .card-row {
          margin-bottom: 24px;
        }
        .card-row:last-child {
          margin-bottom: 0;
        }
        .label { 
          font-size: 10px; 
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #94a3b8; 
          margin-bottom: 8px; 
          font-weight: 800;
        }
        .value { 
          font-family: 'Menlo', 'Monaco', 'Cascadia Code', monospace;
          font-size: 18px; 
          color: #0f172a; 
          font-weight: 700; 
        }
        .btn-container {
          margin: 40px 0;
          text-align: center;
        }
        .button { 
          display: inline-block; 
          background: #f97316; 
          color: #ffffff !important; 
          padding: 20px 56px; 
          border-radius: 18px; 
          text-decoration: none; 
          font-weight: 800; 
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: 0 10px 40px rgba(249, 115, 22, 0.35); 
        }
        .security {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
          margin-top: 48px;
        }
        .footer { 
          padding: 40px; 
          text-align: center; 
          font-size: 12px; 
          color: #94a3b8; 
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-box">🚀</div>
            <h1>AI TECH</h1>
            <p>Content Automation</p>
          </div>
          <div class="content">
            <div class="welcome-title">Success! Workspace Provisioned.</div>
            <p class="intro">
              Hello <strong>${username}</strong>, your premium AI workspace is live. You now have full access to our multi-platform blogging and trend analysis engine.
            </p>
            
            <div class="card">
              <div class="card-row">
                <div class="label">Access ID</div>
                <div class="value">${username}</div>
              </div>
              <div class="card-row">
                <div class="label">Primary Password</div>
                <div class="value">${password}</div>
              </div>
            </div>
 
            <div class="btn-container">
              <a href="${loginUrl}" class="button">Access Platform</a>
            </div>
 
            <p class="security">
              For your safety, please update your temporary password immediately upon log in.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AI-TECH • Automated B2B Content Engine<br>
            Managed Enterprise Solution
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
 
  await transporter.sendMail({
    from: `"AI TECH Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "⚡ Your AI TECH Workspace is Ready",
    html,
  });
}

export async function sendContactNotification(name: string, email: string, message: string) {
  const adminEmail = process.env.EMAIL_USER;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Inter', system-ui, sans-serif; 
          background: #ffffff; 
          color: #1e293b; 
          margin: 0; 
          padding: 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: auto; 
          border: 1px solid #f1f5f9; 
          border-radius: 24px; 
          overflow: hidden;
          box-shadow: 0 4px 30px rgba(0,0,0,0.02);
        }
        .header { 
          background: #f97316; 
          padding: 32px; 
          color: white; 
        }
        .header h2 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
        .body { padding: 40px; }
        .entry { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
        .entry:last-child { border: 0; margin: 0; padding: 0; }
        .label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.15em; margin-bottom: 8px; display: block; }
        .value { font-size: 16px; font-weight: 600; color: #1e293b; }
        .message-box { background: #f8fafc; padding: 24px; border-radius: 16px; font-size: 15px; color: #334155; line-height: 1.6; font-style: italic; border-left: 4px solid #f97316; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>NEW PLATFORM INQUIRY</h2>
        </div>
        <div class="body">
          <div class="entry">
            <span class="label">SENDER</span>
            <div class="value">${name}</div>
          </div>
          <div class="entry">
            <span class="label">EMAIL ADDRESS</span>
            <div class="value">${email}</div>
          </div>
          <div class="entry">
            <span class="label">MESSAGE CONTENT</span>
            <div class="message-box">"${message}"</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"AI TECH Notifications" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `📩 Contact: ${name} via AI TECH`,
    html,
  });
}
