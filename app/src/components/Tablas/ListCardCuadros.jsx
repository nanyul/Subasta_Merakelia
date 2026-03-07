import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Palette, Info, ImageIcon, User, Tag, ShieldCheck, Gavel } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

ListCardCuadros.propTypes = {
    data: PropTypes.array,
};

export function ListCardCuadros({ data }) {
    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    return (
        <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {data && data.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden">
                    {/* Header */}
                    <CardHeader className="text-secondary text-center pb-2">
                        <CardTitle className="text-lg font-semibold">
                            {item.nombre}
                        </CardTitle>
                        <p className="text-sm opacity-80">{item.ano_creacion || ""}</p>
                    </CardHeader>

                    {/* Imagen */}
                    <div className="relative w-full aspect-video">
                        {item.imagen?.datos ? (
                            <img
                                src={`${BASE_URL}/${item.imagen.datos}`}
                                alt={item.nombre}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-1/2 w-1/2" />
                            </div>
                        )}
                        {item.valor_estimado && (
                            <Badge
                                variant="secondary"
                                className="absolute top-2 right-2 text-base font-bold bg-primary text-primary-foreground"
                            >
                                ₡{parseFloat(item.valor_estimado).toFixed(2)} colones
                            </Badge>
                        )}
                    </div>

                    {/* Contenido */}
                    <CardContent className="flex-1 space-y-2 pt-4">
                        {/* Condición y Estado */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                            <span>{item.estado_condicion}</span>
                            <Tag className="h-4 w-4 text-primary shrink-0 ml-4" />
                            <span>{item.estado_cuadro}</span>
                        </div>
                        {/* Artista */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4 text-primary shrink-0" />
                            <span>{item.nombre_artista}</span>
                        </div>
                        {/* Categorías */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <Palette className="h-4 w-4 text-primary shrink-0" />
                            {Array.isArray(item.categorias)
                                ? item.categorias.join(", ")
                                : item.categorias || "Sin categoría"}
                        </div>
                        {/* Propietario */}
                        {item.nombre_dueno && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Gavel className="h-4 w-4 text-primary shrink-0" />
                                <span>Propietario: {item.nombre_dueno}</span>
                            </div>
                        )}
                    </CardContent>

                    {/* Acciones */}
                    <div className="flex justify-end gap-2 border-t p-3">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" className="size-8" asChild>
                                        <Link to={`/CuadrosSubastables/${item.id}`}>
                                            <Info />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver detalle</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </Card>
            ))}
        </div>
    );
}
