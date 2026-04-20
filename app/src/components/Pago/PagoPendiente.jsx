import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Clock, AlertCircle, ChevronRight } from "lucide-react";
import fondoTabla from "@/assets/fondoTabla.png";
import PropTypes from "prop-types";
import SubastaService from "@/services/SubastaService";

function formatPrice(v) {
    return `$ ${Number(v).toFixed(2)}`;
}

function formatDate(d) {
    return new Date(d).toLocaleString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function PagoPendiente() {
    const navigate = useNavigate();
    const [subastas, setSubastas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    useEffect(() => {
        cargarSubastasPendientes();
    }, []);

    const cargarSubastasPendientes = async () => {
        try {
            setLoading(true);
            const res = await SubastaService.getSubastasPendientesPago();
            const data = res.data?.data ?? res.data ?? [];
            
            if (Array.isArray(data)) {
                setSubastas(data);
                if (data.length === 0) {
                    setError("No hay pagos pendientes");
                }
            } else {
                setSubastas([]);
                setError("Error al cargar los pagos pendientes");
            }
        } catch (err) {
            console.error("Error cargando subastas pendientes:", err);
            setError("Error al cargar los pagos pendientes");
            setSubastas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleIrAPagar = (subasta) => {
        const pujaMaxima = subasta.puja_maxima || {};
        navigate("/pago", { 
            state: { 
                subastaId: subasta.id, 
                ganador: pujaMaxima 
            } 
        });
    };

    if (loading) {
        return (
            <div
                className="relative min-h-screen bg-[#171741] text-white overflow-hidden flex items-center justify-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(23,23,65,0.34), rgba(23,23,65,0.68)), url(${fondoTabla})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="relative z-10">
                    <p className="text-[#F2E199]">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error && subastas.length === 0) {
        return (
            <div
                className="relative min-h-screen bg-[#171741] text-white overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(rgba(23,23,65,0.34), rgba(23,23,65,0.68)), url(${fondoTabla})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="hero-stars-soft absolute inset-0 opacity-80" />
                <div className="hero-stars absolute inset-0 opacity-90" />
                <div className="relative z-10 mx-auto max-w-4xl pt-12 md:pt-14 px-4 pb-12">
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            size="sm"
                            className="text-[#6FB8E6] hover:text-[#ECB44D] hover:bg-[#171741]/40"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Volver
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#F2E199]">Pagos Pendientes</h1>
                        <div className="w-10" />
                    </div>

                    <Card className="border-[#ECB44D]/20 bg-[#171741]/60 backdrop-blur-sm">
                        <CardContent className="pt-8">
                            <div className="flex items-center gap-3 text-[#ECB44D]">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen bg-[#171741] text-white overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(rgba(23,23,65,0.34), rgba(23,23,65,0.68)), url(${fondoTabla})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div className="hero-stars-soft absolute inset-0 opacity-80" />
            <div className="hero-stars absolute inset-0 opacity-90" />
            <div className="absolute inset-0" style={{
                background: "radial-gradient(circle at 18% 18%, rgba(111,184,230,0.08) 0%, transparent 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.09) 0%, transparent 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.07) 0%, transparent 26%)"
            }} />

            <div className="relative z-10 mx-auto max-w-5xl pt-12 md:pt-14 px-4 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="ghost"
                        size="sm"
                        className="text-[#6FB8E6] hover:text-[#ECB44D] hover:bg-[#171741]/40"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#F2E199]">
                        Pagos Pendientes ({subastas.length})
                    </h1>
                    <div className="w-10" />
                </div>

                {/* Lista de subastas */}
                <div className="space-y-4">
                    {subastas.map((subasta) => {
                        const monto = subasta.puja_maxima?.monto || 0;
                        // Usar imagen.datos como en TableSubastas
                        const imagen = subasta.imagen?.datos ? `${BASE_URL}/${subasta.imagen.datos}` : null;

                        return (
                            <Card 
                                key={subasta.id}
                                className="border-[#ECB44D]/20 bg-[#171741]/60 backdrop-blur-sm hover:border-[#ECB44D]/50 transition-all"
                            >
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                        {/* Imagen */}
                                        {imagen && (
                                            <div className="md:col-span-1">
                                                <img
                                                    src={imagen}
                                                    alt={subasta.objeto || "Cuadro"}
                                                    className="w-full h-40 object-cover rounded-lg border border-[#ECB44D]/20"
                                                />
                                            </div>
                                        )}

                                        {/* Detalles */}
                                        <div className={`${imagen ? 'md:col-span-2' : 'md:col-span-3'} space-y-3`}>
                                            <div>
                                                <h3 className="text-[#F2E199] font-semibold text-lg">
                                                    {subasta.objeto || "Cuadro sin nombre"}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <DollarSign className="h-4 w-4 text-[#ECB44D]" />
                                                <span className="text-[#ECB44D]">Monto:</span>
                                                <span className="text-[#F2E199] font-semibold">
                                                    {formatPrice(monto)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Clock className="h-4 w-4 text-[#ECB44D]" />
                                                <span className="text-[#ECB44D]">Fin:</span>
                                                <span className="text-[#F2E199] text-sm">
                                                    {formatDate(subasta.fecha_fin)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 pt-1">
                                                <span className="px-3 py-1 rounded-full bg-[#ECB44D]/20 border border-[#ECB44D]/40 text-[#ECB44D] font-semibold text-xs">
                                                    Pendiente
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botón */}
                                        <div className="md:col-span-1 flex justify-end">
                                            <Button
                                                onClick={() => handleIrAPagar(subasta)}
                                                className="w-full md:w-auto bg-[#ECB44D] text-[#171741] hover:bg-[#ECB44D]/80 font-semibold flex items-center justify-center gap-2"
                                            >
                                                Pagar
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

PagoPendiente.propTypes = {};

export default PagoPendiente;
