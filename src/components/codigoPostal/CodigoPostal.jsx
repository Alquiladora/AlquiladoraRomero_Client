import React, { useState, useEffect } from "react";
import axios from "axios";

const FetchPostalData = ({ codigoPostal, onDataFetched }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    estados: [],
    municipios: [],
    localidades: [],
  });

  useEffect(() => {
    // Solo consulta si el código postal es válido (5 dígitos)
    if (!codigoPostal || !/^\d{5}$/.test(codigoPostal)) return;

    setLoading(true);
    setError("");
    const url = `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${codigoPostal}&per_page=100`;

    axios
      .get(url)
      .then((response) => {
        if (
          response.data &&
          response.data.zip_codes &&
          response.data.zip_codes.length > 0
        ) {
          const estados = [
            ...new Set(response.data.zip_codes.map((item) => item.d_estado)),
          ];
          const municipios = [
            ...new Set(response.data.zip_codes.map((item) => item.d_mnpio)),
          ];
          const localidades = [
            ...new Set(response.data.zip_codes.map((item) => item.d_asenta)),
          ];

          const newData = { estados, municipios, localidades };
          setData(newData);
          console.log("DATIS OBTENIDOS DE COIDGO POSTAL ",)

          if (onDataFetched) {
            onDataFetched(newData);
          }
        } else {
          setError("Código postal no encontrado.");
          setData({ estados: [], municipios: [], localidades: [] });
          if (onDataFetched) {
            onDataFetched({ estados: [], municipios: [], localidades: [] });
          }
        }
      })
      .catch((err) => {
        setError("Error al cargar los datos.");
        setData({ estados: [], municipios: [], localidades: [] });
        if (onDataFetched) {
          onDataFetched({ estados: [], municipios: [], localidades: [] });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [codigoPostal, onDataFetched]);

  return (
    <div>
      {loading && <div>Cargando datos...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && data.estados.length > 0 && (
        <div>
          <p>
            <strong>Estado:</strong> {data.estados.join(", ")}
          </p>
          <p>
            <strong>Municipio:</strong> {data.municipios.join(", ")}
          </p>
          <p>
            <strong>Localidad:</strong> {data.localidades.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default FetchPostalData;
