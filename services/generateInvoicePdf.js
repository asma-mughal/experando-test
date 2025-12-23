import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
export const generateInvoicePdf = ({ invoiceNumber, user, amount, description }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = new PassThrough();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // --- PDF Content ---
      doc.fontSize(20).text("Ihre Zahlungsbestätigung – Experando", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Hallo ${user.fullName},`);
      doc.moveDown();
      doc.text("vielen Dank für Ihre Zahlung auf Experando.");
      doc.moveDown();
      doc.text("Hier finden Sie die Details Ihrer Transaktion:");
      doc.moveDown();

      doc.list([
        `Leistung: ${description}`,
        `Betrag: €${(amount / 100).toFixed(2)}`,
        `Zahlungsdatum: ${new Date().toLocaleDateString("de-DE")}`,
        `Zahlungsmethode: Kreditkarte`,
      ]);
      doc.moveDown();

      doc.text(
        "Ihre Rechnung im PDF-Format befindet sich im Anhang oder kann jederzeit in Ihrem Experando-Konto heruntergeladen werden."
      );
      doc.moveDown();
      doc.text(
        "Sollten Sie Fragen zu Ihrer Zahlung oder Rechnung haben, stehen wir Ihnen gerne zur Verfügung: office@experando.com"
      );
      doc.moveDown();
      doc.text("Freundliche Grüße");
      doc.text("Ihr Experando-Team");

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
