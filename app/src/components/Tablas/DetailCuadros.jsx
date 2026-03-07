import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    User,
    ImageIcon,
    ArrowLeft,
    Palette,
    CalendarDays,
    ShieldCheck,
    Tag,
    Gavel,
} from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

//Services
import CuadrosService from '../../services/CuadrosService';

export function DetailCuadro() {
    const navigate = useNavigate();
    const { id } = useParams();
    const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
    const [cuadro, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CuadrosService.getCuadroById(id);
                console.log(response.data);
                setData(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                }
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar cuadros" message={error} />;
    if (!cuadro || !cuadro.data || (Array.isArray(cuadro.data) && cuadro.data.length === 0))
        return <EmptyState message="No se encontró el cuadro solicitado." />;

    // El backend retorna un array, tomamos el primer elemento
    const item = Array.isArray(cuadro.data) ? cuadro.data[0] : cuadro.data;

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sección de Imágenes */}
                <div className="flex-shrink-0 w-full md:w-1/3 space-y-4">
                    {/* Imagen principal */}
                    <div className="relative rounded-lg overflow-hidden shadow-xl">
                        <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
                            {item.imagen?.datos ? (
                                <img
                                    src={`${BASE_URL}/${item.imagen.datos}`}
                                    alt={`Obra artística ${item.nombre}`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <ImageIcon className="h-1/2 w-1/2 text-muted-foreground" />
                            )}
                        </div>
                        <Badge variant="secondary" className="absolute top-3 right-3">
                            {item.estado_cuadro}
                        </Badge>
                    </div>

                    {/* Galería de todas las imágenes */}
                    {item.imagenes && item.imagenes.length > 1 && (
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Todas las imágenes</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {item.imagenes.map((img) => (
                                    <div key={img.id} className="aspect-square rounded overflow-hidden bg-muted">
                                        <img
                                            src={`${BASE_URL}/${img.datos}`}
                                            alt={item.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección de Detalles */}
                <div className="flex-1 space-y-6">
                    {/* Nombre */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            {item.nombre}
                        </h1>
                    </div>

                    {/* Descripción completa */}
                    {item.descripcion && (
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {item.descripcion}
                        </p>
                    )}

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            {/* Info principal */}
                            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                                {/* Artista */}
                                <div className="flex items-center gap-3">
                                    <Palette className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Artista:</span>
                                    <p className="text-muted-foreground">{item.nombre_artista}</p>
                                </div>
                                {/* Condición */}
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Condición:</span>
                                    <p className="text-muted-foreground">{item.estado_condicion}</p>
                                </div>
                                {/* Estado */}
                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Estado:</span>
                                    <Badge variant="outline">{item.estado_cuadro}</Badge>
                                </div>
                                {/* Fecha de registro */}
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Fecha de registro:</span>
                                    <p className="text-muted-foreground">{item.fecha_registro}</p>
                                </div>
                                {/* Propietario */}
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Propietario:</span>
                                    <p className="text-muted-foreground">{item.nombre_dueno}</p>
                                </div>
                            </div>

                            {/* Categorías */}
                            {item.categorias && Array.isArray(item.categorias) && item.categorias.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Palette className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">Categorías:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.categorias.map((cat, index) => (
                                            <Badge key={index} variant="secondary">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Historial de Subastas */}
                    {item.subasta && item.subasta.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Gavel className="h-5 w-5 text-primary" />
                                    <span className="text-lg font-semibold">Historial de Subastas</span>
                                </div>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader className="bg-primary/10">
                                            <TableRow>
                                                <TableHead className="font-semibold">ID Subasta</TableHead>
                                                <TableHead className="font-semibold">Fecha Inicio</TableHead>
                                                <TableHead className="font-semibold">Fecha Cierre</TableHead>
                                                <TableHead className="font-semibold">Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {item.subasta.map((sub) => (
                                                <TableRow key={sub.id}>
                                                    <TableCell className="font-medium">{sub.id}</TableCell>
                                                    <TableCell>{sub.fecha_inicio}</TableCell>
                                                    <TableCell>{sub.fecha_cierre}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{sub.estado_subasta}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
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