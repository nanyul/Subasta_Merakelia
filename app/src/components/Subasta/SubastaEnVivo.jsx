// src/pages/subasta/SubastaEnVivo.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAblySubasta } from "@/hooks/useAblySubasta";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingGrid } from "@/components/ui/custom/LoadingGrid";
import { ErrorAlert } from "@/components/ui/custom/ErrorAlert";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { ArrowLeft, Gavel, User, DollarSign, Clock, TrendingUp, Trophy, Medal, Crown, AlertCircle, CheckCircle, XCircle, RefreshCw, Zap, CalendarDays, ImageIcon, Package, ScrollText } from "lucide-react";
import fondoTabla from "@/assets/fondoTabla.png";
import SubastaService from "@/services/SubastaService";
import UserService from "@/services/UserService";

function parseFechaLocal(value) {
    if (!value) return null;

    const normalizada = String(value).trim().replace(" ", "T");
    const fecha = new Date(normalizada);

    return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function subastaEstaActiva(data) {
    if (!data) return false;
    const inicio = parseFechaLocal(data.fecha_inicio);
    const fin    = parseFechaLocal(data.fecha_fin);
    const ahora  = new Date();

    if (inicio && fin) return ahora >= inicio && ahora <= fin;

    const estadoId    = Number(data.id_estado_subasta ?? data.id_estado ?? data.idEstadoSubasta);
    const estadoTexto = String(data.estado ?? "").trim().toLowerCase();
    if (estadoId === 1) return true;
    if (estadoTexto.includes("activa") || estadoTexto.includes("en vivo")) return true;
    return false;
}

function esUsuarioComprador(u) {
    if (!u) return false;
    const rol    = String(u.rol ?? u.descripcion_rol ?? u.tipo_rol ?? "").trim().toLowerCase();
    const estado = String(u.estado ?? "").trim().toLowerCase();
    const idRol  = Number(u.id_rol);
    return (idRol === 1 || rol.includes("comprador") || rol.includes("cliente"))
        && !rol.includes("vendedor")
        && (!estado || estado === "activo" || estado === "1");
}

function extractArray(response) {
    const p = response?.data;
    if (Array.isArray(p))       return p;
    if (Array.isArray(p?.data)) return p.data;
    if (p && typeof p === "object") return Object.values(p).find(Array.isArray) ?? [];
    return [];
}


function extraerMensajeError(err) {
    let data = err?.response?.data;

    // Intentar parsear si Chrome entregó el body como string
    if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { /* no era JSON válido */ }
    }

    if (data && typeof data === "object") {
        if (typeof data.mensaje === "string" && data.mensaje) return data.mensaje;
        if (typeof data.error   === "string" && data.error)   return data.error;
        if (typeof data.message === "string" && data.message) return data.message;
    }

    // String directo (ya parseado o no parseable como objeto)
    if (typeof data === "string" && data) return data;

    // Error de red u otro
    if (typeof err?.message === "string" && err.message) return err.message;
    return "Error desconocido al registrar la puja.";
}

