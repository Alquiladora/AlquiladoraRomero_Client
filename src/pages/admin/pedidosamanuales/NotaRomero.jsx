import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const NotaRomero = () => {
  const ref = useRef();

  const datos = {
    cliente: 'Juan Pérez',
    domicilio: 'Av. Hidalgo #123',
    ciudad: 'Huejutla',
    telefono: '7711234567',
    fecha: '2025-07-24',
    pedido: '0600',
    productos: [
      { cantidad: '3', descripcion: 'Sillas', precio: '10', importe: '30' },
      { cantidad: '2', descripcion: 'Mesas', precio: '50', importe: '100' },
    ],
    total: '130',
    anticipo: '50',
    resta: '80',
    letra: 'Ciento treinta pesos',
  };

  const generarPDF = () => {
    html2canvas(ref.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'letter');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('nota-romero.pdf');
    });
  };

  return (
    <div style={{ textAlign: 'center', background: '#eee', padding: '0' }}>
      <div
        ref={ref}
        style={{
          width: '794px',
          height: '1123px',
          padding: '40px 60px',
          fontFamily: 'Arial',
          fontSize: '12px',
          backgroundColor: 'white',
          color: 'black',
          margin: '0 auto',
          boxShadow: '0 0 15px rgba(0,0,0,0.3)',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* ENCABEZADO */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <img src="/nota.png" alt="logo" style={{ width: '140px' }} />
          <div style={{ textAlign: 'right', fontSize: '11px' }}>
            <div>
              <strong>Tel:</strong> 771 203 0090
            </div>
            <div>
              <strong>Facebook:</strong> Alquiladora Romero
            </div>
            <div style={{ color: 'red' }}>
              <strong>N° {datos.pedido}</strong>
            </div>
          </div>
        </div>

        {/* LE OFRECEMOS */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          LE OFRECEMOS: SERVICIO DE BANQUETES · BASE DE MESEROS · CERVEZA ·
          REFRESCO · HIELOS · MANTELERÍA · HIELERAS · LOZA · MOBILIARIO ·
          COMALES ·<br />
          CAFETERAS · PARRILLA PARA COCINAR · PARRILLA PARA TACOS · CHOCOLATERAS
          · ROCKOLAS · BRINCOLÍN · LONAS · TOLDOS · CARPAS · ESCALERAS ·
          ANDAMIOS · ARREGLOS FLORALES
        </div>

        {/* DATOS CLIENTE, DOMICILIO, CIUDAD */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                border: '1px solid black',
                padding: '3px',
                width: '70%',
              }}
            >
              <strong>CLIENTE:</strong> {datos.cliente}
            </div>
            <div
              style={{
                border: '1px solid black',
                padding: '3px',
                width: '30%',
              }}
            >
              <strong>TEL:</strong> {datos.telefono}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                border: '1px solid black',
                padding: '3px',
                width: '70%',
              }}
            >
              <strong>DOMICILIO:</strong> {datos.domicilio}
            </div>
            <div
              style={{
                border: '1px solid black',
                padding: '3px',
                width: '30%',
              }}
            >
              <strong>FECHA:</strong> {datos.fecha}
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid black',
            padding: '3px',
            marginBottom: '10px',
          }}
        >
          <strong>CIUDAD:</strong> {datos.ciudad}
        </div>

        {/* TABLA PRODUCTOS */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '16px',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: '10%',
                  border: '1px solid black',
                  padding: '4px',
                }}
              >
                Cantidad
              </th>
              <th
                style={{
                  width: '55%',
                  border: '1px solid black',
                  padding: '4px',
                }}
              >
                Descripción
              </th>
              <th
                style={{
                  width: '15%',
                  border: '1px solid black',
                  padding: '4px',
                }}
              >
                Precio Unit.
              </th>
              <th
                style={{
                  width: '20%',
                  border: '1px solid black',
                  padding: '4px',
                }}
              >
                Importe
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.productos.map((p, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  {p.cantidad}
                </td>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  {p.descripcion}
                </td>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  ${p.precio}
                </td>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  ${p.importe}
                </td>
              </tr>
            ))}
            {[...Array(10 - datos.productos.length)].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td style={{ border: '1px solid black', height: '30px' }}></td>
                <td style={{ border: '1px solid black' }}></td>
                <td style={{ border: '1px solid black' }}></td>
                <td style={{ border: '1px solid black' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* IMPORTE CON LETRA + TOTALES */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              border: '1px solid black',
              padding: '6px',
              fontSize: '11px',
              flex: 1,
              marginRight: '10px',
              height: '76px',
            }}
          >
            <strong>Importe con letra:</strong> {datos.letra}
          </div>
          <table style={{ borderCollapse: 'collapse', height: '76px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  <strong>Total</strong>
                </td>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  ${datos.total}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  <strong>Anticipo</strong>
                </td>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  ${datos.anticipo}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  <strong>Resta</strong>
                </td>
                <td style={{ border: '1px solid black', padding: '4px' }}>
                  ${datos.resta}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TEXTO LEGAL */}
        <p
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'left',
            marginBottom: '30px',
          }}
        >
          ME COMPROMETO A DEVOLVER EL MOBILIARIO AQUÍ DETALLADO EN LA FECHA
          ESTABLECIDA Y EN LAS CONDICIONES RECIBIDAS, EN CASO DE INCUMPLIMIENTO
          PAGARÉ EL IMPORTE DEL DÍA(S) O EL VALOR DE LO DETERIORADO.
        </p>

        {/* FIRMAS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 60px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div>__________________________</div>
            <div style={{ fontSize: '11px' }}>Nombre quien recibe</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div>__________________________</div>
            <div style={{ fontSize: '11px' }}>Firma del cliente</div>
          </div>
        </div>
      </div>

      <button
        onClick={generarPDF}
        style={{ marginTop: '30px', padding: '10px 20px' }}
      >
        📄 Descargar PDF
      </button>
    </div>
  );
};

export default NotaRomero;
