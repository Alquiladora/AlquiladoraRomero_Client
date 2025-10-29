import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const TicketCompra = ({ pedido, onClose }) => {
  const [email, setEmail] = useState('');

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header with decorative elements
    doc.setFillColor(0, 51, 102); // Blue background
    doc.rect(0, 0, 210, 45, 'F');

    doc.setDrawColor(255, 255, 255); // White lines for decoration
    doc.setLineWidth(1);
    // Left decorative lines
    doc.line(15, 10, 25, 15);
    doc.line(15, 15, 25, 10);
    doc.line(15, 20, 25, 25);
    doc.line(15, 25, 25, 20);
    // Right decorative lines
    doc.line(185, 10, 195, 15);
    doc.line(185, 15, 195, 10);
    doc.line(185, 20, 195, 25);
    doc.line(185, 25, 195, 20);

    doc.setTextColor(255, 255, 255); // White text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('alquileres', 70, 20);
    doc.setFontSize(24);
    doc.text('Romero', 115, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('TEL.: 771 300 0849', 145, 10);
    doc.text('TEL.: 709 000 3949', 145, 15);
    doc.text('Alquileres Romero', 145, 20);

    // Pedido number and QR placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(165, 25, 40, 15, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('PEDIDO', 175, 32);
    doc.setFontSize(14);
    doc.text(`No ${pedido.idRastreo || '0600'}`, 175, 38);

    doc.setDrawColor(0, 0, 0);
    doc.rect(175, 5, 15, 15); // QR placeholder
    doc.setFontSize(6);
    doc.text('QR', 180, 13);

    doc.setFontSize(8);
    doc.text('CEL.', 155, 40);
    doc.text('771 203 0090', 165, 40);

    // Separator line
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(2);
    doc.line(10, 45, 200, 45);

    // Services offered
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('LE OFRECEMOS:', 15, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      '• SERVICIO DE BANQUETES • BASE DE MESEROS • CERVEZA • REFRESCO •',
      15,
      62
    );
    doc.text(
      '• HIELOS • MANTELERÍA • HIELERAS • LOZA • MOBILIARIO • COMALES •',
      15,
      68
    );
    doc.text(
      '• ESTUFAS • PARRILLA PARA COCINAR • PARRILLA • CAFETERAS •',
      15,
      74
    );
    doc.text(
      '• CHOCOLATERAS • ROCKOLAS • BRINCOLIN • LONAS • TOLDOS • CARPAS •',
      15,
      80
    );
    doc.text('• ESCALERAS • ANDAMIOS • ARREGLOS FLORALES •', 15, 86);

    // Address
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(
      'AV. SAN LUIS POTOSÍ #58  COL. TAHUIZÁN, HUEJUTLA DE REYES, HGO.- MÉXICO',
      15,
      95
    );

    // Client Info with borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(15, 105, 120, 8); // Cliente
    doc.rect(15, 113, 120, 8); // Domicilio
    doc.rect(15, 121, 60, 8); // Ciudad
    doc.rect(135, 105, 60, 8); // Tel
    doc.rect(135, 113, 60, 8); // Fecha

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CLIENTE:', 17, 111);
    doc.text('DOMICILIO:', 17, 119);
    doc.text('CIUDAD:', 17, 127);
    doc.text('TEL.', 137, 111);
    doc.text('FECHA:', 137, 119);

    doc.setFont('helvetica', 'normal');
    doc.text(pedido.cliente.nombre || '', 45, 111);
    doc.text(pedido.cliente.direccion || '', 45, 119);
    doc.text('Huejutla de Reyes', 35, 127); // Placeholder for city
    doc.text(pedido.cliente.telefono || '', 150, 111);
    doc.text(
      new Date(pedido.fechas.inicio).toLocaleDateString() || '',
      155,
      119
    );

    // Products Table
    let tableY = 140;
    doc.setFillColor(173, 216, 230); // Light blue background
    doc.rect(15, tableY, 180, 10, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.rect(15, tableY, 30, 10); // Cantidad
    doc.rect(45, tableY, 90, 10); // Descripción
    doc.rect(135, tableY, 30, 10); // Precio Unit.
    doc.rect(165, tableY, 30, 10); // Importe

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CANTIDAD', 25, tableY + 7);
    doc.text('DESCRIPCIÓN', 80, tableY + 7);
    doc.text('PRECIO UNIT.', 145, tableY + 7);
    doc.text('IMPORTE', 175, tableY + 7);

    tableY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    pedido.productos.forEach((item, index) => {
      doc.rect(15, tableY, 30, 8);
      doc.rect(45, tableY, 90, 8);
      doc.rect(135, tableY, 30, 8);
      doc.rect(165, tableY, 30, 8);
      doc.text(item.cantidad.toString(), 28, tableY + 5);
      doc.text(`${item.nombre} (${item.color})`, 47, tableY + 5);
      doc.text(`$${item.precioUnitario}`, 148, tableY + 5);
      doc.text(`$${item.subtotal}`, 178, tableY + 5);
      tableY += 8;
    });
    // Add empty rows to match the 12-row design
    for (let i = 0; i < 12 - pedido.productos.length; i++) {
      doc.rect(15, tableY, 30, 8);
      doc.rect(45, tableY, 90, 8);
      doc.rect(135, tableY, 30, 8);
      doc.rect(165, tableY, 30, 8);
      tableY += 8;
    }

    // Totals Section
    tableY += 5;
    doc.rect(15, tableY, 120, 20); // Importe con letra
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('IMPORTE CON LETRA:', 17, tableY + 7);

    doc.rect(135, tableY, 35, 6); // Total
    doc.rect(170, tableY, 25, 6);
    doc.text('TOTAL $', 145, tableY + 4);
    doc.text(pedido.pago.total || '0.00', 175, tableY + 4);

    doc.rect(135, tableY + 6, 35, 6); // Anticipo
    doc.rect(170, tableY + 6, 25, 6);
    doc.text('ANTICIPO $', 140, tableY + 10);
    doc.text('0.00', 175, tableY + 10);

    doc.rect(135, tableY + 12, 35, 6); // Resta
    doc.rect(170, tableY + 12, 25, 6);
    doc.text('RESTA $', 145, tableY + 16);
    doc.text(pedido.pago.total || '0.00', 175, tableY + 16);

    // Construction Material Section
    tableY += 30;
    doc.setFillColor(0, 51, 102);
    doc.rect(15, tableY, 60, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('MATERIAL', 25, tableY + 7);
    doc.text('PARA CONSTRUCCIÓN', 18, tableY + 13);
    doc.setFontSize(8);
    doc.text('• PIEDRA • GRAVA • ARENA •', 17, tableY + 20);

    // Terms and Conditions
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      'ME COMPROMETO A DEVOLVER EL MOBILIARIO AQUÍ DETALLADO EN LA FECHA',
      80,
      tableY + 5
    );
    doc.text(
      'ESTABLECIDA Y EN LAS CONDICIONES RECIBIDAS, EN CASO DE INCUMPLIMIENTO',
      80,
      tableY + 10
    );
    doc.text(
      'PAGARÉ EL IMPORTE DEL DÍA(S) Ó EL VALOR DE LO DETERIORADO.',
      80,
      tableY + 15
    );

    // Carnicería Section
    tableY += 30;
    doc.setFillColor(0, 51, 102);
    doc.rect(15, tableY, 60, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CARNICERÍA', 25, tableY + 8);
    doc.setFontSize(10);
    doc.text('"HNOS. ROMERO"', 20, tableY + 15);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('LNS. 91  TEL.: 896 1617', 80, tableY + 5);
    doc.text('PEDIDOS AL DOMICILIO', 80, tableY + 12);

    // Signatures
    tableY += 25;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, tableY + 10, 70, tableY + 10); // Nombre
    doc.line(15, tableY + 20, 70, tableY + 20); // Firma
    doc.line(125, tableY + 10, 180, tableY + 10); // Firma cliente
    doc.line(125, tableY + 20, 180, tableY + 20); // Acepto

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NOMBRE DE QUIÉN RECIBE', 15, tableY + 5);
    doc.text('FIRMA DEL CLIENTE', 125, tableY + 5);
    doc.text('FIRMA DEL CLIENTE', 15, tableY + 15);
    doc.text('ACEPTO', 125, tableY + 15);
    doc.text('ACEPTO', 15, tableY + 25);
    doc.text('ACEPTO', 125, tableY + 25);

    return doc;
  };

  const handleSavePDF = () => {
    const doc = generatePDF();
    doc.save(`Ticket_${pedido.idRastreo}.pdf`);
    toast.success('PDF guardado exitosamente.');
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (email) {
      console.log(`Sending PDF to ${email}`);
      toast.success(`Ticket enviado a ${email}`);
      onClose();
    } else {
      toast.error('Por favor, ingresa un correo válido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Generar Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold dark:text-white">
            Detalles del Pedido
          </h3>
          <p className="dark:text-gray-300">
            <strong>Cliente:</strong> {pedido.cliente.nombre}
          </p>
          <p className="dark:text-gray-300">
            <strong>Domicilio:</strong> {pedido.cliente.direccion}
          </p>
          <p className="dark:text-gray-300">
            <strong>Teléfono:</strong> {pedido.cliente.telefono}
          </p>
          <p className="dark:text-gray-300">
            <strong>Fecha:</strong>{' '}
            {new Date(pedido.fechas.inicio).toLocaleDateString()}
          </p>
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr className="border-b bg-blue-100 dark:bg-blue-900">
                <th className="border p-1 text-xs dark:text-white">Cantidad</th>
                <th className="border p-1 text-xs dark:text-white">
                  Descripción
                </th>
                <th className="border p-1 text-xs dark:text-white">
                  Precio Unit.
                </th>
                <th className="border p-1 text-xs dark:text-white">Importe</th>
              </tr>
            </thead>
            <tbody>
              {pedido.productos.map((item, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? 'bg-gray-50 dark:bg-gray-700'
                      : 'bg-white dark:bg-gray-800'
                  }
                >
                  <td className="border p-1 text-center text-sm dark:text-gray-300">
                    {item.cantidad}
                  </td>
                  <td className="border p-1 text-sm dark:text-gray-300">
                    {item.nombre} ({item.color})
                  </td>
                  <td className="border p-1 text-right text-sm dark:text-gray-300">
                    ${item.precioUnitario}
                  </td>
                  <td className="border p-1 text-right text-sm dark:text-gray-300">
                    ${item.subtotal}
                  </td>
                </tr>
              ))}
              {Array.from({ length: 12 - pedido.productos.length }).map(
                (_, index) => (
                  <tr
                    key={`empty-${index}`}
                    className="bg-white dark:bg-gray-800"
                  >
                    <td className="border p-1"></td>
                    <td className="border p-1"></td>
                    <td className="border p-1"></td>
                    <td className="border p-1"></td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded">
            <p className="dark:text-white">
              <strong>Total:</strong> ${pedido.pago.total}
            </p>
            <p className="dark:text-white">
              <strong>Anticipo:</strong> $0.00
            </p>
            <p className="dark:text-white">
              <strong>Resta:</strong> ${pedido.pago.total}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correo Electrónico (Opcional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSavePDF}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition"
          >
            Guardar PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
          >
            Enviar por Correo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketCompra;