function Toaster({ notificacion, onClose }) {
    if (!notificacion) return null;
    const tieneAcciones = notificacion.acciones && notificacion.acciones.length > 0;
    return createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none px-4">
            <Alert className={`pointer-events-auto flex flex-col max-w-xl gap-3 border px-4 py-3 shadow-lg animate-in zoom-in-95 ${
                notificacion.tipo === "success" ? "border-[#171741]/50 bg-[#171741]/80" :
                notificacion.tipo === "error"   ? "border-red-500/50 bg-red-900/80"     :
                notificacion.tipo === "warning" ? "border-[#ECB44D]/50 bg-[#171741]/80" :
                                                  "border-[#6FB8E6]/50 bg-[#194174]/80"
            }`}>
                <div className="flex items-start gap-2">
                    {notificacion.tipo === "success" && <CheckCircle className="h-4 w-4 text-[#ECB44D] shrink-0 mt-0.5" />}
                    {notificacion.tipo === "error"   && <XCircle     className="h-4 w-4 text-red-400 shrink-0 mt-0.5"   />}
                    {notificacion.tipo === "warning" && <AlertCircle className="h-4 w-4 text-[#ECB44D] shrink-0 mt-0.5" />}
                    {notificacion.tipo === "info"    && <Zap         className="h-4 w-4 text-[#6FB8E6] shrink-0 mt-0.5" />}
                    <AlertDescription className="text-white flex-1">{notificacion.mensaje}</AlertDescription>
                </div>
                <div className="flex gap-2 ml-6">
                    {tieneAcciones && notificacion.acciones.map((accion, idx) => (
                        <Button
                            key={idx}
                            onClick={() => {
                                accion.onClick?.();
                                onClose();
                            }}
                            className={accion.variant === "secondary" 
                                ? "bg-[#194174]/60 border border-[#6FB8E6] text-[#6FB8E6] hover:bg-[#194174]"
                                : "bg-[#ECB44D] text-[#171741] hover:bg-[#ECB44D]/80 font-semibold"
                            }
                            size="sm"
                        >
                            {accion.label}
                        </Button>
                    ))}
                    {!tieneAcciones && (
                        <Button
                            onClick={onClose}
                            className="bg-[#194174]/60 border border-[#6FB8E6] text-[#6FB8E6] hover:bg-[#194174]"
                            size="sm"
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
            </Alert>
        </div>,
        document.body
    );
}
Toaster.propTypes = { 
    notificacion: PropTypes.shape({ 
        mensaje: PropTypes.string, 
        tipo: PropTypes.string,
        acciones: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            onClick: PropTypes.func,
            variant: PropTypes.oneOf(["primary", "secondary"])
        }))
    }),
    onClose: PropTypes.func
};

