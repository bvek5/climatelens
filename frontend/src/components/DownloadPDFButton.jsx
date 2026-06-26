import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function DownloadPDFButton({
  targetId,
  fileName = "climatelens-report.pdf",
  reportTitle = "ClimateLens Report",
}) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    const reportElement = document.getElementById(targetId);

    if (!reportElement) {
      alert("Generate the report before downloading it.");
      return;
    }

    setDownloading(true);

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const titleSpace = 18;
      const usableWidth = pageWidth - margin * 2;
      const usablePageHeight = pageHeight - margin * 2 - titleSpace;

      const imageHeight = (canvas.height * usableWidth) / canvas.width;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(15, 118, 110);
      pdf.text(reportTitle, margin, 12);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        margin,
        17
      );

      let remainingHeight = imageHeight;
      let imagePosition = margin + titleSpace;

      pdf.addImage(
        imageData,
        "PNG",
        margin,
        imagePosition,
        usableWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      remainingHeight -= usablePageHeight;

      while (remainingHeight > 0) {
        pdf.addPage();

        imagePosition =
          margin + titleSpace - (imageHeight - remainingHeight);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(15, 118, 110);
        pdf.text(reportTitle, margin, 12);

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          imagePosition,
          usableWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        remainingHeight -= usablePageHeight;
      }

      const safeFileName = fileName
        .replace(/[^a-z0-9._-]/gi, "-")
        .replace(/-+/g, "-");

      pdf.save(safeFileName);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("The PDF could not be created. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      className="download-pdf-button"
      onClick={downloadPDF}
      disabled={downloading}
    >
      {downloading ? "Creating PDF..." : "📄 Download PDF Report"}
    </button>
  );
}

export default DownloadPDFButton;