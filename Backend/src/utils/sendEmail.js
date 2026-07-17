import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlMessage) => {
    // 1. Transporter create kar (Apne Gmail credentials yahan daal)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Tera Gmail
            pass: process.env.EMAIL_PASS  // Tera App Password (Not regular password)
        }
    });

    // 2. Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlMessage
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);
};