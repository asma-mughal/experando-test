import nodemailer from "nodemailer";
import { PassThrough } from "stream";
import dotenv from "dotenv";
dotenv.config();

const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD, // App password (NOT Gmail login password)
  },
});
export const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    from: `"Support" <${SMTP_EMAIL}>`,
    to: email,
    subject,
    text: message,
  };

  return transporter.sendMail(mailOptions);
};
export const sendInvoiceEmail = async ({ to, subject, pdfBuffer, user, description, amount, paymentMethod }) => {
  if (!pdfBuffer || pdfBuffer.length === 0) throw new Error("PDF buffer missing");

  const pdfStream = new PassThrough();
  pdfStream.end(pdfBuffer);

  const mailOptions = {
    from: `"Payments" <${SMTP_EMAIL}>`,
    to,
    subject: "Ihre Zahlungsbestätigung – Experando",
    text: `Hallo ${user?.fullName},
    
vielen Dank für Ihre Zahlung auf Experando.
Hier finden Sie die Details Ihrer Transaktion:
  • Leistung: ${description}
  • Betrag: €${(amount / 100)?.toFixed(2)}
  • Zahlungsdatum: ${new Date()?.toLocaleDateString("de-DE")}
  • Zahlungsmethode: ${paymentMethod}

Ihre Rechnung im PDF-Format befindet sich im Anhang oder kann jederzeit in Ihrem Experando-Konto heruntergeladen werden.

Sollten Sie Fragen zu Ihrer Zahlung oder Rechnung haben, stehen wir Ihnen gerne zur Verfügung:
office@experando.com

Freundliche Grüße
Ihr Experando-Team`,
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfStream,
        contentType: "application/pdf",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};







