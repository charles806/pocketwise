import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    await transporter.sendMail({
      from: `"PocketWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to PocketWise",
      html: `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #4f46e5; padding:0;">

        <div style="background:#eef2ff; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">Welcome to PocketWise</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey ${firstName},</p>
          <p style="margin:0 0 12px;">Welcome to <strong style="color:#4f46e5;">PocketWise</strong> — your money's new home.</p>
          <p style="margin:0 0 12px;">Your smart finance journey starts now. We'll help you split, save, and spend smarter, all from one place.</p>
          <p style="margin:0 0 24px;">We're excited to have you onboard.</p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr>
              <td style="background:#4f46e5; border-radius:12px; padding:12px 28px; text-align:center;">
                <a href="https://pocketwise.xyz" style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; display:inline-block;">Get Started</a>
              </td>
            </tr>
          </table>

          <p style="margin:0; font-size:14px; color:#475569;">Cheers,<br><strong style="color:#0f172a;">The PocketWise Team</strong></p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const sendWaitlistEmail = async (email: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"PocketWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You're on the waitlist 🚀",
      html: `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #4f46e5; padding:0;">

        <div style="background:#eef2ff; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">You're on the List! 🎉</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey there,</p>
          <p style="margin:0 0 12px;">Thanks for joining the <strong style="color:#4f46e5;">PocketWise</strong> waitlist.</p>
          <p style="margin:0 0 12px;">We're building something exciting — and you'll be among the first to know when we launch.</p>

          <div style="background:#eef2ff; border-left:4px solid #4f46e5; padding:14px 16px; margin:20px 0; border-radius:6px;">
            <p style="margin:0; color:#4f46e5; font-weight:600; font-size:14px;">Stay tuned — big things coming soon 🚀</p>
          </div>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`,
    });
    return info;
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }
};

export const sendOtpEmail = async (
  email: string,
  otp: string,
  firstName: string,
) => {
  try {
    await transporter.sendMail({
      from: `"PocketWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
<body style="margin:0; padding:24px 16px; background:#f8fafc; font-family:'DM Sans',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; margin:0 auto;">
    <tr>
      <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(79,70,229,0.08), 0 2px 8px rgba(0,0,0,0.04); border-top:4px solid #4f46e5; padding:0;">

        <div style="background:#eef2ff; padding:28px 32px 20px; text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" style="display:block;">
                  <rect width="64" height="64" rx="16" fill="#5B4FCF"/>
                  <rect x="12" y="24" width="40" height="26" rx="7" fill="white"/>
                  <rect x="12" y="18" width="18" height="8" rx="4" fill="#EDE9FF"/>
                  <line x1="22" y1="24" x2="22" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="32" y1="24" x2="32" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <line x1="42" y1="24" x2="42" y2="50" stroke="#5B4FCF" stroke-width="2"/>
                  <circle cx="46" cy="37" r="3" fill="#5B4FCF"/>
                </svg>
              </td>
              <td style="padding-left:10px; vertical-align:middle;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.5px;">Pocket<span style="color:#5B4FCF;">Wise</span></span>
              </td>
            </tr>
          </table>
          <h1 style="font-family:'Plus Jakarta Sans',Arial,sans-serif; font-size:22px; font-weight:700; color:#0f172a; margin:16px 0 0; letter-spacing:-0.3px;">Reset Your Password</h1>
        </div>

        <div style="padding:24px 32px 32px; color:#475569; font-size:15px; line-height:1.6;">

          <p style="margin:0 0 16px; color:#0f172a; font-size:16px;">Hey ${firstName},</p>
          <p style="margin:0 0 12px;">We received a request to reset your PocketWise password. Use the OTP below to proceed:</p>

          <div style="background:#eef2ff; border-radius:16px; padding:24px; text-align:center; margin:20px 0;">
            <span style="font-family:'Courier New',monospace; font-size:36px; font-weight:800; color:#4f46e5; letter-spacing:8px;">${otp}</span>
          </div>

          <p style="margin:0 0 12px; font-size:14px; color:#64748b;">This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>

          <p style="margin:24px 0 0; font-size:14px; color:#475569;">— The PocketWise Team</p>
        </div>

        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">PocketWise — Your Smart Finance Partner</p>
        </div>

      </td>
    </tr>
  </table>
</body>`,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

export const sendSavingsNotificationEmail = async (
  email: string,
  subject: string,
  html: string,
) => {
  try {
    return await transporter.sendMail({
      from: `"PocketWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
