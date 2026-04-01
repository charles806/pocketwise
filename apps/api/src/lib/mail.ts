import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendWelcomeEmail = async (email: string, firstName: string) => {
    try {
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
        })
    } catch (error) {
        console.error("Error sending welcome email:", error)
    }
}