export function SubastaEnVivo() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_URL + "uploads";

    const [subasta,        setSubasta]        = useState(null);
    const [historial,      setHistorial]      = useState([]);
    const [pujaMaxima,     setPujaMaxima]     = useState(null);
    const [subastaCerrada, setSubastaCerrada] = useState(false);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);

    const [compradores,     setCompradores]     = useState([]);
    const [selectedBuyerId, setSelectedBuyerId] = useState("");

    const [montoPuja,    setMontoPuja]    = useState("");
    const [enviando,     setEnviando]     = useState(false);
    const [notificacion, setNotificacion] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(null);

    const timeoutRef           = useRef(null);
    // Ref para acceder al comprador actual dentro de handleNuevaPuja
    // sin que el callback se re-cree y re-suscriba a Ably en cada render
    const compradorRef          = useRef(null);

    const formatPrice = (v) => `$ ${Number(v).toFixed(2)}`;
    const formatDate  = (d) => new Date(d).toLocaleString("es-CR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
    });

    const mostrarNotificacion = useCallback((mensaje, tipo = "info", acciones = null) => {
        let mensajeSeguro, tipoSeguro, accionesSeguro;
        
        if (typeof mensaje === "object" && mensaje !== null) {
            // Si es un objeto, extraer propiedades
            mensajeSeguro = mensaje.mensaje ?? "Operación completada.";
            tipoSeguro = mensaje.tipo ?? "info";
            accionesSeguro = mensaje.acciones ?? null;
        } else {
            // Si es string, usar los parámetros
            mensajeSeguro = typeof mensaje === "string" && mensaje
                ? mensaje
                : tipo === "error"
                    ? "Ocurrió un error inesperado."
                    : "Operación completada.";
            tipoSeguro = tipo;
            accionesSeguro = acciones;
        }
        
        setNotificacion({ mensaje: mensajeSeguro, tipo: tipoSeguro, acciones: accionesSeguro });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
    }, []);
    
    const cerrarNotificacion = useCallback(() => {
        setNotificacion(null);
    }, []);

    const compradoresDisponibles = useMemo(() => compradores.filter(esUsuarioComprador), [compradores]);
    const compradorSeleccionado  = useMemo(
        () => compradoresDisponibles.find((u) => String(u.id) === String(selectedBuyerId)) ?? null,
        [compradoresDisponibles, selectedBuyerId]
    );

    // Mantener la ref sincronizada para que handleNuevaPuja siempre
    // vea el comprador actual sin necesitar estar en sus dependencias
    useEffect(() => {
        compradorRef.current = compradorSeleccionado;
    }, [compradorSeleccionado]);

    const cargarSubasta = useCallback(async (mostrarLoader = false) => {
        if (mostrarLoader) setLoading(true);
        try {
            const res  = await SubastaService.getDetalleSubasta(id);
            const data = res.data?.data ?? res.data;
            if (!data || data.error) { setError(data?.mensaje ?? "Error al cargar la subasta."); return; }
            setSubasta(data);
            const historialOrdenado = Array.isArray(data.historial)
                ? [...data.historial].sort((a, b) => Number(b.monto) - Number(a.monto))
                : [];
            setHistorial(historialOrdenado);
            setPujaMaxima(data.puja_maxima ?? null);
            setSubastaCerrada(false);
        } catch (err) {
            setError(err.message ?? "Error de conexión.");
        } finally {
            if (mostrarLoader) setLoading(false);
        }
    }, [id]);

    // Carga compradores
    useEffect(() => {
        let cancelled = false;
        UserService.getUsers().then((res) => {
            if (cancelled) return;
            const lista = extractArray(res);
            setCompradores(lista);
        }).catch(() => { if (!cancelled) setCompradores([]); });
        return () => { cancelled = true; };
    }, []);

    // Seleccionar comprador aleatorio al cargar disponibles
    useEffect(() => {
        if (compradoresDisponibles.length > 0 && !selectedBuyerId) {
            const indiceAleatorio = Math.floor(Math.random() * compradoresDisponibles.length);
            setSelectedBuyerId(String(compradoresDisponibles[indiceAleatorio].id));
        }
    }, [compradoresDisponibles, selectedBuyerId]);

    // Carga inicial
    useEffect(() => { cargarSubasta(true); }, [id]); 

    // Contador regresivo
    useEffect(() => {
        if (!subasta?.fecha_fin) return;
        const tick = () => {
            const diff = new Date(subasta.fecha_fin) - new Date();
            if (diff <= 0) {
                setTiempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0, finalizada: true });
                if (!subastaCerrada && subastaEstaActiva(subasta)) cargarSubasta(false);
                return;
            }
            setTiempoRestante({
                dias:     Math.floor(diff / 86400000),
                horas:    Math.floor((diff % 86400000) / 3600000),
                minutos:  Math.floor((diff % 3600000) / 60000),
                segundos: Math.floor((diff % 60000) / 1000),
                finalizada: false,
            });
        };
        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [subasta?.fecha_fin, subastaCerrada]); 

    // Finalizar subasta cuando vence
    useEffect(() => {
        if (!tiempoRestante?.finalizada || subastaCerrada || !subasta?.id) return;

        // Llamar para cerrar en la BD
        SubastaService.finalizarSubasta(subasta.id)
            .then((response) => {
                console.log('Respuesta finalizarSubasta:', response);
                setSubastaCerrada(true);
                setSubasta((prev) => prev ? { ...prev, estado: "Finalizada", id_estado_subasta: 2 } : prev);
                
                const ganadorData = response?.data?.ganador;
                console.log('Ganador recibido:', ganadorData);
                
                if (ganadorData) {
                    handleSubastaCerrada({ ganador: ganadorData });
                } else {
                    console.warn('No hay ganador (no hay pujas en la subasta)');
                }
            })
            .catch((err) => {
                // Log silencioso si falla, no afecta UX
                console.error('Error al finalizar subasta:', err);
            });
    }, [tiempoRestante?.finalizada, subastaCerrada, subasta?.id]);

    const montoMinimo = useMemo(() => {
        const base = pujaMaxima ? Number(pujaMaxima.monto) : Number(subasta?.precio_base ?? 0);
        return base + Number(subasta?.incremento_minimo ?? 0);
    }, [pujaMaxima, subasta]);

    // FIX: Cuando el montoMinimo sube (porque Ably actualizó pujaMaxima),
    // siempre reseteamos el campo al nuevo mínimo para que ambos navegadores
    // vean el monto correcto y el campo no quede con un valor inválido.
    useEffect(() => {
        if (!montoMinimo || montoMinimo <= 0) return;
        setMontoPuja(String(montoMinimo));
    }, [montoMinimo]);

    // ── Handler Ably: nueva puja llegada en tiempo real ──
    const handleNuevaPuja = useCallback((data) => {
        if (!data) return;

        if (Array.isArray(data.historial)) {
            const ordenado = [...data.historial].sort((a, b) => Number(b.monto) - Number(a.monto));
            setHistorial(ordenado);
        }

        if (data.puja_maxima !== undefined) {
            setPujaMaxima(data.puja_maxima);

            // Notificar al usuario si alguien superó su puja
            // Usamos compradorRef.current para leer el valor actual
            // sin que este callback se re-cree y desconecte Ably
            const comprador = compradorRef.current;
            const ganador   = data.puja_maxima;
            if (
                comprador &&
                ganador &&
                String(ganador.id_usuario ?? ganador.id) !== String(comprador.id)
            ) {
                mostrarNotificacion(
                    `¡${ganador.nombre_usuario ?? "Alguien"} superó la puja con ${
                        "$ " + Number(ganador.monto).toFixed(2)
                    }!`,
                    "warning"
                );
            }
        }
    }, [mostrarNotificacion]);

    const handleRealizarPago = useCallback(() => {
        navigate("/pago-pendiente", { state: { subastaId: id, ganador: pujaMaxima } });
    }, [mostrarNotificacion, navigate, id, pujaMaxima]);

    const handleNoPagarAun = useCallback(() => {
        mostrarNotificacion("Puedes completar el pago cuando estés listo.", "info");
        // TODO: Aquí iría la lógica para guardar que el usuario pospondrá el pago
    }, [mostrarNotificacion]);

    const seleccionarCompradorAleatorio = useCallback(() => {
        if (compradoresDisponibles.length === 0) {
            mostrarNotificacion("No hay compradores disponibles.", "error");
            return;
        }
        const indiceAleatorio = Math.floor(Math.random() * compradoresDisponibles.length);
        const compradorAleatorio = compradoresDisponibles[indiceAleatorio];
        setSelectedBuyerId(String(compradorAleatorio.id));
        mostrarNotificacion(`Comprador seleccionado: ${compradorAleatorio.nombre}`, "info");
    }, [compradoresDisponibles, mostrarNotificacion]);

    const handleSubastaCerrada = useCallback((data) => {
        setSubastaCerrada(true);
        setSubasta((prev) => prev ? { ...prev, estado: "Finalizada", id_estado_subasta: 2 } : prev);
        if (data?.ganador) setPujaMaxima(data.ganador);

        const ganador = data?.ganador;
        const comprador = compradorRef.current;
        const esGanador = comprador && ganador && String(ganador.id_usuario ?? ganador.id) === String(comprador.id);

        if (!ganador) {

            // No hay ganador (la subasta no tuvo pujas)
            mostrarNotificacion({
                mensaje: "La subasta ha finalizado pero no hay ganador (sin pujas registradas).",
                tipo: "info"
            });
        } else {
            // Si hay ganador, cambiar estado a PENDIENTE PAGO (5)
            SubastaService.cambiarAPendientePago(id)
                .catch((err) => console.error('Error al cambiar a pendiente pago:', err));

            if (esGanador) {
                mostrarNotificacion({
                    mensaje: "¡Felicidades has ganado la subasta! ¿Deseas realizar el pago?",
                    tipo: "success",
                    acciones: [
                        {
                            label: "Realizar Pago",
                            onClick: handleRealizarPago,
                            variant: "primary"
                        },
                        {
                            label: "Cancelar",
                            onClick: handleNoPagarAun,
                            variant: "secondary"
                        }
                    ]
                });
            } else {
                const nombreGanador = ganador?.nombre_usuario ?? "Desconocido";
                mostrarNotificacion({
                    mensaje: `Ha finalizado la subasta y el ganador es: ${nombreGanador}`,
                    tipo: "info"
                });
            }
        }
    }, [mostrarNotificacion, handleRealizarPago, handleNoPagarAun]);

    useAblySubasta(id, handleNuevaPuja, handleSubastaCerrada);

    // ── Pujar ──
    const handlePujar = async () => {
        if (!montoPuja || parseFloat(montoPuja) <= 0) {
            mostrarNotificacion("Ingresá un monto válido.", "error");
            return;
        }
        if (!compradorSeleccionado) {
            mostrarNotificacion("Seleccioná un comprador.", "error");
            return;
        }
        setEnviando(true);
        try {
            const res    = await SubastaService.registrarPuja(parseFloat(montoPuja), Number(compradorSeleccionado.id), parseInt(id));
            const result = res.data;
            

            if (result?.success) {
                // NO reseteamos montoPuja aquí — el useEffect de montoMinimo
                // lo actualizará automáticamente cuando Ably traiga la nueva pujaMaxima.
                // Así el campo siempre muestra el nuevo mínimo correcto en ambos navegadores.
                mostrarNotificacion("¡Puja registrada exitosamente!", "success");
            } else {
                // El servidor respondió 2xx pero con error lógico
                const msg = result?.mensaje ?? result?.error ?? result?.message;
                mostrarNotificacion(typeof msg === "string" ? msg : "Error al registrar la puja.", "error");
            }
        } catch (err) {
            //  función helper para extraer siempre un string válido
            mostrarNotificacion(extraerMensajeError(err), "error");
        } finally {
            setEnviando(false);
        }
    };

    const esActiva   = subasta ? subastaEstaActiva(subasta) && !subastaCerrada : false;
    const esProgramada = !!subasta && !esActiva && String(subasta.estado ?? "").trim().toLowerCase() === "activa";
    const esVendedor = !!compradorSeleccionado && Number(compradorSeleccionado.id) === Number(subasta?.id_vendedor);
    const puedePujar = esActiva && !esVendedor && !!compradorSeleccionado;

    const getRankIcon = (pos) => {
        if (pos === 1) return <Trophy className="h-4 w-4 text-[#ECB44D]" />;
        if (pos === 2) return <Medal  className="h-4 w-4 text-[#C0C0C0]" />;
        if (pos === 3) return <Medal  className="h-4 w-4 text-[#CD7F32]" />;
        return <Crown className="h-3 w-3 text-[#6FB8E6] opacity-30" />;
    };

    const handleMontoChange = (e) => {
        const v = e.target.value;
        if (v === "") { setMontoPuja(""); return; }
        const n = Number(v);
        if (Number.isFinite(n) && n >= montoMinimo) setMontoPuja(v);
    };

    if (loading)  return <LoadingGrid />;
    if (error)    return <ErrorAlert title="Error" message={error} />;
    if (!subasta) return <EmptyState message="No se encontró la subasta." />;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-7 md:py-10"
            style={{ backgroundImage: `linear-gradient(rgba(7,13,34,0.34), rgba(7,13,34,0.68)), url(${fondoTabla})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat" }}>
            <div className="hero-stars-soft absolute inset-0 opacity-80" />
            <div className="hero-stars absolute inset-0 opacity-90" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 18% 18%, rgba(111,184,230,0.16) 0%, transparent 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.18) 0%, transparent 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.14) 0%, transparent 26%)" }} />

        <Toaster notificacion={notificacion} onClose={cerrarNotificacion} />

        <div className="relative z-10 mx-auto max-w-7xl pt-12 md:pt-14">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[1.9rem] leading-none text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.8rem]" style={{ fontFamily: '"Great Vibes", cursive' }}>
                            {subasta.objeto}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={`border ${esActiva ? "border-green-500 bg-green-900/60" : esProgramada ? "border-[#ECB44D] bg-[#ECB44D]/20" : "border-red-500 bg-red-900/60"} px-3 py-1 text-sm`}>
                                {esActiva ? "EN VIVO" : esProgramada ? "PROGRAMADA" : subasta.estado || "FINALIZADA"}
                            </Badge>
                            {esVendedor && (
                                <Badge className="border border-[#6FB8E6] bg-[#194174]/80 px-3 py-1 text-sm text-[#6FB8E6]">Eres el vendedor</Badge>
                            )}
                        </div>
                    </div>
                    <Button onClick={() => navigate(-1)} className="flex h-8 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-3.5 text-xs text-[#F2E199] hover:bg-[#194174]">
                        <ArrowLeft className="w-4 h-4" /> Regresar
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
                    {/* Columna izquierda */}
                    <div className="space-y-3.5">
                        <Card className="overflow-hidden border-[#ECB44D]/50 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md" style={{ background: "linear-gradient(180deg, rgba(33,52,101,0.94) 0%, rgba(23,23,65,0.95) 52%, rgba(19,22,78,0.96) 100%)" }}>
                            <CardContent className="p-3.5">
                                <div className="relative overflow-hidden rounded-[1.05rem] border border-[#ECB44D]/45 bg-[#194174]/38">
                                    <div className="relative aspect-4/5 w-full flex items-center justify-center">
                                        {subasta.imagen?.datos
                                            ? <img src={`${BASE_URL}/${subasta.imagen.datos}`} alt={subasta.objeto} className="h-full w-full object-cover" />
                                            : <div className="flex h-full w-full items-center justify-center text-[#F2E199]/70"><ImageIcon className="h-12 w-12" /></div>
                                        }
                                        <Badge className="absolute right-2.5 top-2.5 border border-[#ECB44D]/70 bg-[#194174]/88 px-2.5 py-1 text-[0.68rem] font-bold text-[#F2E199] backdrop-blur-sm">
                                            {subasta.estado || "Sin estado"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#ECB44D]/50 bg-[#171741]/64 backdrop-blur-md">
                            <CardContent className="p-3 md:p-3.5 space-y-3.5">
                                <div className="rounded-xl border border-[#ECB44D]/35 bg-[#194174]/20 p-2.5">
                                    <div className="mb-2 flex items-center gap-2"><Package className="h-3.5 w-3.5 text-[#ECB44D]" /><span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Condición</span></div>
                                    <p className="text-[0.84rem] font-semibold text-[#F2E199]">{subasta.condicion || "No especificada"}</p>
                                </div>
                                {subasta.descripcion_cuadro && (
                                    <div className="rounded-xl border border-[#ECB44D]/35 bg-[#194174]/20 p-2.5">
                                        <div className="mb-2 flex items-center gap-2"><ScrollText className="h-3.5 w-3.5 text-[#ECB44D]" /><span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Descripción</span></div>
                                        <p className="text-[0.82rem] text-[#F2E199]/85 leading-relaxed">{subasta.descripcion_cuadro}</p>
                                    </div>
                                )}
                                <div className="rounded-xl border border-[#ECB44D]/35 bg-[#194174]/20 p-2.5">
                                    <div className="mb-2 flex items-center gap-2"><User className="h-3.5 w-3.5 text-[#ECB44D]" /><span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Vendedor</span></div>
                                    <p className="text-[0.84rem] font-semibold text-[#F2E199]">{subasta.nombre_vendedor || "No especificado"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna central */}
                    <div className="space-y-4">
                        <Card className="border-[#ECB44D]/50 backdrop-blur-md" style={{ background: "linear-gradient(135deg, rgba(33,52,101,0.95) 0%, rgba(23,23,65,0.98) 100%)" }}>
                            <CardContent className="p-5 text-center">
                                <div className="mb-4">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-3 py-1.5 mb-3">
                                        <Clock className="h-4 w-4 text-[#ECB44D]" />
                                        <span className="text-xs uppercase tracking-[0.22em] text-[#F2E199]">Tiempo restante</span>
                                    </div>
                                    {tiempoRestante && !tiempoRestante.finalizada ? (
                                        <div className="flex justify-center gap-3 md:gap-5">
                                            {[["dias","Días"],["horas","Horas"],["minutos","Min"],["segundos","Seg"]].map(([key, label]) => (
                                                <div key={key} className="text-center">
                                                    <div className="text-2xl md:text-3xl font-bold text-[#F2E199]">{tiempoRestante[key]}</div>
                                                    <div className="text-[0.6rem] uppercase text-[#6FB8E6]">{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-red-400 font-bold text-lg">SUBASTA FINALIZADA</div>
                                    )}
                                </div>
                                <div className="border-t border-[#ECB44D]/30 pt-4">
                                    <div className="flex items-center justify-center gap-2 text-[#6FB8E6] mb-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm uppercase tracking-wide">Puja más alta</span>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-[#ECB44D]">
                                        {pujaMaxima ? formatPrice(pujaMaxima.monto) : formatPrice(subasta.precio_base)}
                                    </div>
                                    {pujaMaxima && (
                                        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-[#F2E199]">
                                            <User className="h-3 w-3" />
                                            <span>por {pujaMaxima.nombre_usuario}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-[#ECB44D]/30 pt-3 mt-3 grid grid-cols-2 gap-2 text-xs">
                                    <div><span className="text-[#6FB8E6]">Precio base: </span><span className="text-[#F2E199]">{formatPrice(subasta.precio_base)}</span></div>
                                    <div><span className="text-[#6FB8E6]">Incremento mínimo: </span><span className="text-[#F2E199]">{formatPrice(subasta.incremento_minimo)}</span></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#ECB44D]/50 bg-[#171741]/64 backdrop-blur-md">
                            <CardContent className="p-4 space-y-3">
                                <div>
                                    <div className="text-sm text-[#6FB8E6] mb-3">Comprador para pujar</div>
                                    <Button 
                                        onClick={seleccionarCompradorAleatorio}
                                        className="w-full bg-[#6FB8E6] text-[#171741] hover:bg-[#6FB8E6]/80 font-semibold mb-3"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Seleccionar comprador aleatorio
                                    </Button>
                                    {compradorSeleccionado && (
                                        <div className="rounded-lg border border-[#ECB44D]/50 bg-[#194174]/30 p-3">
                                            <p className="text-xs text-[#6FB8E6] mb-1">Comprador seleccionado:</p>
                                            <p className="text-sm font-semibold text-[#ECB44D]">{compradorSeleccionado.nombre}</p>
                                            {compradorSeleccionado.correo && (
                                                <p className="text-xs text-[#F2E199]/70 mt-1">{compradorSeleccionado.correo}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!esActiva && (
                                    <div className="rounded-md border border-red-500/40 bg-red-900/20 p-2 text-xs text-red-200">
                                        {esProgramada
                                            ? "La subasta todavía no inició. Esperá a la hora programada para pujar."
                                            : "Esta subasta no está activa, no se pueden registrar pujas."}
                                    </div>
                                )}
                                {esVendedor && esActiva && (
                                    <div className="rounded-md border border-[#6FB8E6]/40 bg-[#194174]/30 p-2 text-xs text-[#6FB8E6]">
                                        El vendedor no puede pujar en su propia subasta.
                                    </div>
                                )}

                                {!esVendedor && esActiva && (
                                    <div>
                                        <Label className="text-[#F2E199] mb-2 block">Monto de tu puja</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6FB8E6]" />
                                                <Input type="number" step="0.01" min={montoMinimo} value={montoPuja} onChange={handleMontoChange}
                                                    placeholder="Ingrese el monto" className="pl-8 bg-[#194174]/60 border-[#ECB44D]/50 text-[#F2E199]"
                                                    disabled={!puedePujar || enviando} />
                                            </div>
                                            <Button onClick={handlePujar}
                                                disabled={!puedePujar || !montoPuja || parseFloat(montoPuja) < montoMinimo || enviando}
                                                className="bg-[#ECB44D] text-[#171741] hover:bg-[#ECB44D]/80">
                                                {enviando ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
                                                {enviando ? "Pujando..." : "Pujar"}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-[#6FB8E6] mt-2">Monto mínimo: {formatPrice(montoMinimo)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-4">
                        <Card className="border-[#ECB44D]/50 bg-[#171741]/64 backdrop-blur-md">
                            <CardContent className="p-0">
                                <div className="p-3 border-b border-[#ECB44D]/30 flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-[#ECB44D]" />
                                    <span className="text-sm font-semibold text-[#F2E199]">Ranking de pujas</span>
                                    <span className="text-xs text-[#6FB8E6] ml-auto">{historial.length} pujas</span>
                                </div>
                                <div className="max-h-100 overflow-y-auto">
                                    {historial.length === 0 ? (
                                        <div className="text-center py-8 text-[#6FB8E6]">
                                            <Gavel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Aún no hay pujas</p>
                                            <p className="text-xs">¡Sé el primero en pujar!</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-0 hover:bg-transparent">
                                                    <TableHead className="h-8 border-r border-b border-[#b68f2f] bg-[#e3d38c] text-center text-xs font-bold text-[#171741]">#</TableHead>
                                                    <TableHead className="h-8 border-r border-b border-[#b68f2f] bg-[#e3d38c] text-center text-xs font-bold text-[#171741]">Usuario</TableHead>
                                                    <TableHead className="h-8 border-b border-[#b68f2f] bg-[#e3d38c] text-center text-xs font-bold text-[#171741]">Monto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Array.isArray(historial) && historial.slice(0, 10).map((puja, idx) => {
                                                    const pos = idx + 1;
                                                    return (
                                                        <TableRow key={`${puja.id_puja ?? "temp"}-${idx}`} className={`border-0 ${pos === 1 ? "bg-[#ECB44D]/10" : "bg-[#1a1a5a]/94"} hover:bg-[#202068]/96`}>
                                                            <TableCell className="h-8 border-r border-b border-[#b68f2f] text-center">
                                                                <div className="flex items-center justify-center gap-1">{getRankIcon(pos)}<span className={`text-sm font-bold ${pos === 1 ? "text-[#ECB44D]" : "text-[#F2E199]"}`}>#{pos}</span></div>
                                                            </TableCell>
                                                            <TableCell className="h-8 border-r border-b border-[#b68f2f] text-center">
                                                                <div className="flex items-center justify-center gap-1"><User className="h-3 w-3 text-[#6FB8E6]" /><span className={`text-sm ${pos === 1 ? "text-[#ECB44D] font-semibold" : "text-[#F2E199]"}`}>{puja.usuario}</span></div>
                                                            </TableCell>
                                                            <TableCell className="h-8 border-b border-[#b68f2f] text-center">
                                                                <span className={`text-sm font-semibold ${pos === 1 ? "text-[#ECB44D]" : "text-[#F2E199]"}`}>{formatPrice(puja.monto)}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#ECB44D]/50 bg-[#171741]/64 backdrop-blur-md">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2"><CalendarDays className="h-3.5 w-3.5 text-[#ECB44D]" /><span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#6FB8E6]">Fechas</span></div>
                                <p className="text-xs text-[#F2E199]">
                                    <span className="text-[#6FB8E6]">Inicio: </span>{formatDate(subasta.fecha_inicio)}<br />
                                    <span className="text-[#6FB8E6]">Cierre: </span>{formatDate(subasta.fecha_fin)}
                                </p>
                            </CardContent>
                        </Card>

                        <Link to={`/subasta/pujas/${id}`}>
                            <Button variant="outline" className="w-full border-[#6FB8E6] text-[#6FB8E6] hover:bg-[#194174]">
                                Ver historial completo
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubastaEnVivo;
