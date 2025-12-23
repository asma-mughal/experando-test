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
export const sendInvoiceEmail = async ({ to, subject, pdfBuffer }) => {
  if (!pdfBuffer || pdfBuffer.length === 0) throw new Error("PDF buffer missing");

  const pdfStream = new PassThrough();
  pdfStream.end(pdfBuffer);

  const mailOptions = {
    from: `"Payments" <${SMTP_EMAIL}>`,
    to,
    subject,
    text: "Hallo,\n\nvielen Dank für Ihre Zahlung auf Experando. Ihre Rechnung befindet sich im Anhang.\n\nFreundliche Grüße,\nExperando-Team",
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






