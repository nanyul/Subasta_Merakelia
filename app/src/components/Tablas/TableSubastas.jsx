import { Link } from "react-router-dom";
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

import { Eye, ArrowLeft } from "lucide-react";

import { useEffect, useState } from "react";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

// Service
import SubastaService from "@/services/SubastaService";


// Columnas
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

    const [subastas, setSubastas] = useState([]);
    const [filtro, setFiltro] = useState("todas");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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

        return true;

    });


    if (loading) return <LoadingGrid type="grid" />;

    if (error)
        return <ErrorAlert title="Error al cargar subastas" message={error} />;

    if (subastasFiltradas.length === 0)
        return <EmptyState message="No hay subastas disponibles." />;


    return (

        <div className="container mx-auto py-8">

            <div className="flex items-center justify-between mb-6">

                <h1 className="text-3xl font-bold tracking-tight">
                    Listado de Subastas
                </h1>

                {/* FILTROS */}

                <div className="flex gap-2">

                    <Button
                        variant={filtro === "todas" ? "default" : "outline"}
                        onClick={() => setFiltro("todas")}
                    >
                        Todas
                    </Button>

                    <Button
                        variant={filtro === "activas" ? "default" : "outline"}
                        onClick={() => setFiltro("activas")}
                    >
                        Activas
                    </Button>

                    <Button
                        variant={filtro === "finalizadas" ? "default" : "outline"}
                        onClick={() => setFiltro("finalizadas")}
                    >
                        Finalizadas
                    </Button>

                </div>

            </div>

            <div className="rounded-md border">

                <Table>

                    <TableHeader className="bg-primary/50">

                        <TableRow>

                            {subastaColumns.map((col) => (

                                <TableHead
                                    key={col.key}
                                    className="text-left font-semibold"
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

                                    <img
                                        src={`${import.meta.env.VITE_BASE_URL}images/${subasta.imagen?.datos}`}
                                        alt={subasta.objeto}
                                        className="w-16 h-16 object-cover rounded"
                                    />

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
                                    ${subasta.precio_base}
                                </TableCell>


                                {/* PUJAS */}

                                <TableCell>
                                    {subasta.cantidad_pujas}
                                </TableCell>


                                {/* ESTADO */}

                                <TableCell>

                                    {subasta.estado ? (
                                        <span className="text-red-500 font-medium">
                                            {subasta.estado}
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-medium">
                                            Activa
                                        </span>
                                    )}

                                </TableCell>


                                {/* ACCIONES */}

                                <TableCell className="flex gap-1">

                                    <TooltipProvider>

                                        <Tooltip>

                                            <TooltipTrigger asChild>

                                                <Link
                                                    to={`/subasta/detail/${subasta.id}`}
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

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </div>

            <Button
                type="button"
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >

                <ArrowLeft className="w-4 h-4" />

                Regresar

            </Button>

        </div>

    );
}