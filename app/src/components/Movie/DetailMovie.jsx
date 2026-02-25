import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Globe,
    User,
    Film,
    Star,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';

//Services
import UserService from '../../services/UserService';

export function DetailMovie() {
    const navigate = useNavigate();
    const { id } = useParams();
    const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
    const [movie, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await UserService.getUserById(id);
                // Si la petición es exitosa, se guardan los datos
                console.log(response.data)
                setData(response.data);
                if(!response.data.success){
                    setError(response.data.message)
                }
            } catch (err) {
                // Si el error no es por cancelación, se registra
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                // Independientemente del resultado, se actualiza el loading
                setLoading(false);
            }
        };
        fetchData(id)
    }, [id]);


    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar películas" message={error} />;
    if (!movie || movie.data.length === 0)
        return <EmptyState message="No se encontraron películas en esta tienda." />;
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sección de la Imagen con año en Badge */}
                <div className="relative flex-shrink-0 w-full md:w-1/4 lg:w-1/5 rounded-lg overflow-hidden shadow-xl">
                    <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
                        {movie.data.imagen?.image ? ( 
                            <img
                                src={`${BASE_URL}/${movie.data.imagen.image}`}
                                alt={`Poster de ${movie.data.title}`}
                                className="w-full h-full object-contain"
                            />
                        ):(
                            <Film className="h-1/2 w-1/2 text-muted-foreground" />
                        )}
                    </div>
                    {/* Badge del año en la esquina inferior derecha */}
                    <Badge variant="secondary" className="absolute bottom-4 right-4 text-1xl">
                        {movie.data.year}
                    </Badge>
                </div>

                {/* Sección de los Detalles */}
                <div className="flex-1 space-y-6">
                    {/* Título de la película */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            {movie.data.title}
                        </h1>
                    </div>

                    {/* Sección de usuario bonito */}
                    {movie.data && (
                        <Card className="my-8">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex flex-wrap gap-6 items-center">
                                    <User className="h-8 w-8 text-primary" />
                                    <div>
                                        <span className="font-bold text-lg">{movie.data.nombre}</span>
                                        <Badge className="ml-2" variant="outline">{movie.data.rol}</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <span className="font-semibold">Correo:</span>
                                        <p className="text-muted-foreground">{movie.data.correo}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Estado:</span>
                                        <p className="text-muted-foreground">{movie.data.estado}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Cantidad de Pujas:</span>
                                        <p className="text-muted-foreground">{movie.data.cantidad_pujas}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Fecha de Registro:</span>
                                        <p className="text-muted-foreground">{movie.data.fecha_registro}</p>
                                    </div>
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