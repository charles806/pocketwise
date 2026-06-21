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
        <h1>Hi ${firstName},</h1>
        <p>Welcome to <strong>PocketWise</strong>!</p>
        <p>Your smart finance journey starts now.</p>
        <p>We're excited to have you onboard.</p>
        <br />
        <p>Cheers,<br />The PocketWise Team</p>
      `,
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
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2>You're officially on the waitlist 🎉</h2>
          <p>Thanks for joining our waitlist.</p>
          <p>We're building something exciting and you'll be among the first to know when we launch.</p>
          <p>Stay tuned — big things coming soon 🚀</p>
          <br/>
          <p>— The Team</p>
        </div>
      `,
    });
    return info;
  } catch (err) {
    console.error("Email error:", err);
    throw err;
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
