import React, { useState } from 'react';
import { FaFilePdf, FaSpinner, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

// Placeholder image (replace with actual base64 or URL)
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...'; // Replace with real logo base64

const ReportGenerator = ({ inventory }) => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const generatePreview = () => {
    if (inventory.length > 0) {
      // Agrupar productos por nombre para evitar duplicados y combinar colores
      const uniqueProducts = [];
      inventory.forEach(item => {
        const existingProduct = uniqueProducts.find(p => p.nombre === item.nombre && item.es_principal === 1);
        if (!existingProduct) {
          uniqueProducts.push({
            ...item,
            colores: inventory
              .filter(i => i.nombre === item.nombre && i.es_principal === 1)
              .map(i => i.estado) // Suponiendo que 'estado' contiene el color
              .filter(color => color && color !== 'N/A')
              .join(', ')
          });
        }
      });

      const preview = `
        <div style="text-align: center; padding: 20px;">
          <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 15px;">
            <img src="${logoBase64}" alt="Logo Alquiladora Romero" style="width: 120px; height: auto;" />
            <div style="text-align: left;">
              <h2 style="font-size: 28px; font-weight: bold; color: #1a202c; margin: 0;">Alquiladora Romero</h2>
              <p style="font-size: 14px; color: #4a5568; margin: 5px 0;">Tel: 771 300 0849 | 709 600 5949</p>
              <p style="font-size: 14px; color: #4a5568; margin: 0;">Av. San Luis Potosí 58, Col. Tahui, Huajuapan de Reyes, Oaxaca, México</p>
            </div>
          </div>
          <hr style="border: 1px solid #e2e8f0; margin: 15px 0;" />
          <h3 style="font-size: 20px; font-weight: bold; color: #1a202c;">Reporte de Inventario - No. 0600</h3>
          <hr style="border: 1px solid #e2e8f0; margin: 15px 0;" />
          <p><strong style="color: #1a202c;">Cliente:</strong> Inventario General</p>
          <p><strong style="color: #1a202c;">Fecha:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true }).replace(/,/g, '')}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #cbd5e0; font-size: 12px;">
            <thead>
              <tr style="background-color: #edf2f7;">
                <th style="border: 1px solid #cbd5e0; padding: 6px; text-align: center; color: #1a202c; font-weight: bold;">Cant.</th>
                <th style="border: 1px solid #cbd5e0; padding: 6px; text-align: center; color: #1a202c; font-weight: bold;">Producto</th>
                <th style="border: 1px solid #cbd5e0; padding: 6px; text-align: center; color: #1a202c; font-weight: bold;">Precio</th>
                <th style="border: 1px solid #cbd5e0; padding: 6px; text-align: center; color: #1a202c; font-weight: bold;">Importe</th>
                <th style="border: 1px solid #cbd5e0; padding: 6px; text-align: center; color: #1a202c; font-weight: bold;">Colores</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueProducts
                .map((item, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f7fafc'};">
                    <td style="border: 1px solid #cbd5e0; padding: 4px; text-align: center; color: #4a5568;">${item.stock}</td>
                    <td style="border: 1px solid #cbd5e0; padding: 4px; text-align: left; color: #4a5568;">${item.nombre}</td>
                    <td style="border: 1px solid #cbd5e0; padding: 4px; text-align: center; color: #4a5568;">${item.precioAlquiler ? `$${item.precioAlquiler}` : 'N/A'}</td>
                    <td style="border: 1px solid #cbd5e0; padding: 4px; text-align: center; color: #4a5568;">${item.stock * (item.precioAlquiler || 0)}</td>
                    <td style="border: 1px solid #cbd5e0; padding: 4px; text-align: center; color: #4a5568;">${item.colores || 'N/A'}</td>
                  </tr>
                `).join('')}
              <tr style="background-color: #edf2f7;">
                <td colspan="4" style="border: 1px solid #cbd5e0; padding: 6px; text-align: right; color: #1a202c; font-weight: bold;">Total</td>
                <td style="border: 1px solid #cbd5e0; padding: 6px; text-align: center; color: #1a202c; font-weight: bold;">${uniqueProducts
                  .reduce((sum, item) => sum + (item.stock * (item.precioAlquiler || 0)), 0)
                  .toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 15px; font-size: 12px; color: #4a5568; text-align: left;"><strong style="color: #1a202c;">Notas:</strong> Este reporte refleja el estado del inventario al ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true }).replace(/,/g, '')}.</p>
          <p style="font-size: 12px; color: #4a5568; text-align: left; word-wrap: break-word; max-width: 100%;"><strong style="color: #1a202c;">Importe con letra:</strong> ${numberToWords(uniqueProducts
            .reduce((sum, item) => sum + (item.stock * (item.precioAlquiler || 0)), 0)
            .toFixed(2))} pesos.</p>
        </div>
      `;
      setPreviewData(preview);
      setShowPreview(true);
    }
  };

  const generatePDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Encabezado con imagen y texto en la misma línea
      const imgWidth = 35;
      const imgHeight = 35;
      doc.addImage(logoBase64, 'PNG', 85, 10, imgWidth, imgHeight);
      doc.setFontSize(24);
      doc.setTextColor(26, 32, 44);
      doc.text('Alquiladora Romero', 130, 28, { align: 'left' });
      doc.setFontSize(12);
      doc.setTextColor(74, 85, 104);
      doc.text('Tel: 771 300 0849 | 709 600 5949', 130, 35, { align: 'left' });
      doc.text('Av. San Luis Potosí 58, Col. Tahui, Huajuapan de Reyes, Oaxaca, México', 130, 42, { align: 'left' });
      doc.setLineWidth(1);
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 50, 190, 50);
      doc.setFontSize(18);
      doc.setTextColor(26, 32, 44);
      doc.text('Reporte de Inventario - No. 0600', 105, 60, { align: 'center' });
      doc.line(20, 65, 190, 65);

      // Datos del cliente y fecha
      doc.setFontSize(12);
      doc.setTextColor(74, 85, 104);
      doc.text('Cliente: Inventario General', 20, 75);
      doc.text(`Fecha: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true }).replace(/,/g, '')}`, 20, 82);

      // Datos de la tabla
      const uniqueProducts = [];
      inventory.forEach(item => {
        const existingProduct = uniqueProducts.find(p => p.nombre === item.nombre && item.es_principal === 1);
        if (!existingProduct) {
          uniqueProducts.push({
            ...item,
            colores: inventory
              .filter(i => i.nombre === item.nombre && i.es_principal === 1)
              .map(i => i.estado)
              .filter(color => color && color !== 'N/A')
              .join(', ')
          });
        }
      });

      const tableData = uniqueProducts.map(item => [
        item.stock,
        item.nombre,
        item.precioAlquiler ? `$${item.precioAlquiler}` : 'N/A',
        item.stock * (item.precioAlquiler || 0),
        item.colores || 'N/A'
      ]);
      const total = uniqueProducts
        .reduce((sum, item) => sum + (item.stock * (item.precioAlquiler || 0)), 0)
        .toFixed(2);

      autoTable(doc, {
        startY: 90,
        head: [['Cant.', 'Producto', 'Precio', 'Importe', 'Colores']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [237, 242, 247], textColor: [26, 32, 44], fontSize: 10, halign: 'center', fontStyle: 'bold' },
        bodyStyles: { textColor: [74, 85, 104], fontSize: 8, halign: 'center', fillColor: [item => item.index % 2 === 0 ? 255 : 247, 250, 252] },
        foot: [['', '', '', 'Total', total]],
        footStyles: { fillColor: [237, 242, 247], textColor: [26, 32, 44], fontStyle: 'bold', halign: 'right' },
        styles: { cellPadding: 4, fontSize: 8, lineWidth: 0.5, lineColor: [203, 213, 224] },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'left' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'left' } // Alineación izquierda para colores
        }
      });

      // Notas e importe con letra
      doc.setFontSize(10);
      doc.setTextColor(74, 85, 104);
      doc.text('Notas: Este reporte refleja el estado del inventario al ' + new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true }).replace(/,/g, '') + '.', 20, doc.lastAutoTable.finalY + 10);
      const importText = `Importe con letra: ${numberToWords(total)} pesos.`;
      const textWidth = doc.getTextWidth(importText);
      const maxWidth = 170;
      if (textWidth > maxWidth) {
        const lines = doc.splitTextToSize(importText, maxWidth);
        doc.text(lines, 20, doc.lastAutoTable.finalY + 18);
      } else {
        doc.text(importText, 20, doc.lastAutoTable.finalY + 18);
      }

      doc.save(`Reporte_Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generado y descargado correctamente.');
      setShowPreview(false);
    } catch (error) {
      console.error('Error generando el PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const numberToWords = (number) => {
    const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

    const num = Math.floor(number);
    if (num === 0) return 'cero';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      return tens[ten] + (unit > 0 ? ' y ' + units[unit] : '');
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      return units[hundred] + ' cien' + (rest > 0 ? ' ' + numberToWords(rest) : '');
    }
    return num.toString();
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
          <FaFilePdf className="text-yellow-600" />
          Generar Reportes
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={generatePreview}
            disabled={loading || inventory.length === 0}
            className={`group flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              loading || inventory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FaEye className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                <span>Previsualizar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-4xl">
            <h3 className="text-2xl font-bold mb-4 text-yellow-600">Previsualización del Reporte</h3>
            <div dangerouslySetInnerHTML={{ __html: previewData }} />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={generatePDF}
                disabled={loading}
                className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Generando...' : 'Guardar PDF'}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;