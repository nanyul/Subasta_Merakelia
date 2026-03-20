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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Plus, Trash2, ArrowLeft, BookUser, Film } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import fondoTabla from "@/assets/fondoTabla.png";

//Services
import CuadrosService from "@/services/CuadrosService";

const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

// Headers de la tabla
const cuadroColumns = [
    { key: "imagen", label: "Imagen", widthClass: "w-[10%]" },
    { key: "nombre", label: "Nombre", widthClass: "w-[14%]" },
    { key: "categorias", label: "Categorías", widthClass: "w-[26%]" },
    { key: "estado_condicion", label: "Condición", widthClass: "w-[13%]" },
    { key: "estado_cuadro", label: "Estado", widthClass: "w-[13%]" },
    { key: "nombre_dueno", label: "Dueño", widthClass: "w-[14%]" },
    { key: "actions", label: "Acciones", widthClass: "w-[10%]" },
];

export default function TableCuadros() {
    const navigate = useNavigate();
    const [cuadros, setCuadros] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CuadrosService.getCuadros();
                const result = response.data;
                if (result.success) {
                    setCuadros(result.data || []);
                } else {
                    setError(result.message || "Error desconocido");
                }
            } catch (err) {
                setError(err.message || "Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };
        fetchData()
    }, []);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar cuadros" message={error} />;
    if (cuadros.length === 0)
        return <EmptyState message="No se encontraron cuadros en esta tienda." />;

    const minimumRows = 4;
    const emptyRows = Array.from({ length: Math.max(0, minimumRows - cuadros.length) });

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-8"
            style={{
                backgroundImage: `linear-gradient(rgba(7, 13, 34, 0.34), rgba(7, 13, 34, 0.68)), url(${fondoTabla})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="hero-stars-soft absolute inset-0 opacity-80" />
            <div className="hero-stars absolute inset-0 opacity-90" />
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 18% 18%, rgba(111,184,230,0.16) 0%, rgba(111,184,230,0) 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.18) 0%, rgba(242,225,153,0) 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.14) 0%, rgba(236,180,77,0) 26%)',
                }}
            />
            <div className="mx-auto max-w-345 py-6 relative z-10">
                <div className="mb-7 flex items-start justify-between gap-4">
                    <h1
                        className="text-[1.8rem] leading-none text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.3rem]"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        Listado de Cuadros Subastables
                    </h1>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="icon"
                                    className="size-9 border-[#ECB44D] bg-[#171741]/70 text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.18)] hover:bg-[#194174] hover:text-[#F2E199]"
                                >
                                    <Link to="/CuadrosSubastables/create">
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Crear cuadro</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="mx-auto mt-6 w-full overflow-hidden rounded-lg border border-[#ECB44D]/50 bg-transparent shadow-[0_20px_60px_rgba(12,18,46,0.42)]">
                    <Table className="table-fixed border-separate border-spacing-0">
                        <TableHeader>
                            <TableRow className="border-0 hover:bg-transparent">
                                {cuadroColumns.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        className={`${col.widthClass} h-9 border-r border-b border-[#ECB44D]/45 bg-[#194174]/55 px-3 text-center text-sm font-bold uppercase tracking-wide text-[#F2E199] last:border-r-0 md:h-11 md:text-[0.88rem]`}
                                    >
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cuadros.map((cuadro) => (
                                <TableRow key={cuadro.id} className="border-0 bg-[#194174]/28 hover:bg-[#194174]/38">
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 px-3 py-1 md:h-14">
                                        <div className="mx-auto flex h-12 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#ECB44D]/35 bg-[#194174]/28 md:h-14 md:w-12">
                                            {cuadro.imagen?.datos ? (
                                                <img
                                                    src={`${BASE_URL}/${cuadro.imagen.datos}`}
                                                    alt={cuadro.nombre}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Film className="h-4 w-4 text-[#F2E199]/70" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 px-3 py-1 text-center text-[0.62rem] font-semibold uppercase tracking-wide text-[#F2E199] md:h-14 md:text-[0.72rem]">
                                        {cuadro.nombre}
                                    </TableCell>
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 px-3 py-1 text-center text-[0.62rem] text-[#F2E199] md:h-14 md:text-[0.72rem]">
                                        {Array.isArray(cuadro.categorias)
                                            ? cuadro.categorias.join(", ")
                                            : cuadro.categorias}
                                    </TableCell>
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 px-3 py-1 text-center text-[0.62rem] text-[#F2E199] md:h-14 md:text-[0.72rem]">
                                        {cuadro.estado_condicion}
                                    </TableCell>
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 px-3 py-1 text-center text-[0.62rem] text-[#F2E199] md:h-14 md:text-[0.72rem]">
                                        {cuadro.estado_cuadro}
                                    </TableCell>
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 px-3 py-1 text-center text-[0.62rem] text-[#F2E199] md:h-14 md:text-[0.72rem]">
                                        {cuadro.nombre_dueno}
                                    </TableCell>
                                    <TableCell className="h-12 border-b border-[#ECB44D]/35 px-3 py-1 md:h-14">
                                        <div className="flex items-center justify-center gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link to={`/CuadrosSubastables/${cuadro.id}`}>
                                                            <Button variant="ghost" size="icon" className="size-8 text-[#F2E199] hover:bg-[#194174] hover:text-[#F2E199]">
                                                                <BookUser className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Detalle Cuadro</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 text-[#6FB8E6] hover:bg-[#194174] hover:text-[#6FB8E6]">
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Actualizar</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 text-[#ECB44D] hover:bg-[#194174] hover:text-[#F2E199]">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Eliminar</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {emptyRows.map((_, index) => (
                                <TableRow key={`empty-${index}`} className="border-0 bg-[#194174]/28 hover:bg-[#194174]/28">
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 md:h-14" />
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 md:h-14" />
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 md:h-14" />
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 md:h-14" />
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 md:h-14" />
                                    <TableCell className="h-12 border-r border-b border-[#ECB44D]/35 md:h-14" />
                                    <TableCell className="h-12 border-b border-[#ECB44D]/35 md:h-14" />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-6 flex h-9 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-4 text-sm text-[#F2E199] hover:bg-[#194174] hover:text-[#F2E199]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>
            </div>
        </div>
    );
}
