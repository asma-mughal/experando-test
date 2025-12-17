import PDFDocument from "pdfkit";

export function generateInvoicePdf({ invoiceNumber, user, amount, description }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        return reject(new Error("Generated PDF is empty"));
      }

      resolve(pdfBuffer);
    });

    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Invoice #: ${invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text("Billed To:");
    doc.text(user.fullName);
    doc.text(user.email);
    doc.moveDown();

    doc.text(`Description: ${description}`);
    doc.text(`Amount Paid: $${(amount / 100).toFixed(2)}`);
    doc.moveDown();

    doc.text("Payment Status: Paid");
    doc.moveDown(2);

    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();
  });
}
