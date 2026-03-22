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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data && data.map((item) => (
                <Card
                    key={item.id}
                    className="group flex h-full flex-col overflow-hidden border-[#ECB44D]/50 shadow-[0_18px_54px_rgba(12,18,46,0.34)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_72px_rgba(12,18,46,0.42)]"
                    style={{
                        background: "linear-gradient(180deg, rgba(33,52,101,0.94) 0%, rgba(23,23,65,0.95) 52%, rgba(19,22,78,0.96) 100%)",
                    }}
                >
                    {/* Header */}
                    <CardHeader className="relative px-4 pb-1 pt-1 text-center">

                        <div className="relative">
                            <CardTitle className="text-lg font-semibold tracking-wide text-[#F2E199] md:text-[1.35rem]">
                                {item.nombre}
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
                                alt={item.nombre}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#194174]/38 text-[#F2E199]/70">
                                <ImageIcon className="h-16 w-16" />
                            </div>
                        )}
                        {item.estado_cuadro && (
                            <Badge
                                className="absolute right-2.5 top-2.5 border border-[#ECB44D]/70 bg-[#ECB44D] px-2.5 py-1 text-[0.68rem] font-bold text-[#171741] shadow-[0_0_16px_rgba(236,180,77,0.24)] md:text-xs"
                            >
                                {item.estado_cuadro}
                            </Badge>
                        )}
                        </div>
                    </div>

                    {/* Contenido */}
                    <CardContent className="flex-1 space-y-2.5 pt-4 text-[#F2E199]">
                        {/* Condición y Estado */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#F2E199]/82 md:text-sm">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6FB8E6]/30 bg-[#194174]/36 px-2.5 py-1">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#6FB8E6]" />
                                {item.estado_condicion}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECB44D]/30 bg-[#194174]/36 px-2.5 py-1">
                                <Tag className="h-3.5 w-3.5 shrink-0 text-[#ECB44D]" />
                                {item.estado_cuadro}
                            </span>
                        </div>
                        {/* Categorías */}
                        <div className="flex items-start gap-2 text-xs text-[#F2E199]/84 md:text-sm">
                            <Palette className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ECB44D]" />
                            <span>
                                {Array.isArray(item.categorias)
                                    ? item.categorias.map(c => typeof c === 'object' ? c.descripcion : c).join(", ")
                                    : item.categorias || "Sin categoria"}
                            </span>
                        </div>
                        {/* Propietario */}
                        {item.nombre_dueno && (
                            <div className="flex items-center gap-2 text-xs text-[#F2E199]/84 md:text-sm">
                                <Gavel className="h-3.5 w-3.5 shrink-0 text-[#6FB8E6]" />
                                <span>Propietario: {item.nombre_dueno}</span>
                            </div>
                        )}
                    </CardContent>

                    {/* Acciones */}
                    <div className="flex justify-end gap-2 border-t border-[#ECB44D]/30 px-3.5 py-2.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="size-8 border border-[#6FB8E6]/45 bg-[#194174]/60 text-[#F2E199] shadow-[0_0_18px_rgba(111,184,230,0.14)] hover:bg-[#6FB8E6] hover:text-[#171741]"
                                        asChild
                                    >
                                        <Link to={`/CuadrosSubastables/${item.id}`}>
                                            <Info className="h-3.5 w-3.5" />
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
