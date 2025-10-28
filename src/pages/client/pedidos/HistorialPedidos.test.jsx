

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HistorialPedidos from "./HistorailPedidos";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

jest.mock("../../../utils/AxiosConfig", () => ({
  get: jest.fn(),
}));

jest.mock("../../../hooks/ContextAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

const mockUseAuth = useAuth;
const mockApi = api;

describe("HistorialPedidos (Pruebas Unitarias)", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: "Test" },
      csrfToken: "test-token",
      isLoading: false,
    });

    mockApi.get.mockImplementation((url) => {
      if (url.includes("historial-pedidos")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [],
            paginacion: { totalPedidos: 0 },
          },
        });
      }
      if (url.includes("calificados")) {
        return Promise.resolve({ data: { success: true, pedidosCalificados: [] } });
      }
      return Promise.resolve({ data: { success: false } });
    });
  });

  afterEach(() => jest.clearAllMocks());

  test("1. Debe renderizar el título y el estado vacío", async () => {
    render(<HistorialPedidos />);
    expect(screen.getByText("Mis Pedidos")).toBeInTheDocument();

    await screen.findByText("No tienes pedidos registrados");
    expect(screen.getByText("No tienes pedidos registrados")).toBeInTheDocument();
  });

  test("2. Debe actualizar el estado del input de búsqueda", () => {
    render(<HistorialPedidos />);
    const input = screen.getByPlaceholderText("Buscar por número de pedido...");
    fireEvent.change(input, { target: { value: "TEST-123" } });
    expect(input).toHaveValue("TEST-123");
  });
});