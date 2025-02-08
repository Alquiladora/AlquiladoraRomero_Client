import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  useTheme,
} from "@mui/material";
import {
  AccountCircle,
  AccessTime,
  Info,
  Computer,
  CheckCircle,
  Error,
  Warning,
} from "@mui/icons-material";

const Auditoria = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [filteredAuditorias, setFilteredAuditorias] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const theme = useTheme();

  useEffect(() => {
    const fetchAuditorias = async () => {
      try {
        const response = await axios.get(
          "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/auditoria/lista",
          { withCredentials: true }
        );
        setAuditorias(response.data);
        setFilteredAuditorias(response.data);
      } catch (error) {
        console.error("Error al obtener registros de auditoría:", error);
      }
    };

    fetchAuditorias();
  }, []);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    filterAuditorias(event.target.value, selectedYear);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    filterAuditorias(selectedMonth, event.target.value);
  };

  const filterAuditorias = (month, year) => {
    const filtered = auditorias.filter((auditoria) => {
      const auditDate = new Date(auditoria.fecha_hora);
      const auditMonth = auditDate.getMonth();
      const auditYear = auditDate.getFullYear();
      return (
        (month === "" || auditMonth === parseInt(month, 10)) &&
        auditYear === parseInt(year, 10)
      );
    });
    setFilteredAuditorias(filtered);
  };

  const getChipProps = (accion) => {
    switch (accion.toLowerCase()) {
      case "error":
        return { color: "error", icon: <Error /> };
      case "éxito":
      case "correcto":
      case "inicio de sesión exitoso":
        return { color: "success", icon: <CheckCircle /> };
      case "advertencia":
        return { color: "warning", icon: <Warning /> };
      default:
        return { color: "info", icon: <Info /> };
    }
  };

  const years = [];
  for (let i = 2024; i <= new Date().getFullYear(); i++) {
    years.push(i);
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        maxWidth: "900px",
        mx: "auto",
        bgcolor: theme.palette.background.default,
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        textAlign="center"
        color="text.primary"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        Registro de Auditoría
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por mes</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Filtrar por mes"
            >
              <MenuItem value="">Todos los meses</MenuItem>
              {Array.from({ length: 12 }, (_, index) => (
                <MenuItem key={index} value={index}>
                  {new Date(0, index).toLocaleString("default", {
                    month: "long",
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por año</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              label="Filtrar por año"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper
        elevation={3}
        sx={{
          maxHeight: "70vh",
          overflow: "auto",
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderRadius: 3,
          transition: "background-color 0.3s",
        }}
      >
        {filteredAuditorias.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              textAlign: "center",
              bgcolor: theme.palette.background.default,
              color: theme.palette.text.primary,
            }}
          >
            No hay registros de auditoría para el filtro seleccionado.
          </Alert>
        ) : (
          <List>
            {filteredAuditorias.map((auditoria) => (
              <Box key={auditoria.id}>
                <ListItem
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    mb: 2,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={1}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <AccountCircle />
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={11}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {auditoria.usuario || "Usuario desconocido"} -{" "}
                            {auditoria.correo}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Box
                              display="flex"
                              flexWrap="wrap"
                              alignItems="center"
                              gap={1}
                              mt={1}
                            >
                              <Chip
                                {...getChipProps(auditoria.accion)}
                                label={auditoria.accion}
                                variant="outlined"
                              />
                              <Chip
                                icon={<AccessTime />}
                                label={new Date(
                                  auditoria.fecha_hora
                                ).toLocaleString("es-MX", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                  hour12: true,
                                })}
                                variant="outlined"
                              />
                              <Chip
                                icon={<Computer />}
                                label={auditoria.ip}
                                variant="outlined"
                                color="secondary"
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              mt={1}
                            >
                              {auditoria.detalles}
                            </Typography>
                          </>
                        }
                      />
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Auditoria;
