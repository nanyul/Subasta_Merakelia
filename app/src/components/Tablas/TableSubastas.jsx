import { Link, useNavigate } from "react-router-dom";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Eye, ArrowLeft, ImageIcon, Gavel } from "lucide-react";

import { useEffect, useState } from "react";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

// Service
import SubastaService from "@/services/SubastaService";

const subastaColumns = [
    { key: "imagen", label: "Imagen" },
    { key: "objeto", label: "Objeto" },
    { key: "fecha_inicio", label: "Fecha inicio" },
    { key: "fecha_fin", label: "Fecha cierre" },
    { key: "precio_base", label: "Precio base" },
    { key: "cantidad_pujas", label: "Pujas" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

export default function TableSubastas() {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    const [subastas, setSubastas] = useState([]);
    const [filtro, setFiltro] = useState("todas");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Formatear precio
    const formatPrice = (price) => {
        return `$ ${Number(price).toFixed(2)}`;
    };

    useEffect(() => {

        const fetchData = async () => {

            try {

                const response = await SubastaService.getAllSubastas();
                const result = response.data;

                if (result.success) {
                    setSubastas(result.data || []);
                } else {
                    setError(result.message || "Error desconocido");
                }

            } catch (err) {

                setError(err.message || "Error al conectar con el servidor");

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, []);

    // FILTRO
    const subastasFiltradas = subastas.filter((s) => {

        if (filtro === "activas") {
            return !s.estado || s.estado === "Activa";
        }

        if (filtro === "finalizadas") {
            return s.estado === "Finalizada";
        }

        if (filtro === "canceladas") {
            return s.estado === "Cancelada";
        }

        return true;
    });

    if (loading) return <LoadingGrid type="grid" />;

    if (error)
        return <ErrorAlert title="Error al cargar subastas" message={error} />;

    if (subastasFiltradas.length === 0)
        return <EmptyState message="No hay subastas disponibles." />;

    return (

        <div className="container mx-auto py-8">

            {/* HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <h1 className="text-3xl font-bold tracking-tight">
                    Listado de Subastas
                </h1>

                {/* FILTROS */}

                <div className="flex gap-2 bg-muted p-1 rounded-lg">

                    <Badge
                        variant={filtro === "todas" ? "default" : "outline"}
                        className="cursor-pointer px-4 py-1"
                        onClick={() => setFiltro("todas")}
                    >
                        Todas
                    </Badge>

                    <Badge
                        variant={filtro === "activas" ? "default" : "outline"}
                        className="cursor-pointer px-4 py-1"
                        onClick={() => setFiltro("activas")}
                    >
                        Activas
                    </Badge>

                    <Badge
                        variant={filtro === "finalizadas" ? "default" : "outline"}
                        className="cursor-pointer px-4 py-1"
                        onClick={() => setFiltro("finalizadas")}
                    >
                        Finalizadas
                    </Badge>

                    <Badge
                        variant={filtro === "canceladas" ? "default" : "outline"}
                        className="cursor-pointer px-4 py-1"
                        onClick={() => setFiltro("canceladas")}
                    >
                        Canceladas
                    </Badge>

                </div>

            </div>

            {/* TABLA */}

            <div className="rounded-md border shadow-sm">

                <Table>

                    <TableHeader className="bg-primary/10">

                        <TableRow>

                            {subastaColumns.map((col) => (

                                <TableHead
                                    key={col.key}
                                    className="font-semibold"
                                >
                                    {col.label}
                                </TableHead>

                            ))}

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {subastasFiltradas.map((subasta) => (

                            <TableRow key={subasta.id}>

                                {/* IMAGEN */}

                                <TableCell>

                                    {subasta.imagen?.datos ? (

                                        <img
                                            src={`${BASE_URL}/${subasta.imagen.datos}`}
                                            alt={subasta.objeto}
                                            className="w-16 h-16 object-cover rounded-md border"
                                        />

                                    ) : (

                                        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>

                                    )}

                                </TableCell>


                                {/* OBJETO */}

                                <TableCell className="font-medium">
                                    {subasta.objeto}
                                </TableCell>


                                {/* FECHA INICIO */}

                                <TableCell>
                                    {subasta.fecha_inicio ?? "—"}
                                </TableCell>


                                {/* FECHA FIN */}

                                <TableCell>
                                    {subasta.fecha_fin}
                                </TableCell>


                                {/* PRECIO */}

                                <TableCell>
                                    {formatPrice(subasta.precio_base)}
                                </TableCell>


                                {/* PUJAS */}

                                <TableCell>
                                    {subasta.cantidad_pujas}
                                </TableCell>


                                {/* ESTADO */}

                                <TableCell>

                                    {subasta.estado === "Finalizada" && (
                                        <span className="text-red-500 font-medium">
                                            Finalizada
                                        </span>
                                    )}

                                    {subasta.estado === "Cancelada" && (
                                        <span className="text-red-500 font-medium">
                                            Cancelada
                                        </span>
                                    )}

                                    {!subasta.estado || subasta.estado === "Activa" ? (
                                        <span className="text-green-600 font-medium">
                                            Activa
                                        </span>
                                    ) : null}

                                </TableCell>


                                {/* ACCIONES */}

                                <TableCell>

                                    <TooltipProvider>

                                        <Tooltip>

                                            <TooltipTrigger asChild>

                                                <Link
                                                    to={`/subasta/${subasta.id}`}
                                                >

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >

                                                        <Eye className="h-4 w-4 text-primary" />

                                                    </Button>

                                                </Link>

                                            </TooltipTrigger>

                                            <TooltipContent>
                                                Ver detalle
                                            </TooltipContent>

                                        </Tooltip>

                                    </TooltipProvider>
                                    

                                      {/* VER HISTORIAL DE PUJAS */}

        <TooltipProvider>

            <Tooltip>

                <TooltipTrigger asChild>

                    <Link to={`/subasta/pujas/${subasta.id}`}>

                        <Button variant="ghost" size="icon">

                            <Gavel className="h-4 w-4 text-amber-600" />

                        </Button>

                    </Link>

                </TooltipTrigger>

                <TooltipContent>
                    Ver historial de pujas
                </TooltipContent>

            </Tooltip>

        </TooltipProvider>
                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </div>

            {/* BOTÓN REGRESAR */}

            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}

