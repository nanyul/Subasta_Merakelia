import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    ArrowLeft,
    Gavel,
    User,
    //CalendarDays,
    DollarSign,
    Trophy,
    TrendingUp,
    Clock
} from "lucide-react";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

import fondoTabla from "@/assets/fondoTabla.png";

import SubastaService from "@/services/SubastaService";

export function HistorialPujas() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [pujas, setPujas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // FORMATO DE PRECIO
    const formatPrice = (price) => {
        return `$ ${Number(price).toFixed(2)}`;
    };

    // FORMATO DE FECHA
    const formatDate = (date) => {

        return new Date(date).toLocaleString("es-CR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });

    };

    useEffect(() => {

        const fetchData = async () => {

            try {

                const response = await SubastaService.getHistorialPujas(id);
                const result = response.data;

                if (result.success) {

                    const pujasArray = Array.isArray(result.data) ? result.data : [];

                    // VALIDACIÓN: solo pujas relacionadas con esta subasta
                    const pujasFiltradas = pujasArray.filter(
                        (p) => p.id_subasta == id
                    );

                    // ORDEN CRONOLÓGICO DESCENDENTE
                    const ordenadas = pujasFiltradas.sort(
                        (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)
                    );

                    setPujas(ordenadas);

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


    if (loading) return <LoadingGrid type="grid" />;

    if (error)
        return <ErrorAlert title="Error al cargar historial de pujas" message={error} />;

    if (pujas.length === 0)
        return <EmptyState message="No hay pujas registradas para esta subasta." />;


    // PUJA MÁS ALTA
    const pujaMaxima = Math.max(...pujas.map(p => Number(p.monto)));

    // RANKING POR MONTO
    const ranking = [...pujas].sort(
        (a, b) => Number(b.monto) - Number(a.monto)
    );

    // GANADOR ACTUAL
    const pujaGanadora = ranking[0];


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

                {/* HEADER */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-3 py-1.5 text-[#F2E199]">
                        <Gavel className="h-4 w-4 text-[#ECB44D]" />
                        <span className="text-sm uppercase tracking-[0.22em] md:text-base">Historial de Pujas</span>
                    </div>
                </div>

                {/* PUJA GANADORA */}
                <Card 
                    className="mb-6 overflow-hidden border-[#ECB44D]/50 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md"
                    style={{
                        background: 'linear-gradient(180deg, rgba(33,52,101,0.94) 0%, rgba(23,23,65,0.95) 52%, rgba(19,22,78,0.96) 100%)',
                    }}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECB44D] bg-[#ECB44D]/20">
                                <Trophy className="h-5 w-5 text-[#ECB44D]" />
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-[#6FB8E6]">
                                    Puja más alta actual
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg font-bold text-[#F2E199]">
                                        {pujaGanadora.usuario}
                                    </span>
                                    <Badge className="border border-[#ECB44D]/60 bg-[#194174]/60 px-2 py-0.5 text-sm text-[#F2E199]">
                                        {formatPrice(pujaGanadora.monto)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* TOTAL PUJAS Y ESTADÍSTICAS */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[#6FB8E6]">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Total de pujas registradas:</span>
                        <span className="font-bold text-[#F2E199] text-lg">
                            {pujas.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#6FB8E6]">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Monto máximo:</span>
                        <span className="font-bold text-[#F2E199]">
                            {formatPrice(pujaMaxima)}
                        </span>
                    </div>
                </div>

                {/* TABLA DE PUJAS */}
                <Card 
                    className="overflow-hidden border-[#ECB44D]/50 bg-[#171741]/64 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md"
                >
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-0 hover:bg-transparent">
                                        <TableHead className="h-10 border-r border-b border-[#b68f2f] bg-[#e3d38c] px-3 text-center text-xs font-bold uppercase tracking-wide text-[#d89c2a]">
                                            Ranking
                                        </TableHead>
                                        <TableHead className="h-10 border-r border-b border-[#b68f2f] bg-[#e3d38c] px-3 text-center text-xs font-bold uppercase tracking-wide text-[#d89c2a]">
                                            Usuario
                                        </TableHead>
                                        <TableHead className="h-10 border-r border-b border-[#b68f2f] bg-[#e3d38c] px-3 text-center text-xs font-bold uppercase tracking-wide text-[#d89c2a]">
                                            Monto ofertado
                                        </TableHead>
                                        <TableHead className="h-10 border-b border-[#b68f2f] bg-[#e3d38c] px-3 text-center text-xs font-bold uppercase tracking-wide text-[#d89c2a]">
                                            Fecha y hora
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {pujas.map((puja) => {

                                        const esMayor = Number(puja.monto) === pujaMaxima;
                                        const posicion = ranking.findIndex(r => r.id === puja.id) + 1;

                                        return (

                                            <TableRow 
                                                key={puja.id} 
                                                className={`border-0 bg-[#1a1a5a]/94 hover:bg-[#202068]/96 ${
                                                    esMayor ? 'bg-[#ECB44D]/10' : ''
                                                }`}
                                            >

                                                {/* RANKING */}
                                                <TableCell className="h-10 border-r border-b border-[#b68f2f] px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {posicion === 1 && (
                                                            <Trophy className="h-3 w-3 text-[#ECB44D]" />
                                                        )}
                                                        <span className={`font-bold ${
                                                            posicion === 1 
                                                                ? 'text-[#ECB44D]' 
                                                                : 'text-[#F2E199]'
                                                        }`}>
                                                            #{posicion}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* USUARIO */}
                                                <TableCell className="h-10 border-r border-b border-[#b68f2f] px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5 text-[#6FB8E6]" />
                                                        <span className="text-sm font-medium text-[#F2E199]">
                                                            {puja.usuario}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* MONTO */}
                                                <TableCell className="h-10 border-r border-b border-[#b68f2f] px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-3.5 w-3.5 text-[#6FB8E6]" />
                                                        <span className={`text-sm font-semibold ${
                                                            esMayor 
                                                                ? 'text-[#ECB44D]' 
                                                                : 'text-[#F2E199]'
                                                        }`}>
                                                            {formatPrice(puja.monto)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* FECHA */}
                                                <TableCell className="h-10 border-b border-[#b68f2f] px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5 text-[#6FB8E6]" />
                                                        <span className="text-sm text-[#F2E199]">
                                                            {formatDate(puja.fecha_hora)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                            </TableRow>

                                        );

                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* BOTÓN REGRESAR */}
                <div className="mt-6">
                    <Button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-8 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-3.5 text-xs text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.15)] hover:bg-[#194174] hover:text-[#F2E199]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </Button>
                </div>
            </div>
        </div>
    );
}