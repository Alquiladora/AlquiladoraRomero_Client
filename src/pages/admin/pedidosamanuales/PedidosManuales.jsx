import React, { useEffect, useState } from 'react';

function PedidosManuales() {
  // Estado para almacenar la lista de pedidos
  const [pedidos, setPedidos] = useState([]);
  // Estado para manejar el formulario (crear/editar)
  const [formData, setFormData] = useState({
    idPedido: '',
    nombreCliente: '',
    metodoPago: '',
    estado: '',
    fechaRegistro: ''
  });
  // Estado para indicar si estamos editando (true) o agregando (false)
  const [isEditing, setIsEditing] = useState(false);

  // ==================================================
  // 1. OBTENER LISTA DE PEDIDOS (READ)
  // ==================================================
  const getPedidos = () => {
    fetch('/api/pedidosmanuales')
      .then((res) => res.json())
      .then((data) => {
        setPedidos(data);
      })
      .catch((error) => {
        console.error('Error al obtener los pedidos manuales:', error);
      });
  };

  useEffect(() => {
    getPedidos();
  }, []);

  // ==================================================
  // 2. CONTROL DEL FORMULARIO (ACTUALIZAR CAMPOS)
  // ==================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ==================================================
  // 3. CREAR UN NUEVO PEDIDO (CREATE)
  // ==================================================
  const handleCreate = () => {
    // Quitamos idPedido porque normalmente el backend lo genera
    const { idPedido, ...pedidoBody } = formData;

    fetch('/api/pedidosmanuales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoBody)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al crear el pedido');
        }
        return res.json();
      })
      .then(() => {
        // Refrescamos la lista de pedidos
        getPedidos();
        // Limpiar formulario
        resetForm();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // ==================================================
  // 4. PREPARAR FORMULARIO PARA EDICIÓN
  // ==================================================
  const handleEdit = (pedido) => {
    setIsEditing(true);
    setFormData({
      idPedido: pedido.idPedido,
      nombreCliente: pedido.nombreCliente,
      metodoPago: pedido.metodoPago,
      estado: pedido.estado,
      fechaRegistro: pedido.fechaRegistro
    });
  };

  // ==================================================
  // 5. ACTUALIZAR UN PEDIDO (UPDATE)
  // ==================================================
  const handleUpdate = () => {
    const id = formData.idPedido;

    // En algunos casos, el backend podría requerir que no le envíes `idPedido` en el JSON.
    // Ajusta según tu API.
    fetch(`/api/pedidosmanuales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al actualizar el pedido');
        }
        return res.json();
      })
      .then(() => {
        getPedidos();
        resetForm();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // ==================================================
  // 6. ELIMINAR UN PEDIDO (DELETE)
  // ==================================================
  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este pedido?')) {
      fetch(`/api/pedidosmanuales/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Error al eliminar el pedido');
          }
          return res.json();
        })
        .then(() => {
          // Refrescamos la lista
          getPedidos();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // ==================================================
  // 7. RESETEAR FORMULARIO
  // ==================================================
  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      idPedido: '',
      nombreCliente: '',
      metodoPago: '',
      estado: '',
      fechaRegistro: ''
    });
  };

  // ==================================================
  // 8. ACCIÓN AL ENVIAR EL FORMULARIO
  // ==================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <div style={{ margin: '20px' }}>
      <h2>Pedidos Manuales</h2>

      {/* SECCIÓN: FORMULARIO PARA CREAR/EDITAR */}
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h3>{isEditing ? 'Editar Pedido' : 'Crear Nuevo Pedido'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Campo: Nombre Cliente */}
          <div>
            <label>Nombre Cliente:</label><br />
            <input
              type="text"
              name="nombreCliente"
              value={formData.nombreCliente}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo: Método de Pago */}
          <div>
            <label>Método de Pago:</label><br />
            <input
              type="text"
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo: Estado */}
          <div>
            <label>Estado:</label><br />
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo: Fecha Registro */}
          <div>
            <label>Fecha Registro:</label><br />
            <input
              type="datetime-local"
              name="fechaRegistro"
              value={formData.fechaRegistro}
              onChange={handleChange}
              required
            />
          </div>

          <br />
          <button type="submit">
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* SECCIÓN: LISTADO DE PEDIDOS */}
      <table
        border="1"
        cellPadding="5"
        style={{ borderCollapse: 'collapse', width: '100%' }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Cliente</th>
            <th>Método de Pago</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.idPedido}>
              <td>{pedido.idPedido}</td>
              <td>{pedido.nombreCliente}</td>
              <td>{pedido.metodoPago}</td>
              <td>{pedido.estado}</td>
              <td>{pedido.fechaRegistro}</td>
              <td>
                <button onClick={() => handleEdit(pedido)}>Editar</button>
                <button onClick={() => handleDelete(pedido.idPedido)} style={{ marginLeft: '10px' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {/* Si no hay pedidos, podría mostrar un mensaje */}
          {pedidos.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No hay pedidos manuales registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PedidosManuales;
