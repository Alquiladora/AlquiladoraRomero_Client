
import React, { useEffect, useState } from 'react';

import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Box,
    CircularProgress,
    Alert,
    TablePagination,
    Dialog,
    Grid,
    DialogContent,
    Chip,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { Visibility, ArrowBack } from '@mui/icons-material';
import api from '../../../../utils/AxiosConfig';


const HistorialPoliticas = ({ onNavigate }) => {
    const [politicas, setPoliticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados para el modal
    const [openModal, setOpenModal] = useState(false);
    const [selectedPolitica, setSelectedPolitica] = useState(null);


    useEffect(() => {
        fetchPoliticas();

    }, []);

    const fetchPoliticas = async () => {
        try {
            const response = await api.get('/api/politicas', { withCredentials: true });
            setPoliticas(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error al obtener las políticas:', err);
            setError('No se pudieron cargar las políticas.');
            setLoading(false);
        }
    };

    // Funciones para manejar la paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Datos a mostrar según la paginación
    const paginatedPoliticas = politicas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Funciones para manejar el modal
    const handleOpenModal = (politica) => {
        setSelectedPolitica(politica);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setSelectedPolitica(null);
        setOpenModal(false);
    };

 

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );

    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Container
            className="bg-white dark:bg-gray-900 transition-colors duration-300 p-4 md:p-6 lg:p-8"
            maxWidth="lg"
        >

            <Box className="mb-4 flex justify-start">
                <IconButton
                     onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("Politicas");
                      }}
                    color="primary"
                    aria-label="Regresar a la página principal"
                    className="dark:text-gray-100"
                >
                    <ArrowBack />
                </IconButton>
            </Box>

            {/* Título */}
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                className="text-gray-800 dark:text-gray-100 transition-colors duration-300 font-extrabold mb-6"
            >
                Historial de Políticas de Privacidad
            </Typography>


            <Paper className="overflow-x-auto transition-colors duration-300 bg-white dark:bg-gray-800 shadow-md">
                <Table className="min-w-full">
                    <TableHead>
                        <TableRow className="bg-yellow-100 dark:bg-gray-700">
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Título</TableCell>
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Versión</TableCell>
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Fecha de Vigencia</TableCell>
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Estado</TableCell>
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Creado El</TableCell>
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Actualizado El</TableCell>
                            <TableCell className="text-gray-800 dark:text-gray-100 font-semibold">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPoliticas.map((politica) => (
                            <TableRow
                                key={politica.id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                            >
                                <TableCell className="text-gray-800 dark:text-gray-100">{politica.titulo}</TableCell>
                                <TableCell className="text-gray-800 dark:text-gray-100">{politica.versio}</TableCell>
                                <TableCell className="text-gray-800 dark:text-gray-100">{formatDate(politica.fechaVigencia)}</TableCell>
                                <TableCell className="text-gray-800 dark:text-gray-100">
                                    <Typography
                                        variant="body2"
                                        className="font-bold"
                                        sx={{
                                            color:
                                                politica.estado === 'vigente'
                                                    ? 'green'
                                                    : politica.estado === 'no vigente'
                                                        ? 'orange'
                                                        : politica.estado === 'eliminado'
                                                            ? 'red'
                                                            : 'grey',
                                        }}
                                    >
                                        {politica.estado.charAt(0).toUpperCase() + politica.estado.slice(1)}
                                    </Typography>
                                </TableCell>
                                <TableCell className="text-gray-800 dark:text-gray-100">{formatDate(politica.created_at)}</TableCell>
                                <TableCell className="text-gray-800 dark:text-gray-100">{formatDate(politica.updated_at)}</TableCell>
                                <TableCell className="text-gray-800 dark:text-gray-100">
                                    <IconButton
                                        onClick={() => handleOpenModal(politica)}
                                        color="primary"
                                        aria-label={`Ver detalles de la política ${politica.titulo}`}
                                        className="dark:text-gray-100"
                                    >
                                        <Visibility />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedPoliticas.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    align="center"
                                    className="text-gray-600 dark:text-gray-300"
                                >
                                    No hay políticas para mostrar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Paginación */}
                <TablePagination
                    component="div"
                    count={politicas.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                />
            </Paper>


            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="md"
                aria-labelledby="detalles-politica-title"
                className="dark:bg-gray-900"
            >
                <Box
                    className="bg-yellow-500 text-white"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 2,
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}
                >
                    <Visibility sx={{ marginRight: 1 }} />
                    <Typography variant="h6" id="detalles-politica-title" className="text-white">
                        Detalles de la Política
                    </Typography>
                </Box>


                <DialogContent dividers className="bg-white dark:bg-gray-900 transition-colors duration-300 p-4">
                    {selectedPolitica ? (
                        <Box className="space-y-6">

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                                        <strong>Título:</strong>
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-800 dark:text-gray-100">
                                        {selectedPolitica.titulo}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                                        <strong>Versión:</strong>
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-800 dark:text-gray-100">
                                        {selectedPolitica.versio}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                                        <strong>Fecha de Vigencia:</strong>
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-800 dark:text-gray-100">
                                        {formatDate(selectedPolitica.fechaVigencia)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                                        <strong>Estado:</strong>
                                    </Typography>
                                    <Chip
                                        label={
                                            selectedPolitica.estado.charAt(0).toUpperCase() +
                                            selectedPolitica.estado.slice(1)
                                        }
                                        color={
                                            selectedPolitica.estado === 'vigente'
                                                ? 'success'
                                                : selectedPolitica.estado === 'no vigente'
                                                    ? 'warning'
                                                    : selectedPolitica.estado === 'eliminado'
                                                        ? 'error'
                                                        : 'default'
                                        }
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                                        <strong>Creado El:</strong>
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-800 dark:text-gray-100">
                                        {formatDate(selectedPolitica.created_at)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
                                        <strong>Actualizado El:</strong>
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-800 dark:text-gray-100">
                                        {formatDate(selectedPolitica.updated_at)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Contenido */}
                            <Box>
                                <Typography variant="h6" className="text-gray-800 dark:text-gray-100 mb-2">
                                    Contenido
                                </Typography>
                                <Typography variant="body1" className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {selectedPolitica.contenido}
                                </Typography>
                            </Box>

                            {/* Secciones */}
                            <Box>
                                <Typography variant="h6" className="text-gray-800 dark:text-gray-100 mb-2">
                                    Secciones
                                </Typography>
                                {selectedPolitica.secciones && selectedPolitica.secciones.length > 0 ? (
                                    <List className="space-y-3">
                                        {selectedPolitica.secciones.map((seccion, index) => (
                                            <ListItem key={index} className="p-2 border rounded-md border-gray-200 dark:border-gray-700">
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle1" className="text-gray-800 dark:text-gray-100">
                                                            {`Sección ${index + 1}: ${seccion.titulo}`}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                                            {seccion.contenido}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                        No hay secciones disponibles.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body1" className="text-center text-gray-600 dark:text-gray-400">
                            Cargando detalles...
                        </Typography>
                    )}
                </DialogContent>



                <DialogActions className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                    <Button onClick={handleCloseModal} variant="contained" color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );



};

export default HistorialPoliticas;
