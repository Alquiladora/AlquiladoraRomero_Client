import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../utils/AxiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('../../../hooks/ContextAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

import HistorialPedidos from './HistorailPedidos';
import api from '../../../utils/AxiosConfig';
import { useAuth } from '../../../hooks/ContextAuth';

const mockUseAuth = useAuth;
const mockApi = api;

const mockOrders = [
  {
    idPedido: 1,
    idRastreo: 'RASTREO-001',
    estado: 'Confirmado',
    fechaInicio: '2025-10-26T10:00:00.000Z',
    totalPagar: '150.00',
  },
  {
    idPedido: 2,
    idRastreo: 'RASTREO-002',
    estado: 'Devuelto',
    fechaInicio: '2025-10-25T10:00:00.000Z',
    totalPagar: '300.50',
  },
  {
    idPedido: 3,
    idRastreo: 'RASTREO-003',
    estado: 'Incidente',
    fechaInicio: '2025-10-24T10:00:00.000Z',
    totalPagar: '50.00',
  },
];

const mockOrderDetails = {
  success: true,
  pedido: {
    idPedido: 1,
    idRastreo: 'RASTREO-001',
    estado: 'Confirmado',
    direccionEnvio: { nombre: 'Juan', apellido: 'Perez' },
    productos: [{ producto: 'Silla Plegable' }],
  },
};

describe('HistorialPedidos (Pruebas de Integración)', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, nombre: 'Usuario' },
      csrfToken: 'test-csrf-token',
      isLoading: false,
    });

    mockApi.get.mockImplementation((url) => {
      if (url.includes('historial-pedidos')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const estado = params.get('estado');
        let data = mockOrders;
        if (estado && estado !== 'Todos') {
          data = mockOrders.filter((p) => p.estado === estado);
        }
        return Promise.resolve({
          data: {
            success: true,
            data,
            paginacion: { totalPedidos: data.length },
          },
        });
      }
      if (url.includes('calificados')) {
        return Promise.resolve({
          data: { success: true, pedidosCalificados: [3] },
        });
      }
      if (url.includes('detalles-pedido/1')) {
        return Promise.resolve({ data: mockOrderDetails });
      }
      return Promise.resolve({ data: { success: false } });
    });
  });

  afterEach(() => jest.clearAllMocks());

  test('1. Debe cargar y mostrar la lista de pedidos', async () => {
    render(<HistorialPedidos />);
    const cards = await screen.findAllByRole('button', {
      name: /Ver detalles/,
    });
    expect(cards).toHaveLength(3);
    expect(screen.getByText(/Mostrando 3 de 3 pedidos/)).toBeInTheDocument();
  });

  test('2. Debe filtrar los pedidos al hacer clic en una pestaña', async () => {
    render(<HistorialPedidos />);
    await screen.findAllByRole('button', { name: /Ver detalles/ });

    fireEvent.click(screen.getByRole('button', { name: /Incidentes/ }));
    await waitFor(() => {
      expect(screen.queryByText('RASTREO-001')).not.toBeInTheDocument();
      expect(screen.getAllByText('RASTREO-003')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('button', { name: /Entregados/ }));
    await waitFor(() => {
      expect(screen.getAllByText('RASTREO-002')).toHaveLength(2);
      expect(screen.queryByText('RASTREO-003')).not.toBeInTheDocument();
    });
  });

  test("3. Debe abrir el modal de detalles al hacer clic en 'Ver detalles'", async () => {
    render(<HistorialPedidos />);
    const buttons = await screen.findAllByRole('button', {
      name: 'Ver detalles',
    });
    fireEvent.click(buttons[0]);
    await waitFor(() =>
      expect(screen.getByText(/Detalles del Pedido/)).toBeInTheDocument()
    );
  });

  test("4. Debe mostrar el botón 'Evaluar Pedido' solo para pedidos elegibles", async () => {
    render(<HistorialPedidos />);
    await screen.findAllByRole('button', { name: /Ver detalles/ });

    const evaluateButtons = screen.getAllByText('Evaluar Pedido');
    expect(evaluateButtons).toHaveLength(1);
    expect(evaluateButtons[0]).toBeInTheDocument();
  });

  test('5. Debe abrir el modal de evaluación al hacer clic', async () => {
    render(<HistorialPedidos />);
    const button = await screen.findByText('Evaluar Pedido');
    fireEvent.click(button);
    await screen.findByText(/Evaluar Servicio/);
  });
});
