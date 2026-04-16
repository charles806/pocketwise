import { Resend } from "resend";
import nodemailer from "nodemailer";

// Resend Configuration (Keep for later)
const resend = new Resend(process.env.RESEND_API_KEY);

// Nodemailer Configuration (For use without domain)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Toggle this to "resend" once you have a verified domain
const MAIL_SERVICE = process.env.MAIL_SERVICE;

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    if (MAIL_SERVICE === "resend") {
      await resend.emails.send({
        from: "PocketWise <onboarding@resend.dev>",
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
    } else {
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
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const sendWaitlistEmail = async (email: string) => {
  try {
    if (MAIL_SERVICE === "resend") {
      const { data, error } = await resend.emails.send({
        from: "PocketWise <onboarding@resend.dev>",
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

      if (error) {
        console.error("Resend error:", error);
        throw new Error("Failed to send waitlist email");
      }
      return data;
    } else {
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
    }
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }
};
