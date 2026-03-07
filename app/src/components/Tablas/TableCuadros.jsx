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

//Services
import CuadrosService from "@/services/CuadrosService";

const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

// Headers de la tabla
const cuadroColumns = [
    { key: "imagen", label: "Imagen" },
    { key: "nombre", label: "Nombre" },
    { key: "categorias", label: "Categorías" },
    { key: "estado_condicion", label: "Condición" },
    { key: "estado_cuadro", label: "Estado" },
    { key: "nombre_dueno", label: "Dueño" },
    { key: "actions", label: "Acciones" },
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
                console.log(response)
                const result = response.data;
                console.log(result)
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

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Listado de Cuadros Subastables
                </h1>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="icon" className="text-primary">
                                <Link to="/CuadrosSubastables/create">
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Crear cuadro</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-primary/50">
                        <TableRow>
                            {/* ()=>{} */}
                            {/* ()=>() */}
                            {cuadroColumns.map((col) => (
                                <TableHead key={col.key} className="text-left font-semibold">
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cuadros.map((cuadro) => (
                            <TableRow key={cuadro.id}>
                                <TableCell>
                                    <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                                        {cuadro.imagen?.datos ? (
                                            <img
                                                src={`${BASE_URL}/${cuadro.imagen.datos}`}
                                                alt={cuadro.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Film className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{cuadro.nombre}</TableCell>
                                <TableCell>
                                    {Array.isArray(cuadro.categorias)
                                        ? cuadro.categorias.join(", ")
                                        : cuadro.categorias}
                                </TableCell>
                                <TableCell>{cuadro.estado_condicion}</TableCell>
                                <TableCell>{cuadro.estado_cuadro}</TableCell>
                                <TableCell>{cuadro.nombre_dueno}</TableCell>
                                <TableCell className="flex justify-start items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link to={`/CuadrosSubastables/${cuadro.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <BookUser className="h-4 w-4 text-primary" />
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>Detalle Cuadro</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4 text-primary" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Actualizar</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Eliminar</TooltipContent>
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
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}
