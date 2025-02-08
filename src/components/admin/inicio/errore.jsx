import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  useMediaQuery,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  IconButton,
  Grid,
  Collapse,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  ErrorOutline,
} from '@mui/icons-material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';

const ErrorLogs = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchLogs();
    
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, filterLevel]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        'https://alquiladora-romero-backed-1.onrender.com/api/logs',
        {
          withCredentials: true,
        }
      );
     

      setLogs(response.data);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      setError('No se pudieron cargar los logs.');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (filterLevel) {
      filtered = filtered.filter((log) => log.level === filterLevel);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  // Paginación
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogsPerPageChange = (event) => {
    setLogsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterLevelChange = (event) => {
    setFilterLevel(event.target.value);
  };

  const levelColors = {
    error: 'error',
    warn: 'warning',
    info: 'info',
    debug: 'default',
  };

  const toggleCardExpansion = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registros de Errores
      </Typography>

      {/* Controles de filtrado */}
      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="filter-level-label">
              <FilterList /> Nivel
            </InputLabel>
            <Select
              labelId="filter-level-label"
              value={filterLevel}
              onChange={handleFilterLevelChange}
              label="Nivel"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="warn">Advertencia</MenuItem>
              <MenuItem value="info">Información</MenuItem>
              <MenuItem value="debug">Debug</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="logs-per-page-label">Por página</InputLabel>
            <Select
              labelId="logs-per-page-label"
              value={logsPerPage}
              onChange={handleLogsPerPageChange}
              label="Por página"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          {filteredLogs.length === 0 ? (
            <Alert severity="info">No se encontraron errores.</Alert>
          ) : (
            <Grid container spacing={2}>
              {currentLogs.map((log, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Fade in timeout={500}>
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor:
                          theme === 'dark' ? '#424242' : '#fafafa',
                        '&:hover': {
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Tooltip title="Nivel de error">
                            <ErrorOutline
                              color={levelColors[log.level] || 'default'}
                            />
                          </Tooltip>
                        }
                        action={
                          <Chip
                            label={log.level ? log.level.toUpperCase() : 'DESCONOCIDO'}
                            color={levelColors[log.level] || 'default'}
                            size="small"
                          />
                        }
                        title={log.message}
                        subheader={new Date(log.timestamp).toLocaleString()}
                      />
                      <CardActions disableSpacing>
                        <IconButton
                          onClick={() => toggleCardExpansion(index)}
                          aria-expanded={expandedCards[index]}
                          aria-label="mostrar más"
                          sx={{
                            transform: expandedCards[index]
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                          }}
                        >
                          <ExpandMore />
                        </IconButton>
                      </CardActions>
                      <Collapse
                        in={expandedCards[index]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <CardContent>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {log.stack || 'Sin detalles adicionales.'}
                          </Typography>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={4}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handleChangePage}
                color="primary"
                siblingCount={isMobile ? 0 : 1}
                boundaryCount={isMobile ? 0 : 1}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ErrorLogs;
