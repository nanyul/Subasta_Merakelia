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

import fondoTabla from "@/assets/fondoTabla.png";

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

    const formatPrice = (price) => {
        return `$ ${Number(price).toFixed(2)}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("es-ES").replace(", ", " ");
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

    const subastasFiltradas = subastas.filter((s) => {
        if (filtro === "activas") return !s.estado || s.estado === "Activa";
        if (filtro === "finalizadas") return s.estado === "Finalizada";
        if (filtro === "canceladas") return s.estado === "Cancelada";
        return true;
    });

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subastas" message={error} />;
    if (subastasFiltradas.length === 0)
        return <EmptyState message="No hay subastas disponibles." />;

    return (
        <div
            className="min-h-screen bg-[#171741] px-4 py-8"
            style={{
                backgroundImage: `linear-gradient(rgba(10,18,44,0.28), rgba(10,18,44,0.46)), url(${fondoTabla})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="mx-auto max-w-[1200px] py-6">

                {/* TITULO */}
                <div className="mb-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <h1
                        className="text-[1.8rem] text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.3rem]"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        Listado de Subastas
                    </h1>

                    {/* FILTROS */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-3 py-1.5 text-[#F2E199]">

                        <Badge
                            className={`cursor-pointer px-4 py-1 border transition-all rounded-full text-sm
                                ${filtro === "todas"
                                    ? "bg-[#ECB44D] text-[#171741] border-[#ECB44D]"
                                    : "bg-transparent text-[#F2E199] border-[#F2E199] hover:bg-[#ECB44D]/20 hover:border-[#ECB44D]"
                                }`}
                            onClick={() => setFiltro("todas")}
                        >
                            Todas
                        </Badge>

                        <Badge
                            className={`cursor-pointer px-4 py-1 border transition-all rounded-full text-sm
                                ${filtro === "activas"
                                    ? "bg-[#6FB8E6] text-[#171741] border-[#6FB8E6]"
                                    : "bg-transparent text-[#F2E199] border-[#F2E199] hover:bg-[#6FB8E6]/20 hover:border-[#6FB8E6]"
                                }`}
                            onClick={() => setFiltro("activas")}
                        >
                            Activas
                        </Badge>

                        <Badge
                            className={`cursor-pointer px-4 py-1 border transition-all rounded-full text-sm
                                ${filtro === "finalizadas"
                                    ? "bg-[#ECB44D] text-[#171741] border-[#ECB44D]"
                                    : "bg-transparent text-[#F2E199] border-[#F2E199] hover:bg-[#ECB44D]/20 hover:border-[#ECB44D]"
                                }`}
                            onClick={() => setFiltro("finalizadas")}
                        >
                            Finalizadas
                        </Badge>

                        <Badge
                            className={`cursor-pointer px-4 py-1 border transition-all rounded-full text-sm
                                ${filtro === "canceladas"
                                    ? "bg-[#ECB44D] text-[#171741] border-[#ECB44D]" 
                                    : "bg-transparent text-[#F2E199] border-[#F2E199] hover:bg-[#ECB44D]/20 hover:border-[#ECB44D]"
                                }`}
                            onClick={() => setFiltro("canceladas")}
                        >
                            Canceladas
                        </Badge>
                    </div>

                </div>

                {/* TABLA */}

                <div className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-lg border border-[#d8a63b] bg-transparent shadow-[0_16px_60px_rgba(12,18,46,0.18)]">

                    <Table className="min-w-[1000px]"> {/* Agrega un ancho mínimo para evitar que la tabla se colapse demasiado en pantallas pequeñas*/}

                        <TableHeader>

                            <TableRow className="border-0 hover:bg-transparent">

                                {subastaColumns.map((col) => (

                                    <TableHead
                                        key={col.key}
                                        className="h-9 border-r border-b border-[#d8a63b] bg-[#e3d38c] px-3 text-center text-sm font-bold uppercase tracking-wide text-[#171741] last:border-r-0 md:h-11 md:text-[0.92rem]"
                                    >
                                        {col.label}
                                    </TableHead>

                                ))}

                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {subastasFiltradas.map((subasta) => (

                                <TableRow
                                    key={subasta.id}
                                    className="border-0 bg-[#1a1a5a]/94 hover:bg-[#202068]/96 "
                                >

                                    {/* IMAGEN */}
                                    <TableCell className="border-r border-b border-[#b68f2f] text-center">

                                        {subasta.imagen?.datos ? (

                                            <img
                                                src={`${BASE_URL}/${subasta.imagen.datos}`}
                                                alt={subasta.objeto}
                                                className="w-16 h-16 object-cover rounded-md border mx-auto"
                                            />

                                        ) : (

                                            <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md mx-auto">
                                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                            </div>

                                        )}

                                    </TableCell>

                                    <TableCell className="border-r border-b border-[#b68f2f] px-3 py-2 text[#F2E199] text-center text-[#F2E199] w-[200px]">
                                        <div className="whitespace-normal break-works leading-tight">
                                            {subasta.objeto}
                                        </div>
                                    </TableCell>

                                    <TableCell className="border-r border-b border-[#b68f2f] text-center text-[#F2E199]">

                                        {formatDate(subasta.fecha_inicio)}
                                    </TableCell>

                                    <TableCell className="border-r border-b border-[#b68f2f] text-center text-[#F2E199]">
                                        {formatDate(subasta.fecha_fin)}
                                    </TableCell>

                                    <TableCell className="border-r border-b border-[#b68f2f] text-center text-[#F2E199]">
                                        {formatPrice(subasta.precio_base)}
                                    </TableCell>

                                    <TableCell className="border-r border-b border-[#b68f2f] text-center text-[#F2E199]">
                                        {subasta.cantidad_pujas}
                                    </TableCell>

                                    <TableCell className="border-r border-b border-[#b68f2f] text-center font-semibold">

                                        {(!subasta.estado || subasta.estado === "Activa") && (
                                            <span className="text-[#6FB8E6]">
                                                Activa
                                            </span>
                                        )}

                                        {subasta.estado === "Finalizada" && (
                                            <span className="text-[#ECB44D]">
                                                Finalizada
                                            </span>
                                        )}

                                        {subasta.estado === "Cancelada" && (
                                            <span className="text-[#F2E199]">
                                                Cancelada
                                            </span>
                                        )}

                                    </TableCell>

                                    {/* ACCIONES */}
                                    <TableCell className="border-b border-[#b68f2f]">

                                        <div className="flex items-center justify-center gap-1">

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link to={`/subasta/${subasta.id}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-[#6FB8E6] hover:bg-[#194174]"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Ver detalle</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {subasta.estado !== "Cancelada" && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link to={`/subasta/pujas/${subasta.id}`}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-[#ECB44D] hover:bg-[#194174]"
                                                                >
                                                                    <Gavel className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Historial de pujas</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                        </div>

                                    </TableCell>

                                </TableRow>

                            ))}
                        </TableBody>

                    </Table>

                </div>

                {/* BOTON REGRESAR */}
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-6 flex h-9 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-4 text-sm text-[#F2E199] hover:bg-[#194174]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>

            </div>
        </div>
    );
}