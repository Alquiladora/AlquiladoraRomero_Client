import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import HistorialPedidos from "./HistorialPedidos";
import api from "../../../utils/AxiosConfig"; 
import { useAuth } from "../../../hooks/ContextAuth"; 
import { es } from "date-fns/locale";
import { format } from "date-fns";

const mockUseAuth = useAuth;
const mockApi = api;


const mockOrders = [
  {
    idPedido: 1,
    idRastreo: "RASTREO-001",
    estado: "Confirmado",
    fechaInicio: "2025-10-26T10:00:00.000Z",
    totalPagar: "150.00",
    nombreCliente: "Juan Perez",
    numeroDeProductos: 2,
    fotosProductos: '["https://via.placeholder.com/80"]',
  },
  {
    idPedido: 2,
    idRastreo: "RASTREO-002",
    estado: "Devuelto", 
    fechaInicio: "2025-10-25T10:00:00.000Z",
    totalPagar: "300.50",
    nombreCliente: "Ana Lopez",
    numeroDeProductos: 1,
    fotosProductos: '[]',
  },
  {
    idPedido: 3,
    idRastreo: "RASTREO-003",
    estado: "Incidente",
    fechaInicio: "2025-10-24T10:00:00.000Z",
    totalPagar: "50.00",
    nombreCliente: "Carlos Sanchez",
    numeroDeProductos: 3,
    fotosProductos: '["https://via.placeholder.com/80", "https://via.placeholder.com/80"]',
  },
];

const mockOrderDetails = {
  success: true,
  pedido: {
    idPedido: 1,
    idRastreo: "RASTREO-001",
    estado: "Confirmado",
    totalPagar: "150.00",
    direccionEnvio: {
      nombre: "Juan",
      apellido: "Perez",
      telefono: "123456789",
      direccion: "Calle Falsa 123",
      localidad: "Centro",
      municipio: "Poza Rica",
      estado: "Veracruz",
      pais: "México",
      codigoPostal: "93210",
    },
    productos: [
      {
        producto: "Silla Plegable",
        cantidad: 2,
        precioUnitario: "75.00",
        subtotal: "150.00",
        fotoProducto: "https://via.placeholder.com/80",
        estadoProducto: "Completo",
        observaciones: null,
      },
    ],
  },
};

describe("HistorialPedidos (Pruebas de Integración)", () => {
  beforeEach(() => {
  
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: "Usuario" },
      csrfToken: "test-csrf-token",
      isLoading: false,
    });

    
    mockApi.get.mockImplementation((url) => {
      if (url.includes("api/pedidos/historial-pedidos")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockOrders,
            paginacion: {
              paginaActual: 1,
              totalPaginas: 1,
              totalPedidos: mockOrders.length,
            },
          },
        });
      }
      if (url.includes("api/pedidos/calificados")) {
    
        return Promise.resolve({
          data: { success: true, pedidosCalificados: [3] },
        });
      }
      if (url.includes("api/pedidos/detalles-pedido/1")) {
        return Promise.resolve(mockOrderDetails);
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("1. Debe cargar y mostrar la lista de pedidos", async () => {
    render(<HistorialPedidos />);

   
    await waitFor(() => {
      expect(screen.getByText("RASTREO-001")).toBeInTheDocument();
      expect(screen.getByText("RASTREO-002")).toBeInTheDocument();
      expect(screen.getByText("RASTREO-003")).toBeInTheDocument();
    });


    expect(screen.getByText(/Mostrando 3 de 3 pedidos/)).toBeInTheDocument();
  });

  test("2. Debe filtrar los pedidos al hacer clic en una pestaña", async () => {
    render(<HistorialPedidos />);

    await waitFor(() => {
      expect(screen.getByText("RASTREO-001")).toBeInTheDocument();
    });


    expect(screen.getByText("RASTREO-001")).toBeVisible();
    expect(screen.getByText("RASTREO-002")).toBeVisible();
    expect(screen.getByText("RASTREO-003")).toBeVisible();


    const incidentesTab = screen.getByRole("button", { name: /Incidentes/ });
    fireEvent.click(incidentesTab);

  
    expect(screen.queryByText("RASTREO-001")).not.toBeInTheDocument();
    expect(screen.queryByText("RASTREO-002")).not.toBeInTheDocument();
    expect(screen.getByText("RASTREO-003")).toBeVisible();

 
    const entregadosTab = screen.getByRole("button", { name: /Entregados/ });
    fireEvent.click(entregadosTab);


    expect(screen.queryByText("RASTREO-001")).not.toBeInTheDocument();
    expect(screen.getByText("RASTREO-002")).toBeVisible();
    expect(screen.queryByText("RASTREO-003")).not.toBeInTheDocument();
  });

  test("3. Debe abrir el modal de detalles al hacer clic en 'Ver detalles'", async () => {
    render(<HistorialPedidos />);

    await waitFor(() => {
      expect(screen.getByText("RASTREO-001")).toBeInTheDocument();
    });

   
    const detailButtons = screen.getAllByRole("button", { name: "Ver detalles" });
    fireEvent.click(detailButtons[0]);

    
    await waitFor(() => {
    
      expect(screen.getByText("Detalles del Pedido #1")).toBeInTheDocument();
     
      expect(mockApi.get).toHaveBeenCalledWith(
        "api/pedidos/detalles-pedido/1",
        expect.any(Object)
      );
      
      expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    
      expect(screen.getByText("Silla Plegable")).toBeInTheDocument();
    });
  });

  test("4. Debe mostrar el botón 'Evaluar Pedido' solo para pedidos elegibles", async () => {
    render(<HistorialPedidos />);

    await waitFor(() => {
      expect(screen.getByText("RASTREO-001")).toBeInTheDocument();
    });


    const order1 = screen.getByText("RASTREO-001").closest("div.overflow-hidden");
    expect(
      order1.querySelector('button[aria-label="Evaluar Pedido"]')
    ).not.toBeInTheDocument();


    const order2 = screen.getByText("RASTREO-002").closest("div.overflow-hidden");
    const reviewButtonOrder2 = Array.from(
      order2.querySelectorAll("button")
    ).find((btn) => btn.textContent.includes("Evaluar Pedido"));
    expect(reviewButtonOrder2).toBeInTheDocument();

   
    const order3 = screen.getByText("RASTREO-003").closest("div.overflow-hidden");
    expect(
      order3.querySelector('button[aria-label="Evaluar Pedido"]')
    ).not.toBeInTheDocument();
  });

  test("5. Debe abrir el modal de evaluación al hacer clic", async () => {
    render(<HistorialPedidos />);

    await waitFor(() => {
      expect(screen.getByText("RASTREO-002")).toBeInTheDocument();
    });

  
    const order2 = screen.getByText("RASTREO-002").closest("div.overflow-hidden");
    const reviewButton = Array.from(order2.querySelectorAll("button")).find(
      (btn) => btn.textContent.includes("Evaluar Pedido")
    );

    fireEvent.click(reviewButton);

  
    await waitFor(() => {
      expect(
        screen.getByText("Evaluar Servicio de Alquiler")
      ).toBeInTheDocument();
      expect(
        screen.getByText("¿Qué tan satisfecho estás con el Pedido #2?")
      ).toBeInTheDocument();
    });

    const starButtons = screen.getAllByTestId("fa-icon");
    fireEvent.click(starButtons[3]); 
    
   
  });
});