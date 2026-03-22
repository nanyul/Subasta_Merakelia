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
    CircleDollarSign,
    CalendarDays,
    ShieldCheck,
    Tag,
    Gavel,
    Sparkles,
    ScrollText,
    MapPin,
    Brush,
    Package,
    Award,
    Clock,
} from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';
import fondoTabla from "@/assets/fondoTabla.png";

//Services
import CuadrosService from '../../services/CuadrosService';

function formatearColones(valorEnColones) {
    const monto = Number(valorEnColones);

    if (Number.isNaN(monto)) {
        return 'Sin registrar';
    }

    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2,
    }).format(monto);
}

function formatearDolares(valorEnDolares) {
    const monto = Number(valorEnDolares);

    if (Number.isNaN(monto)) {
        return 'Sin registrar';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(monto);
}

export function DetailCuadro() {
    const navigate = useNavigate();
    const { id } = useParams();
    const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
    const [cuadro, setData] = useState(null);
    const [indiceImagenActual, setIndiceImagenActual] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CuadrosService.getCuadroById(id);
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

    const item = Array.isArray(cuadro?.data) ? cuadro.data[0] : cuadro?.data;
    const imagenesGaleria = item?.imagenes && item.imagenes.length > 0
        ? item.imagenes.filter((imagen) => imagen?.datos)
        : (item?.imagen?.datos ? [item.imagen] : []);

    useEffect(() => {
        setIndiceImagenActual(0);
    }, [id, imagenesGaleria.length]);

    useEffect(() => {
        if (imagenesGaleria.length <= 1) {
            return undefined;
        }

        const intervaloId = window.setInterval(() => {
            setIndiceImagenActual((indicePrevio) => (indicePrevio + 1) % imagenesGaleria.length);
        }, 5000);

        return () => window.clearInterval(intervaloId);
    }, [imagenesGaleria.length]);

    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar cuadros" message={error} />;
    if (!cuadro || !cuadro.data || (Array.isArray(cuadro.data) && cuadro.data.length === 0))
        return <EmptyState message="No se encontró el cuadro solicitado." />;

    // El backend retorna un array, tomamos el primer elemento
    const detailCards = [
        {
            label: 'Artista',
            value: item.nombre_artista || 'Sin registrar',
            icon: Palette,
            accent: '#ECB44D',
        },
        {
            label: 'Año de creación',
            value: item.ano_creacion || 'Sin registrar',
            icon: Clock,
            accent: '#F2E199',
        },
        {
            label: 'Técnica',
            value: item.tecnica || 'Sin registrar',
            icon: Brush,
            accent: '#6FB8E6',
        },
        {
            label: 'Material',
            value: item.material_soporte || 'Sin registrar',
            icon: Package,
            accent: '#ECB44D',
        },
        {
            label: 'Procedencia',
            value: item.procedencia || 'Sin registrar',
            icon: MapPin,
            accent: '#6FB8E6',
        },
        {
            label: 'Certificado',
            value: item.certificado_autenticidad == 1 ? 'Sí' : 'No',
            icon: Award,
            accent: '#F2E199',
        },
        {
            label: 'Condicion',
            value: item.estado_condicion || 'Sin registrar',
            icon: ShieldCheck,
            accent: '#6FB8E6',
        },
        {
            label: 'Estado',
            value: item.estado_cuadro || 'Sin registrar',
            icon: Tag,
            accent: '#F2E199',
        },
        {
            label: 'Fecha de registro',
            value: item.fecha_registro || 'Sin registrar',
            icon: CalendarDays,
            accent: '#6FB8E6',
        },
        {
            label: 'Valor estimado',
            value: item.valor_estimado && item.valor_estimado_colones ? (
                <span className="flex flex-col gap-0.5">
                    <span>{formatearDolares(item.valor_estimado)}</span>
                    <span className="text-[0.68rem] font-medium text-[#6FB8E6] md:text-[0.72rem]">
                        {formatearColones(item.valor_estimado_colones)}
                    </span>
                </span>
            ) : 'Sin registrar',
            icon: CircleDollarSign,
            accent: '#ECB44D',
        },
        {
            label: 'Propietario',
            value: item.nombre_dueno || 'Sin registrar',
            icon: User,
            accent: '#ECB44D',
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
                        {item.nombre}
                    </h1>
                    {item.descripcion && (
                        <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-[#6FB8E6] md:text-sm">
                            {item.descripcion}
                        </p>
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
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
                                    <div className="relative aspect-4/5 w-full overflow-hidden">
                                        {imagenesGaleria.length > 0 ? (
                                            <div
                                                className="flex h-full transition-transform duration-700 ease-in-out"
                                                style={{ transform: `translateX(-${indiceImagenActual * 100}%)` }}
                                            >
                                                {imagenesGaleria.map((imagen, index) => (
                                                    <div key={imagen.id ?? index} className="h-full w-full shrink-0">
                                                        <img
                                                            src={`${BASE_URL}/${imagen.datos}`}
                                                            alt={`Obra artística ${item.nombre} ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#F2E199]/70">
                                                <ImageIcon className="h-12 w-12" />
                                            </div>
                                        )}

                                        {imagenesGaleria.length > 1 && (
                                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#ECB44D]/35 bg-[#171741]/65 px-2.5 py-1 backdrop-blur-sm">
                                                {imagenesGaleria.map((imagen, index) => (
                                                    <button
                                                        key={imagen.id ?? `dot-${index}`}
                                                        type="button"
                                                        onClick={() => setIndiceImagenActual(index)}
                                                        className={`h-2.5 w-2.5 rounded-full transition ${index === indiceImagenActual ? 'bg-[#F2E199] shadow-[0_0_10px_rgba(242,225,153,0.8)]' : 'bg-[#6FB8E6]/45 hover:bg-[#6FB8E6]/70'}`}
                                                        aria-label={`Ver imagen ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <Badge className="absolute right-2.5 top-2.5 border border-[#ECB44D]/70 bg-[#194174]/88 px-2.5 py-1 text-[0.68rem] font-bold text-[#F2E199] shadow-[0_0_14px_rgba(111,184,230,0.16)] backdrop-blur-sm">
                                            {item.estado_cuadro}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {imagenesGaleria.length > 1 && (
                            <Card className="border-[#ECB44D]/50 bg-[#171741]/68 shadow-[0_20px_60px_rgba(12,18,46,0.36)] backdrop-blur-md">
                                <CardContent className="p-3.5">
                                    <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/35 bg-[#194174]/55 px-2.5 py-1 text-[#F2E199]">
                                        <Sparkles className="h-3 w-3 text-[#ECB44D]" />
                                        <span className="text-[0.62rem] uppercase tracking-[0.22em]">Galeria</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {imagenesGaleria.map((imagen, index) => (
                                            <div key={imagen.id ?? index} className="overflow-hidden rounded-lg border border-[#ECB44D]/35 bg-[#194174]/32">
                                                <div className="aspect-square">
                                                    <img
                                                        src={`${BASE_URL}/${imagen.datos}`}
                                                        alt={`${item.nombre} ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-3.5">
                        <Card className="border-[#ECB44D]/50 bg-[#171741]/64 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md">
                            <CardContent className="p-3 md:p-3.5">
                                <div className="mb-2.5 flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-2 py-1 text-[#F2E199]">
                                        <ScrollText className="h-3 w-3 text-[#ECB44D]" />
                                        <span className="text-[0.68rem] uppercase tracking-[0.22em] md:text-xs">Especificaciones</span>
                                    </div>
                                </div>

                                {item.categorias && Array.isArray(item.categorias) && item.categorias.length > 0 && (
                                    <div className="rounded-xl border border-[#ECB44D]/35 bg-[#194174]/20 p-2.5">
                                        <div className="mb-2 flex items-center gap-2 text-[#F2E199]">
                                            <Palette className="h-3.5 w-3.5 text-[#ECB44D]" />
                                            <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Categorias</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.categorias.map((cat, index) => (
                                                <Badge key={index} className="border border-[#ECB44D]/60 bg-[#194174]/60 px-2 py-0.5 text-[0.68rem] text-[#F2E199] hover:bg-[#194174]/60">
                                                    {typeof cat === 'object' ? cat.descripcion : cat}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

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

                        {item.subasta && item.subasta.length > 0 && (
                            <Card className="border-[#ECB44D]/50 bg-[#171741]/64 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md">
                                <CardContent className="p-3 md:p-3.5">
                                    <div className="mb-2.5 flex items-center gap-3 text-[#F2E199]">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-2 py-1">
                                            <Gavel className="h-3 w-3 text-[#ECB44D]" />
                                            <span className="text-[0.68rem] uppercase tracking-[0.22em] md:text-xs">Historial de subastas</span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden rounded-lg border border-[#ECB44D]/35 bg-[#194174]/18">
                                        <Table className="table-fixed">
                                            <TableHeader>
                                                <TableRow className="border-0 hover:bg-transparent">
                                                    <TableHead className="h-7 border-r border-b border-[#b68f2f] bg-[#e3d38c] px-1.5 text-center text-[0.56rem] font-bold uppercase tracking-wide text-[#171741]">ID</TableHead>
                                                    <TableHead className="h-7 border-r border-b border-[#b68f2f] bg-[#e3d38c] px-1.5 text-center text-[0.56rem] font-bold uppercase tracking-wide text-[#171741]">Inicio</TableHead>
                                                    <TableHead className="h-7 border-r border-b border-[#b68f2f] bg-[#e3d38c] px-1.5 text-center text-[0.56rem] font-bold uppercase tracking-wide text-[#171741]">Cierre</TableHead>
                                                    <TableHead className="h-7 border-b border-[#b68f2f] bg-[#e3d38c] px-1.5 text-center text-[0.56rem] font-bold uppercase tracking-wide text-[#171741]">Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {item.subasta.map((sub) => (
                                                    <TableRow key={sub.id} className="border-0 bg-[#1a1a5a]/94 hover:bg-[#202068]/96">
                                                        <TableCell className="h-7 border-r border-b border-[#b68f2f] px-1.5 py-1 text-center text-[0.58rem] font-semibold text-[#F2E199]">
                                                            {sub.id}
                                                        </TableCell>
                                                        <TableCell className="h-7 border-r border-b border-[#b68f2f] px-1.5 py-1 text-center text-[0.58rem] text-[#F2E199]">
                                                            {sub.fecha_inicio}
                                                        </TableCell>
                                                        <TableCell className="h-7 border-r border-b border-[#b68f2f] px-1.5 py-1 text-center text-[0.58rem] text-[#F2E199]">
                                                            {sub.fecha_cierre}
                                                        </TableCell>
                                                        <TableCell className="h-7 border-b border-[#b68f2f] px-1.5 py-1 text-center">
                                                            <Badge className="border border-[#6FB8E6]/50 bg-[#194174]/65 px-1.5 py-0.5 text-[0.56rem] text-[#F2E199] hover:bg-[#194174]/65">
                                                                {sub.estado_subasta}
                                                            </Badge>
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
                    className="mt-4 flex h-8 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-3.5 text-xs text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.15)] hover:bg-[#194174] hover:text-[#F2E199]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>
            </div>
        </div>
    );
}