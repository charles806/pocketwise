import { Resend } from "resend";
import nodemailer from "nodemailer";

const getResend = () => new Resend(process.env.RESEND_API_KEY);

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const getMailService = () => process.env.MAIL_SERVICE;

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    if (getMailService() === "resend") {
      await getResend().emails.send({
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
      await getTransporter().sendMail({
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
    if (getMailService() === "resend") {
      const { data, error } = await getResend().emails.send({
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
      const info = await getTransporter().sendMail({
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

export const sendSavingsNotificationEmail = async (
  email: string,
  subject: string,
  html: string,
) => {
  try {
    if (getMailService() === "resend") {
      const { data, error } = await getResend().emails.send({
        from: "PocketWise <onboarding@resend.dev>",
        to: email,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } else {
      return await getTransporter().sendMail({
        from: `"PocketWise" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      });
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
