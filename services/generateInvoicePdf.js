import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
export const generateInvoicePdf = ({
  invoiceNumber,
  user,
  amount,
  description,
  paymentMethod,
  transactionId,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];
      const stream = new PassThrough();

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      const invoiceDate = new Date();
      const paymentDate = invoiceDate;
      doc.fontSize(20).text("RECHNUNG", { align: "center" });
      doc.moveDown();
      doc.fontSize(10)
        .text(`RECHNUNGSDATUM: ${invoiceDate.toLocaleDateString("de-DE")}`)
        .text(`LEISTUNGSDATUM: ${paymentDate.toLocaleDateString("de-DE")}`)
        .text(`RECHNUNGSNR.: ${invoiceNumber}`)
        .moveDown();
      doc.text(`Experando e.U.`)
        .text(`Neulinggasse 39/3/5`)
        .text(`1030 Wien`)
        .text(`FN 621901 k`)
        .text(`Firmenbuchgericht: Handelsgericht Wien`)
        .text(`+43 699 10964614`)
        .text(`office@experando.com`)
        .moveDown();
      doc.text("RECHNUNG AN:")
        .text(`${user.fullName}`)
        .text(`${user.address || ""}`)
        .text(`E-Mail: ${user.email}`)
        .moveDown();

      doc.text("Pos. Leistung Menge Einzelpreis Summe", { underline: true })
        .moveDown(0.5);

      doc.text(
        ` 1 €${(amount / 100).toFixed(2)} €${(amount / 100).toFixed(2)}`
      ).moveDown();

      doc.text(`Gesamtbetrag: €${(amount / 100).toFixed(2)}`).moveDown();
      doc.text("Zahlungsinformationen", { underline: true })
        .moveDown(0.5)
        .text(`Die Zahlung wurde über ${paymentMethod} erfolgreich durchgeführt.`)
        .text(`Transaktions-ID: ${transactionId}`)
        .moveDown();
      doc.text("Hinweise", { underline: true })
        .moveDown(0.5)
        .text(
          "• Experando e.U. wendet die Kleinunternehmerregelung an. Gemäß § 6 Abs 1 Z 27 UStG wird keine Umsatzsteuer berechnet oder ausgewiesen.\n" +
          "• Diese Rechnung wurde automatisch elektronisch erstellt und ist auch ohne Unterschrift gültig.\n" +
          "• Die auf dieser Rechnung angeführten Kundendaten wurden vom Nutzer selbst bereitgestellt.\n" +
          "• Bei Fragen zu dieser Rechnung kontaktieren Sie uns bitte unter office@experando.com\n" +
          "Vielen Dank für Ihre Nutzung von Experando!\n" +
          "Finden Sie Ihren passenden Handwerker – schnell & einfach"
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
export const generateContactFeeInvoicePdf = ({
  invoiceNumber,      
  craftsman,      
  amount = 500, 
  paymentMethod,
  transactionId,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];
      const stream = new PassThrough();

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const invoiceDate = new Date();

      doc.fontSize(16).text("RECHNUNG", { align: "center" });
      doc.moveDown(1);

      doc.fontSize(10)
        .text(`RECHNUNGSNR.: ${invoiceNumber}`)
        .text(`RECHNUNGSDATUM: ${invoiceDate.toLocaleDateString("de-DE")}`)
        .moveDown();
      doc.text("Experando e.U.")
        .text("Neulinggasse 39/3/5")
        .text("1030 Wien")
        .text("FN 621901 k")
        .text("Firmenbuchgericht: Handelsgericht Wien")
        .text("+43 699 10964614")
        .text("office@experando.com")
        .moveDown();

      doc.text("RECHNUNG AN:", { underline: true })
        .moveDown(0.5)
        .text(craftsman.fullName)
        .text(craftsman.address || "")
        .text(`E-Mail: ${craftsman.email}`)
        .moveDown();
      doc.text("Pos.  Leistung                                   Menge  Einzelpreis  Summe", {
        underline: true,
      });
      doc.moveDown(0.5);

      doc.moveDown();

      doc.fontSize(11)
        .text(`Gesamtbetrag: €${(amount / 100).toFixed(2)}`, { bold: true })
        .moveDown();

      doc.fontSize(10)
        .text("Zahlungsinformationen", { underline: true })
        .moveDown(0.5)
        .text(`Die Zahlung wurde über ${paymentMethod} erfolgreich durchgeführt.`)
        .text(`Transaktions-ID: ${transactionId}`)
        .moveDown();

      doc.text("Hinweise", { underline: true })
        .moveDown(0.5)
        .text(
          "• Experando e.U. wendet die Kleinunternehmerregelung an. " +
          "Gemäß § 6 Abs 1 Z 27 UStG wird keine Umsatzsteuer berechnet oder ausgewiesen.\n" +
          "• Diese Rechnung wurde automatisch elektronisch erstellt und ist auch ohne Unterschrift gültig.\n" +
          "• Die auf dieser Rechnung angeführten Kundendaten wurden vom Nutzer selbst bereitgestellt.\n" +
          "• Bei Fragen zu dieser Rechnung kontaktieren Sie uns bitte unter office@experando.com\n\n" +
          "Vielen Dank für Ihre Nutzung von Experando!\n" +
          "Finden Sie Ihren passenden Handwerker – schnell & einfach."
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};