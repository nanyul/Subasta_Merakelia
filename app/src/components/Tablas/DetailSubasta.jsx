import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    ArrowLeft,
    ImageIcon,
    CalendarDays,
    Tag,
    Gavel,
    DollarSign,
    Layers,
    Eye
} from "lucide-react";

// Service
import SubastaService from "@/services/SubastaService";

export function DetailSubasta() {

    const navigate = useNavigate();
    const { id } = useParams();

    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    const [subasta, setSubasta] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatPrice = (price) => {
        return `$ ${Number(price).toFixed(2)}`;
    };

    useEffect(() => {

        const fetchData = async () => {

            try {

                const response = await SubastaService.getSubastaById(id);
                const result = response.data;

                if (result.success) {
                    setSubasta(result.data);
                } else {
                    setError(result.message);
                }

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, [id]);

    if (loading) return <LoadingGrid count={1} type="grid" />;

    if (error)
        return <ErrorAlert title="Error al cargar la subasta" message={error} />;

    if (!subasta)
        return <EmptyState message="No se encontró la subasta solicitada." />;

    return (

        <div className="max-w-5xl mx-auto py-12 px-4">

            <div className="flex flex-col md:flex-row gap-8">

                {/* IMAGEN DEL OBJETO */}

                <div className="w-full md:w-1/3">

                    <div className="rounded-lg overflow-hidden shadow-md bg-muted flex items-center justify-center aspect-square">

                        {subasta.imagen?.datos ? (

                            <img
                                src={`${BASE_URL}/${subasta.imagen.datos}`}
                                alt={subasta.objeto}
                                className="w-full h-full object-cover"
                            />

                        ) : (

                            <ImageIcon className="w-16 h-16 text-muted-foreground" />

                        )}

                    </div>

                </div>


                {/* DETALLE */}

                <div className="flex-1 space-y-6">

                    {/* NOMBRE DEL OBJETO */}

                    <div>

                        <h1 className="text-4xl font-bold">
                            {subasta.objeto}
                        </h1>

                    </div>


                    {/* INFORMACIÓN DEL OBJETO */}

                    <Card>

                        <CardContent className="p-6 space-y-4">

                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary" />
                                Información del objeto
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">

                                {/* CATEGORÍAS */}

                                <div className="flex items-center gap-3">

                                    <Layers className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Categorías:
                                    </span>

                                    <div className="flex gap-2 flex-wrap">

                                        {subasta.categorias?.map((cat, index) => (

                                            <Badge key={index} variant="secondary">
                                                {cat}
                                            </Badge>

                                        ))}

                                    </div>

                                </div>


                                {/* CONDICIÓN */}

                                <div className="flex items-center gap-3">

                                    <Tag className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Condición:
                                    </span>

                                    <p className="text-muted-foreground">
                                        {subasta.condicion}
                                    </p>

                                </div>

                            </div>

                        </CardContent>

                    </Card>


                    {/* DATOS DE LA SUBASTA */}

                    <Card>

                        <CardContent className="p-6 space-y-4">

                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-primary" />
                                Datos de la Subasta
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">

                                {/* FECHA INICIO */}

                                <div className="flex items-center gap-3">

                                    <CalendarDays className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Fecha inicio:
                                    </span>

                                    <p className="text-muted-foreground">
                                        {subasta.fecha_inicio}
                                    </p>

                                </div>


                                {/* FECHA FIN */}

                                <div className="flex items-center gap-3">

                                    <CalendarDays className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Fecha cierre:
                                    </span>

                                    <p className="text-muted-foreground">
                                        {subasta.fecha_fin}
                                    </p>

                                </div>


                                {/* PRECIO BASE */}

                                <div className="flex items-center gap-3">

                                    <DollarSign className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Precio base:
                                    </span>

                                    <p className="text-muted-foreground">
                                        {formatPrice(subasta.precio_base)}
                                    </p>

                                </div>


                                {/* INCREMENTO */}

                                <div className="flex items-center gap-3">

                                    <DollarSign className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Incremento mínimo:
                                    </span>

                                    <p className="text-muted-foreground">
                                        {formatPrice(subasta.incremento_minimo)}
                                    </p>

                                </div>


                                {/* ESTADO */}

                                <div className="flex items-center gap-3">

                                    <Tag className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Estado:
                                    </span>

                                    <Badge variant="outline">
                                        {subasta.estado}
                                    </Badge>

                                </div>


                                {/* PUJAS */}

                                <div className="flex items-center gap-3">

                                    <Gavel className="w-5 h-5 text-primary" />

                                    <span className="font-semibold">
                                        Cantidad de pujas:
                                    </span>

                                    <p className="text-muted-foreground">
                                        {subasta.cantidad_pujas}
                                    </p>

                                </div>

                            </div>

                        </CardContent>

                    </Card>


                    {/* BOTÓN HISTORIAL */}

                    <div>

                        <Link to={`/subasta/pujas/${id}`}>

                            <Button className="flex gap-2">

                                <Eye className="w-4 h-4" />

                                Ver historial de pujas

                            </Button>

                        </Link>

                    </div>

                </div>

            </div>


            {/* BOTÓN REGRESAR */}

            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-8"
            >

                <ArrowLeft className="w-4 h-4" />

                Regresar

            </Button>

        </div>

    );
}