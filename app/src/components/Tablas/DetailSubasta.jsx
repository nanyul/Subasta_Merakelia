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
    Eye,
    ScrollText,
    //Sparkles,
    Clock,
    TrendingUp,
    Package
} from "lucide-react";

import fondoTabla from "@/assets/fondoTabla.png";

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

    // Datos para las tarjetas de detalle
    const detailCards = [
        {
            label: 'Precio base',
            value: formatPrice(subasta.precio_base),
            icon: DollarSign,
            accent: '#ECB44D',
        },
        {
            label: 'Incremento mínimo',
            value: formatPrice(subasta.incremento_minimo),
            icon: TrendingUp,
            accent: '#6FB8E6',
        },
        {
            label: 'Fecha inicio',
            value: subasta.fecha_inicio,
            icon: CalendarDays,
            accent: '#F2E199',
        },
        {
            label: 'Fecha cierre',
            value: subasta.fecha_fin,
            icon: Clock,
            accent: '#6FB8E6',
        },
        {
            label: 'Estado',
            value: subasta.estado,
            icon: Tag,
            accent: '#ECB44D',
        },
        {
            label: 'Cantidad de pujas',
            value: subasta.cantidad_pujas,
            icon: Gavel,
            accent: '#F2E199',
        },
    ];

    return (

        <div
            className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-7 md:py-10"
            style={{
                backgroundImage: `linear-gradient(rgba(7, 13, 34, 0.34), rgba(7, 13, 34, 0.68)), url(${fondoTabla})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
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

            <div className="relative z-10 mx-auto max-w-6xl pt-12 md:pt-14">
                <div className="mb-5 md:mb-6">
                    <h1
                        className="text-[1.9rem] leading-none text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.8rem]"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        {subasta.objeto}
                    </h1>
                </div>

                <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
                    {/* IMAGEN DEL OBJETO */}
                    <div className="space-y-3.5">
                        <Card
                            className="overflow-hidden border-[#ECB44D]/50 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md"
                            style={{
                                background: 'linear-gradient(180deg, rgba(33,52,101,0.94) 0%, rgba(23,23,65,0.95) 52%, rgba(19,22,78,0.96) 100%)',
                            }}
                        >
                            <CardContent className="p-3.5">
                                <div className="relative overflow-hidden rounded-[1.05rem] border border-[#ECB44D]/45 bg-[#194174]/38">
                                    <div className="absolute inset-0 bg-linear-to-b from-[#6FB8E6]/10 via-transparent to-[#171741]/24" />
                                    <div className="relative aspect-4/5 w-full flex items-center justify-center">
                                        {subasta.imagen?.datos ? (
                                            <img
                                                src={`${BASE_URL}/${subasta.imagen.datos}`}
                                                alt={subasta.objeto}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#F2E199]/70">
                                                <ImageIcon className="h-12 w-12" />
                                            </div>
                                        )}
                                        <Badge className="absolute right-2.5 top-2.5 border border-[#ECB44D]/70 bg-[#194174]/88 px-2.5 py-1 text-[0.68rem] font-bold text-[#F2E199] shadow-[0_0_14px_rgba(111,184,230,0.16)] backdrop-blur-sm">
                                            {subasta.estado}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* DETALLE */}
                    <div className="space-y-3.5">
                        <Card className="border-[#ECB44D]/50 bg-[#171741]/64 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md">
                            <CardContent className="p-3 md:p-3.5">
                                <div className="mb-2.5 flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-2 py-1 text-[#F2E199]">
                                        <ScrollText className="h-3 w-3 text-[#ECB44D]" />
                                        <span className="text-[0.68rem] uppercase tracking-[0.22em] md:text-xs">Información de la subasta</span>
                                    </div>
                                </div>

                                {/* CATEGORÍAS */}
                                {subasta.categorias && subasta.categorias.length > 0 && (
                                    <div className="rounded-xl border border-[#ECB44D]/35 bg-[#194174]/20 p-2.5 mb-3.5">
                                        <div className="mb-2 flex items-center gap-2 text-[#F2E199]">
                                            <Layers className="h-3.5 w-3.5 text-[#ECB44D]" />
                                            <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Categorías</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {subasta.categorias.map((cat, index) => (
                                                <Badge key={index} className="border border-[#ECB44D]/60 bg-[#194174]/60 px-2 py-0.5 text-[0.68rem] text-[#F2E199] hover:bg-[#194174]/60">
                                                    {typeof cat === 'object' ? cat.descripcion : cat}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CONDICIÓN */}
                                <div className="rounded-xl border border-[#ECB44D]/35 bg-[#194174]/20 p-2.5 mb-3.5">
                                    <div className="mb-2 flex items-center gap-2 text-[#F2E199]">
                                        <Package className="h-3.5 w-3.5 text-[#ECB44D]" />
                                        <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Condición del objeto</span>
                                    </div>
                                    <p className="text-[0.84rem] font-semibold text-[#F2E199]">
                                        {subasta.condicion}
                                    </p>
                                </div>

                                {/* TARJETAS DE DETALLE */}
                                <div className="mt-3.5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                    {detailCards.map((detail) => {
                                        const Icon = detail.icon;

                                        return (
                                            <div
                                                key={detail.label}
                                                className="group rounded-xl border border-[#ECB44D]/40 bg-[#194174]/24 p-2.5 transition duration-300 hover:-translate-y-1 hover:bg-[#194174]/36"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div
                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                                                        style={{
                                                            borderColor: `${detail.accent}88`,
                                                            backgroundColor: `${detail.accent}1c`,
                                                            boxShadow: `0 0 24px ${detail.accent}22`,
                                                        }}
                                                    >
                                                        <Icon className="h-3 w-3" style={{ color: detail.accent }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#6FB8E6]">
                                                            {detail.label}
                                                        </p>
                                                        <p className="mt-0.5 wrap-break-word text-[0.76rem] font-semibold text-[#F2E199] md:text-[0.84rem]">
                                                            {detail.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* BOTÓN HISTORIAL */}
                        {subasta.estado !== "Cancelada" && subasta.cantidad_pujas > 0 && (
                            <div className="flex justify-start">
                                <Link to={`/subasta/pujas/${id}`}>
                                    <Button className="flex gap-2 border border-[#ECB44D] bg-[#171741]/70 px-3.5 text-xs text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.15)] hover:bg-[#194174] hover:text-[#F2E199] h-8">
                                        <Eye className="w-4 h-4" />
                                        Ver historial de pujas
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTÓN REGRESAR */}
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 flex h-8 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-3.5 text-xs text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.15)] hover:bg-[#194174] hover:text-[#F2E199]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>
            </div>
        </div>
    );
}