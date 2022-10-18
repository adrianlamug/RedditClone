import nodemailer from "nodemailer";
export async function sendEmail(to: string, html: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
    console.log('testAccount', testAccount)

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "m2ojzm727hahy6ty@ethereal.email", // generated ethereal user
            pass: "6UZx4PwrdjdVvARWrY" // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"bob mailer" <bob@example.com>', // sender address
        to: "bar@example.com", // list of receivers
        subject: "Change your password", // Subject line
        html: html, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <asdfkjas-12312-fasdf-12731-sajdfa@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/jsadfkjhaWUH123

}