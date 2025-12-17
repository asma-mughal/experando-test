import nodemailer from "nodemailer";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";
import os from "os";
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


export const sendInvoiceEmail = async ({ to, subject, text, pdfBuffer }) => {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer missing");
  }

  // ✅ Create temp file
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `invoice-${Date.now()}.pdf`);

  fs.writeFileSync(filePath, pdfBuffer);

  const mailOptions = {
    from: `"Payments" <${SMTP_EMAIL}>`,
    to,
    subject,
    html: `
      <p>Hi,</p>
      <p>Your payment was successful.</p>
      <p><strong>Please find your invoice attached.</strong></p>
      <p>Thank you.</p>
    `,
    attachments: [
      {
        filename: "invoice.pdf",
        path: filePath, // 🔥 THIS IS THE KEY
        contentType: "application/pdf",
      },
    ],
  };

  const result = await transporter.sendMail(mailOptions);

  // 🧹 Cleanup temp file
  fs.unlinkSync(filePath);

  return result;
};



