import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Use html2canvas to capture the element
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution for better quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  
  // Initialize jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate dimensions
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // Add the captured image to the PDF
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // Add Footer with admin details and date
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    const date = new Date().toLocaleString();
    pdf.text(
      `Generated on: ${date} | Biofactor Logistics Admin Dashboard`,
      pdfWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  pdf.save(filename);
};
