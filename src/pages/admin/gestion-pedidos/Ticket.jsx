import React from "react";
import { jsPDF } from "jspdf";
import {
    faTasks,
    faFilter,
    faSearch,
    faFileExport,
    faFileInvoice,
    faMapMarkerAlt,
    faEye,
    faChevronLeft,
    faChevronRight,
    faCalendarAlt,
    faTruck,
    faUser,
    faPhone,
    faClock,
    faCreditCard,
    faDollarSign,
    faCheckCircle,
    faBoxOpen,
    faUndo,
    faExclamationTriangle,
    faExclamationCircle,
    faTimes,
    faBan,
    faQuestionCircle,
    faPlus,
    faMinus,
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { toast } from "react-toastify";


const TicketCompra = ({ pedido, onClose, onSend }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Configuración del PDF
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Ticket de Compra", 105, 20, { align: "center" });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(255, 185, 0);
    doc.line(20, 30, 190, 30);

    // Detalles del pedido
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`ID de Rastreo: ${pedido.idRastreo}`, 20, 40);
    doc.text(`Cliente: ${pedido.cliente.nombre}`, 20, 50);
    doc.text(`Teléfono: ${pedido.cliente.telefono}`, 20, 60);
    doc.text(`Dirección: ${pedido.cliente.direccion}`, 20, 70);
    doc.text(`Fecha de Inicio: ${new Date(pedido.fechas.inicio).toLocaleDateString()}`, 20, 80);
    doc.text(`Fecha de Entrega: ${new Date(pedido.fechas.entrega).toLocaleDateString()}`, 20, 90);
    doc.text(`Días de Alquiler: ${pedido.fechas.diasAlquiler}`, 20, 100);
    doc.text(`Forma de Pago: ${pedido.pago.formaPago}`, 20, 110);
    doc.text(`Total: $${pedido.pago.total}`, 20, 120);
    doc.text(`Estado: ${pedido.estado}`, 20, 130);

    // Línea divisoria inferior
    doc.line(20, 140, 190, 140);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Gracias por su compra", 105, 150, { align: "center" });
    doc.text("Alquileres Pro - 2025", 105, 160, { align: "center" });

    return doc;
  };

  const handleSendTicket = (email) => {
    const doc = generatePDF();
    const pdfBlob = doc.output("blob");
    onSend(email, pdfBlob);
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Ingresa el correo al que se enviará el ticket de compra para el pedido{" "}
          <span className="font-semibold">{pedido.idRastreo}</span>.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            if (email) {
              handleSendTicket(email);
            } else {
              toast.error("Por favor, ingresa un correo válido.");
            }
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition"
            >
              Enviar Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCompra;