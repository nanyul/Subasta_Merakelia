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
import { CustomSelect } from "@/components/ui/custom/custom-select";
import { ArrowLeft, Gavel, User, DollarSign, Clock, TrendingUp, Trophy, Medal, Crown, AlertCircle, CheckCircle, XCircle, RefreshCw, Zap, CalendarDays, ImageIcon, Package, ScrollText } from "lucide-react";
import fondoTabla from "@/assets/fondoTabla.png";
import SubastaService from "@/services/SubastaService";
import UserService from "@/services/UserService";

function subastaEstaActiva(data) {
    if (!data) return false;
    const estadoId    = Number(data.id_estado_subasta ?? data.id_estado ?? data.idEstadoSubasta);
    const estadoTexto = String(data.estado ?? "").trim().toLowerCase();
    if (estadoId === 1) return true;
    if (estadoTexto.includes("activa") || estadoTexto.includes("en vivo")) return true;
    const inicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null;
    const fin    = data.fecha_fin    ? new Date(data.fecha_fin)    : null;
    const ahora  = new Date();
    if (inicio && fin && !isNaN(inicio) && !isNaN(fin)) return ahora >= inicio && ahora <= fin;
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

// ── Extrae un mensaje de error legible desde cualquier estructura ──
function extraerMensajeError(err) {
    // Error de validación del servidor (HTTP 4xx con body JSON)
    const data = err?.response?.data;
    if (data) {
        if (typeof data.mensaje === "string" && data.mensaje) return data.mensaje;
        if (typeof data.error === "string"   && data.error)   return data.error;
        if (typeof data.message === "string" && data.message) return data.message;
    }
    // Error de red u otro
    if (typeof err?.message === "string" && err.message) return err.message;
    return "Error desconocido al registrar la puja.";
}

// ── Notificación montada en document.body via Portal ──────────────────────────
// Usar createPortal evita el error "insertBefore: node is not a child"
// que ocurre cuando React intenta insertar/remover nodos con renderizado
// condicional {cond && <div>} dentro de árboles con animaciones CSS.
function Toaster({ notificacion }) {
    if (!notificacion) return null;
    return createPortal(
        <div className="fixed top-24 right-4 z-[9999] animate-in slide-in-from-right-5">
            <Alert className={`flex items-center gap-2 border px-4 py-3 shadow-lg ${
                notificacion.tipo === "success" ? "border-green-500/50 bg-green-900/80" :
                notificacion.tipo === "error"   ? "border-red-500/50 bg-red-900/80"     :
                notificacion.tipo === "warning" ? "border-[#ECB44D]/50 bg-[#171741]/80" :
                                                  "border-[#6FB8E6]/50 bg-[#194174]/80"
            }`}>
                {notificacion.tipo === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
                {notificacion.tipo === "error"   && <XCircle     className="h-4 w-4 text-red-400"   />}
                {notificacion.tipo === "warning" && <AlertCircle className="h-4 w-4 text-[#ECB44D]" />}
                {notificacion.tipo === "info"    && <Zap         className="h-4 w-4 text-[#6FB8E6]" />}
                <AlertDescription className="text-white">{notificacion.mensaje}</AlertDescription>
            </Alert>
        </div>,
        document.body
    );
}
Toaster.propTypes = { notificacion: PropTypes.shape({ mensaje: PropTypes.string, tipo: PropTypes.string }) };

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

    const timeoutRef = useRef(null);

    const formatPrice = (v) => `$ ${Number(v).toFixed(2)}`;
    const formatDate  = (d) => new Date(d).toLocaleString("es-CR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
    });

    const mostrarNotificacion = useCallback((mensaje, tipo = "info") => {
        // FIX: Garantizamos que siempre sea string para evitar el error de React
        const mensajeSeguro = typeof mensaje === "string" && mensaje
            ? mensaje
            : tipo === "error"
                ? "Ocurrió un error inesperado."
                : "Operación completada.";
        setNotificacion({ mensaje: mensajeSeguro, tipo });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setNotificacion(null), 5000);
    }, []);

    const compradoresDisponibles = useMemo(() => compradores.filter(esUsuarioComprador), [compradores]);
    const compradorSeleccionado  = useMemo(
        () => compradoresDisponibles.find((u) => String(u.id) === String(selectedBuyerId)) ?? null,
        [compradoresDisponibles, selectedBuyerId]
    );

    const cargarSubasta = useCallback(async (mostrarLoader = false) => {
        if (mostrarLoader) setLoading(true);
        try {
            const res  = await SubastaService.getDetalleSubasta(id);
            const data = res.data?.data ?? res.data;
            if (!data || data.error) { setError(data?.mensaje ?? "Error al cargar la subasta."); return; }
            setSubasta(data);
            setHistorial(Array.isArray(data.historial) ? data.historial : []);
            setPujaMaxima(data.puja_maxima ?? null);
            setSubastaCerrada(!subastaEstaActiva(data));
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
            const primero = lista.find(esUsuarioComprador);
            if (primero) setSelectedBuyerId(String(primero.id));
        }).catch(() => { if (!cancelled) setCompradores([]); });
        return () => { cancelled = true; };
    }, []);

    // Carga inicial
    useEffect(() => { cargarSubasta(true); }, [id]); // eslint-disable-line

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
    }, [subasta?.fecha_fin, subastaCerrada]); // eslint-disable-line

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
            // El backend ya devuelve el historial ordenado por monto DESC
            setHistorial(data.historial);
        }

        if (data.puja_maxima !== undefined) {
            setPujaMaxima(data.puja_maxima);
        }
    }, []);

    const handleSubastaCerrada = useCallback((data) => {
        setSubastaCerrada(true);
        setSubasta((prev) => prev ? { ...prev, estado: "Finalizada", id_estado_subasta: 2 } : prev);
        if (data?.ganador) setPujaMaxima(data.ganador);
        mostrarNotificacion("La subasta ha finalizado.", "info");
    }, [mostrarNotificacion]);

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
                // FIX: NO reseteamos montoPuja aquí — el useEffect de montoMinimo
                // lo actualizará automáticamente cuando Ably traiga la nueva pujaMaxima.
                // Así el campo siempre muestra el nuevo mínimo correcto en ambos navegadores.
                mostrarNotificacion("¡Puja registrada exitosamente!", "success");
            } else {
                // El servidor respondió 2xx pero con error lógico
                const msg = result?.mensaje ?? result?.error ?? result?.message;
                mostrarNotificacion(typeof msg === "string" ? msg : "Error al registrar la puja.", "error");
            }
        } catch (err) {
            // FIX: Usamos la función helper para extraer siempre un string válido
            mostrarNotificacion(extraerMensajeError(err), "error");
        } finally {
            setEnviando(false);
        }
    };

    const esActiva   = subasta ? subastaEstaActiva(subasta) && !subastaCerrada : false;
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

    const ranking = historial;

    if (loading)  return <LoadingGrid />;
    if (error)    return <ErrorAlert title="Error" message={error} />;
    if (!subasta) return <EmptyState message="No se encontró la subasta." />;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-7 md:py-10"
            style={{ backgroundImage: `linear-gradient(rgba(7,13,34,0.34), rgba(7,13,34,0.68)), url(${fondoTabla})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat" }}>
            <div className="hero-stars-soft absolute inset-0 opacity-80" />
            <div className="hero-stars absolute inset-0 opacity-90" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 18% 18%, rgba(111,184,230,0.16) 0%, transparent 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.18) 0%, transparent 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.14) 0%, transparent 26%)" }} />

        <Toaster notificacion={notificacion} />

        <div className="relative z-10 mx-auto max-w-7xl pt-12 md:pt-14">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[1.9rem] leading-none text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.8rem]" style={{ fontFamily: '"Great Vibes", cursive' }}>
                            {subasta.objeto}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={`border ${esActiva ? "border-green-500 bg-green-900/60" : "border-red-500 bg-red-900/60"} px-3 py-1 text-sm`}>
                                {esActiva ? "EN VIVO" : subasta.estado || "FINALIZADA"}
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
                                    <div className="text-sm text-[#6FB8E6] mb-1">Usuario que realizará la puja</div>
                                    <CustomSelect
                                        field={{ value: selectedBuyerId, onChange: setSelectedBuyerId }}
                                        data={compradoresDisponibles}
                                        label="Usuario comprador"
                                        getOptionLabel={(u) => `${u.nombre || "Sin nombre"}${u.correo ? ` - ${u.correo}` : ""}`}
                                        getOptionValue={(u) => u.id}
                                        error={!compradoresDisponibles.length ? "No hay compradores disponibles" : ""}
                                    />
                                    {compradorSeleccionado && (
                                        <p className="text-xs text-[#F2E199]/75 mt-1">Seleccionado: <span className="font-semibold text-[#ECB44D]">{compradorSeleccionado.nombre}</span></p>
                                    )}
                                </div>

                                {!esActiva && (
                                    <div className="rounded-md border border-red-500/40 bg-red-900/20 p-2 text-xs text-red-200">
                                        Esta subasta no está activa, no se pueden registrar pujas.
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
                                                {Array.isArray(ranking) && ranking.slice(0, 10).map((puja, idx) => {
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

function LoadingGrid() {
    return <div className="flex items-center justify-center min-h-screen bg-[#171741]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ECB44D]" /></div>;
}
function ErrorAlert({ title, message }) {
    return <div className="flex items-center justify-center min-h-screen bg-[#171741]"><div className="text-center"><AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-[#F2E199]">{title}</h2><p className="text-[#6FB8E6]">{message}</p></div></div>;
}
function EmptyState({ message }) {
    return <div className="flex items-center justify-center min-h-screen bg-[#171741]"><div className="text-center"><Package className="h-12 w-12 text-[#6FB8E6] mx-auto mb-4 opacity-50" /><p className="text-[#F2E199]">{message}</p></div></div>;
}
ErrorAlert.propTypes = { title: PropTypes.string.isRequired, message: PropTypes.string.isRequired };
EmptyState.propTypes = { message: PropTypes.string.isRequired };
