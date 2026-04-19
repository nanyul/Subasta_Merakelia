import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Gavel, Info, ImageIcon, DollarSign, Calendar, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

ListCardsSubastas.propTypes = {
    data: PropTypes.array,
};

export function ListCardsSubastas({ data }) {
    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    const formatPrice = (price) => {
        return `$ ${Number(price).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data && data.map((item) => (
                <Card
                    key={item.id}
                    className={`group flex h-full flex-col overflow-hidden border-[#ECB44D]/50 shadow-[0_18px_54px_rgba(12,18,46,0.34)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_72px_rgba(12,18,46,0.42)] ${item.estado === "Activa" ? "ring-1 ring-[#ECB44D]/40" : ""
                        }`}
                    style={{
                        background: "linear-gradient(180deg, rgba(33,52,101,0.94) 0%, rgba(23,23,65,0.95) 52%, rgba(19,22,78,0.96) 100%)",
                    }}
                >
                    {/* Header */}
                    <CardHeader className="relative px-4 pb-1 pt-1 text-center">
                        <div className="relative">
                            <CardTitle className="text-lg font-semibold tracking-wide text-[#F2E199] md:text-[1.35rem]">
                                {item.objeto}
                            </CardTitle>
                        </div>
                    </CardHeader>

                    {/* Imagen */}
                    <div className="relative mx-3.5 overflow-hidden rounded-[1.15rem] border border-[#ECB44D]/45 bg-[#194174]/38">
                        <div className="absolute inset-0 bg-linear-to-b from-[#6FB8E6]/10 via-transparent to-[#171741]/24" />
                        <div className="relative w-full aspect-4/5">
                            {item.imagen?.datos ? (
                                <img
                                    src={`${BASE_URL}/${item.imagen.datos}`}
                                    alt={item.objeto}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#194174]/38 text-[#F2E199]/70">
                                    <ImageIcon className="h-16 w-16" />
                                </div>
                            )}

                            {/* Estado principal */}
                            {item.estado && (
                                <Badge
                                    className="absolute right-2.5 top-2.5 border border-[#ECB44D]/70 bg-[#ECB44D] px-2.5 py-1 text-[0.68rem] font-bold text-[#171741] shadow-[0_0_16px_rgba(236,180,77,0.24)] md:text-xs"
                                >
                                    {item.estado}
                                </Badge>
                            )}

                            {/* Indicador EN VIVO para subastas activas */}
                            {item.estado === "Activa" && (
                                <Badge
                                    className="absolute left-2.5 top-2.5 border border-green-500 bg-green-600/90 px-2 py-0.5 text-[0.6rem] font-bold text-white animate-pulse"
                                >
                                    ● EN VIVO
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Contenido */}
                    <CardContent className="flex-1 space-y-2.5 pt-4 text-[#F2E199]">
                        {/* Precio Base y Pujas */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#F2E199]/82 md:text-sm">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECB44D]/30 bg-[#194174]/36 px-2.5 py-1">
                                <DollarSign className="h-3.5 w-3.5 shrink-0 text-[#ECB44D]" />
                                {formatPrice(item.precio_base)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6FB8E6]/30 bg-[#194174]/36 px-2.5 py-1">
                                <Gavel className="h-3.5 w-3.5 shrink-0 text-[#6FB8E6]" />
                                {item.cantidad_pujas || 0} pujas
                            </span>
                        </div>

                        {/* Incremento Mínimo */}
                        <div className="flex items-center gap-2 text-xs text-[#F2E199]/84 md:text-sm">
                            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#ECB44D]" />
                            <span>Incremento: {formatPrice(item.incremento_minimo)}</span>
                        </div>

                        {/* Fecha de Cierre */}
                        <div className="flex items-center gap-2 text-xs text-[#F2E199]/84 md:text-sm">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-[#6FB8E6]" />
                            <span>Cierra: {formatDate(item.fecha_fin)}</span>
                        </div>

                        {/* Categorías */}
                        {item.categorias && item.categorias.length > 0 && (
                            <div className="flex items-start gap-2 text-xs text-[#F2E199]/84 md:text-sm">
                                <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ECB44D]" />
                                <span>
                                    {Array.isArray(item.categorias)
                                        ? item.categorias.map(c => typeof c === 'object' ? c.descripcion : c).join(", ")
                                        : typeof item.categorias === 'object' ? item.categorias.descripcion : item.categorias || "Sin categoria"}
                                </span>
                            </div>
                        )}
                    </CardContent>

                    {/* Acciones */}
                    <div className="flex justify-end gap-2 border-t border-[#ECB44D]/30 px-3.5 py-2.5">
                        <TooltipProvider>
                            {/* Botón Ver Detalle */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="size-8 border border-[#6FB8E6]/45 bg-[#194174]/60 text-[#F2E199] shadow-[0_0_18px_rgba(111,184,230,0.14)] hover:bg-[#6FB8E6] hover:text-[#171741]"
                                        asChild
                                    >
                                        <Link to={`/subasta/${item.id}`}>
                                            <Info className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver detalle de la subasta</TooltipContent>
                            </Tooltip>

                            {/* Botón Participar en Vivo - SOLO para subastas activas */}
                            {item.estado === "Activa" && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            className="size-8 border border-[#ECB44D] bg-[#ECB44D]/20 text-[#ECB44D] shadow-[0_0_18px_rgba(236,180,77,0.25)] hover:bg-[#ECB44D] hover:text-[#171741]"
                                            asChild
                                        >
                                            <Link to={`/subasta/en-vivo/${item.id}`}>
                                                <Gavel className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Participar en subasta en vivo</TooltipContent>
                                </Tooltip>
                            )}
                        </TooltipProvider>
                    </div>
                </Card>
            ))}
        </div>
    );
}