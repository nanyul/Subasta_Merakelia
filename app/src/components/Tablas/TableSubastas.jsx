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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Eye, ArrowLeft, ImageIcon, Gavel, Plus, Pencil, Send, Ban } from "lucide-react";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [subastaToCancel, setSubastaToCancel] = useState(null);

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("es-ES").replace(", ", " ");
    };

    const fetchSubastas = async () => {
        try {
            setLoading(true);
            const response = await SubastaService.getAllSubastas();
            const result = response.data;

            if (result.success) {
                setSubastas(result.data || []);
                setError(null);
            } else {
                setError(result.message || "Error desconocido");
            }
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubastas();
    }, []);

    const handlePublish = async (id) => {
        try {
            setActionLoadingId(id);
            const response = await SubastaService.publishSubasta(id);
            const result = response.data;

            if (result.success) {
                toast.success(result.message || "Subasta publicada correctamente.");
                await fetchSubastas();
                return;
            }

            toast.error(result.message || "No fue posible publicar la subasta.");
        } catch (err) {
            toast.error(err.message || "Error al publicar la subasta.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const openCancelDialog = (subasta) => {
        setSubastaToCancel(subasta);
        setCancelDialogOpen(true);
    };

    const handleCancel = async () => {
        if (!subastaToCancel?.id) return;

        try {
            setActionLoadingId(subastaToCancel.id);
            const response = await SubastaService.cancelSubasta(subastaToCancel.id);
            const result = response.data;

            if (result.success) {
                toast.success(result.message || "Subasta cancelada correctamente.");
                setCancelDialogOpen(false);
                setSubastaToCancel(null);
                await fetchSubastas();
                return;
            }

            toast.error(result.message || "No fue posible cancelar la subasta.");
        } catch (err) {
            toast.error(err.message || "Error al cancelar la subasta.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const subastasFiltradas = subastas.filter((s) => {
        if (filtro === "borradores") return s.estado === "Programada";
        if (filtro === "activas") return !s.estado || s.estado === "Activa";
        if (filtro === "finalizadas") return s.estado === "Finalizada";
        if (filtro === "canceladas") return s.estado === "Cancelada";
        return true;
    });

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subastas" message={error} />;

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
                <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <h1
                        className="text-[1.8rem] text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.3rem]"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        Listado de Subastas
                    </h1>

                    <div className="flex flex-wrap items-center justify-end gap-2">

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
                                ${filtro === "borradores"
                                        ? "bg-[#F2E199] text-[#171741] border-[#F2E199]"
                                        : "bg-transparent text-[#F2E199] border-[#F2E199] hover:bg-[#F2E199]/20 hover:border-[#F2E199]"
                                    }`}
                                onClick={() => setFiltro("borradores")}
                            >
                                Borradores
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

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="icon"
                                        className="size-9 border-[#ECB44D] bg-[#171741]/70 text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.18)] hover:bg-[#194174] hover:text-[#F2E199]"
                                    >
                                        <Link to="/subasta/create">
                                            <Plus className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Crear subasta</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                </div>

                {/* TABLA */}

                {subastasFiltradas.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState message="No hay subastas disponibles para este filtro." />
                    </div>
                ) : (
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

                                        <TableCell className="border-r border-b border-[#b68f2f] px-3 py-2 text-center text-[#F2E199] w-[200px]">
                                            <div className="whitespace-normal break-words leading-tight">
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
                                            {subasta.cantidad_pujas}
                                        </TableCell>

                                        <TableCell className="border-r border-b border-[#b68f2f] text-center font-semibold">

                                            {(!subasta.estado || subasta.estado === "Activa") && (
                                                <span className="text-[#6FB8E6]">
                                                    Activa
                                                </span>
                                            )}

                                            {subasta.estado === "Programada" && (
                                                <span className="text-[#F2E199]">
                                                    Programada
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


                                                {(() => {
                                                    const ahora = new Date();
                                                    const fechaInicioRaw = String(subasta.fecha_inicio ?? "");
                                                    const fechaInicio = new Date(fechaInicioRaw.replace(" ", "T"));
                                                    const fechaValida = !Number.isNaN(fechaInicio.getTime());
                                                    const cantidadPujas = Number(subasta.cantidad_pujas ?? 0);
                                                    const sinPujas = Number.isNaN(cantidadPujas) || cantidadPujas === 0;

                                                    const puedeEditar = fechaValida && fechaInicio > ahora && sinPujas;

                                                    return (
                                                        <>
                                                            {/* EDITAR (solo si cumple condiciones) */}
                                                            {puedeEditar && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Link to={`/subasta/edit/${subasta.id}`}>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="size-8 text-[#F2E199] hover:bg-[#194174]"
                                                                                >
                                                                                    <Pencil className="h-4 w-4" />
                                                                                </Button>
                                                                            </Link>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Editar subasta</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}

                                                            {subasta.estado === "Programada" && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                disabled={actionLoadingId === subasta.id}
                                                                                onClick={() => handlePublish(subasta.id)}
                                                                                className="size-8 text-[#6FB8E6] hover:bg-[#194174] disabled:opacity-50"
                                                                            >
                                                                                <Send className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Publicar subasta</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}

                                                            {subasta.estado !== "Cancelada" && subasta.estado !== "Finalizada" && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                disabled={actionLoadingId === subasta.id}
                                                                                onClick={() => openCancelDialog(subasta)}
                                                                                className="size-8 text-[#F2E199] hover:bg-[#194174] disabled:opacity-50"
                                                                            >
                                                                                <Ban className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Cancelar subasta</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}

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

                                                            {subasta.estado !== "Cancelada" && subasta.estado !== "Programada" && !sinPujas && (
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
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                        </TableCell>

                                    </TableRow>

                                ))}
                            </TableBody>

                        </Table>

                    </div>
                )}

                {/* BOTON REGRESAR */}
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-6 flex h-9 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-4 text-sm text-[#F2E199] hover:bg-[#194174]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>

                <Dialog
                    open={cancelDialogOpen}
                    onOpenChange={(open) => {
                        setCancelDialogOpen(open);
                        if (!open && actionLoadingId === null) {
                            setSubastaToCancel(null);
                        }
                    }}
                >
                    <DialogContent className="border-[#d8a63b] bg-[#171741] text-[#F2E199]">
                        <DialogHeader>
                            <DialogTitle className="text-[#F2E199]">Cancelar subasta</DialogTitle>
                            <DialogDescription className="text-[#F2E199]/85">
                                Esta accion cancelara la subasta
                                {subastaToCancel?.objeto ? ` "${subastaToCancel.objeto}"` : " seleccionada"}
                                . No podra recibir nuevas pujas.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCancelDialogOpen(false)}
                                disabled={actionLoadingId === subastaToCancel?.id}
                                className="border-[#F2E199] bg-transparent text-[#F2E199] hover:border-[#6FB8E6] hover:bg-[#6FB8E6] hover:text-[#f2e199]"
                            >
                                Volver
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCancel}
                                disabled={actionLoadingId === subastaToCancel?.id}
                                className="bg-[#ECB44D] text-[#171741] hover:bg-[#d8a63b]"
                            >
                                {actionLoadingId === subastaToCancel?.id ? "Cancelando..." : "Si, cancelar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}