import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HistorialPedidos from "./HistorailPedidos";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth"; 

const mockUseAuth = useAuth;
const mockApi = api;

describe("HistorialPedidos (Pruebas Unitarias)", () => {

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
            data: [], 
            paginacion: {
              paginaActual: 1,
              totalPaginas: 1,
              totalPedidos: 0,
            },
          },
        });
      }
      if (url.includes("api/pedidos/calificados")) {
        return Promise.resolve({
          data: { success: true, pedidosCalificados: [] },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  test("1. Debe renderizar el título y el estado vacío", async () => {
    render(<HistorialPedidos />);

   
    await waitFor(() => {
    
      expect(
        screen.getByText("Mis Pedidos")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("No tienes pedidos registrados")
    ).toBeInTheDocument();
  });

  test("2. Debe actualizar el estado del input de búsqueda", async () => {
    render(<HistorialPedidos />);

    // Espera a que cargue
    await waitFor(() => {
      expect(screen.getByText("Mis Pedidos")).toBeInTheDocument();
    });


    const searchInput = screen.getByPlaceholderText(
      "Buscar por número de pedido..."
    );
    
   
    fireEvent.change(searchInput, { target: { value: "RASTREO-123" } });

    
    expect(searchInput.value).toBe("RASTREO-123");
  });

  test("3. Debe cambiar la pestaña activa al hacer clic", async () => {
    render(<HistorialPedidos />);

   
    await waitFor(() => {
      expect(screen.getByText("Mis Pedidos")).toBeInTheDocument();
    });

    
    const todosTab = screen.getByRole("button", { name: /Todos los pedidos/ });
    expect(todosTab).toHaveClass("bg-indigo-600 text-white");

    
    const incidentesTab = screen.getByRole("button", { name: /Incidentes/ });
    expect(incidentesTab).not.toHaveClass("bg-indigo-600 text-white");
    
    fireEvent.click(incidentesTab);

 
    expect(incidentesTab).toHaveClass("bg-indigo-600 text-white");
  
    expect(todosTab).not.toHaveClass("bg-indigo-600 text-white");
  });
});