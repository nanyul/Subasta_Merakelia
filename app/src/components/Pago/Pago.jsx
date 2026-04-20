import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import fondoTabla from "@/assets/fondoTabla.png";
import PropTypes from "prop-types";
import SubastaService from "@/services/SubastaService";

function Toaster({ notificacion, onClose }) {
    if (!notificacion) return null;
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none px-4">
            <div className={`pointer-events-auto flex flex-col max-w-xl gap-3 p-4 rounded-lg shadow-lg animate-in zoom-in-95 ${
                notificacion.tipo === "success" ? "border border-[#ECB44D]/50 bg-[#171741]/80" :
                notificacion.tipo === "error"   ? "border border-[#ECB44D]/50 bg-[#171741]/80"     :
                                                  "border border-[#6FB8E6]/50 bg-[#171741]/80"
            }`}>
                <div className="flex items-start gap-2">
                    {notificacion.tipo === "success" && <CheckCircle className="h-4 w-4 text-[#ECB44D] shrink-0 mt-0.5" />}
                    <p className="text-white flex-1">{notificacion.mensaje}</p>
                </div>
                {!notificacion.acciones && (
                    <Button
                        onClick={onClose}
                        className="bg-[#171741]/60 border border-[#ECB44D] text-[#ECB44D] hover:bg-[#171741] ml-auto"
                        size="sm"
                    >
                        Cerrar
                    </Button>
                )}
            </div>
        </div>
    );
}

Toaster.propTypes = {
    notificacion: PropTypes.shape({
        mensaje: PropTypes.string,
        tipo: PropTypes.string,
        acciones: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            onClick: PropTypes.func
        }))
    }),
    onClose: PropTypes.func
};

export function Pago() {
    const navigate = useNavigate();
    const location = useLocation();
    const [notificacion, setNotificacion] = useState(null);
    const timeoutRef = useRef(null);

    // Datos de la subasta desde el state de navegación o localStorage
    let { subastaId, ganador } = location.state || {};
    
    // Si no hay datos en el state, intentar cargar del localStorage
    if (!subastaId || !ganador) {
        const pagoPendiente = localStorage.getItem("pagoPendiente");
        if (pagoPendiente) {
            const datos = JSON.parse(pagoPendiente);
            subastaId = datos.subastaId;
            ganador = datos.ganador;
        }
    }

    // Guardar pago pendiente en localStorage cuando se abre la página
    useEffect(() => {
        if (subastaId || ganador) {
            localStorage.setItem("pagoPendiente", JSON.stringify({ subastaId, ganador, timestamp: Date.now() }));
        }
    }, [subastaId, ganador]);

    const [formData, setFormData] = useState({
        titular: "",
        numeroTarjeta: "",
        fechaExpiracion: "",
        cvv: ""
    });

    const [procesando, setProcesando] = useState(false);

    const mostrarNotificacion = (mensaje, tipo = "info") => {
        setNotificacion({ mensaje, tipo });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const cerrarNotificacion = () => {
        setNotificacion(null);
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const validarFormulario = () => {
        if (!formData.titular.trim()) {
            mostrarNotificacion("Ingresá el nombre del titular de la tarjeta.", "error");
            return false;
        }
        if (!formData.numeroTarjeta.trim()) {
            mostrarNotificacion("Ingresá el número de tarjeta.", "error");
            return false;
        }
        if (!/^\d{13,19}$/.test(formData.numeroTarjeta.replace(/\s/g, ""))) {
            mostrarNotificacion("El número de tarjeta debe tener entre 13 y 19 dígitos.", "error");
            return false;
        }
        if (!formData.fechaExpiracion.trim()) {
            mostrarNotificacion("Ingresá el año de expiración.", "error");
            return false;
        }
        if (!/^\d{4}$/.test(formData.fechaExpiracion)) {
            mostrarNotificacion("El año debe tener 4 dígitos (YYYY).", "error");
            return false;
        }
        const yearActual = new Date().getFullYear();
        if (parseInt(formData.fechaExpiracion) < yearActual) {
            mostrarNotificacion("La tarjeta ha expirado.", "error");
            return false;
        }
        if (!formData.cvv.trim()) {
            mostrarNotificacion("Ingresá el CVV.", "error");
            return false;
        }
        if (!/^\d{3,4}$/.test(formData.cvv)) {
            mostrarNotificacion("El CVV debe tener 3 o 4 dígitos.", "error");
            return false;
        }
        return true;
    };

    const handleProcesarPago = async () => {
        if (!validarFormulario()) return;

        setProcesando(true);
        try {
            // Simular delay de procesamiento
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Cancelar la subasta (cambiar estado a 3 = Cancelada)
            if (subastaId) {
                try {
                    await SubastaService.cancelSubasta(subastaId);
                } catch (cancelError) {
                    console.error("Error al cancelar subasta:", cancelError);
                    // No bloqueamos el flujo si falla la cancelación
                }
            }

            // Pago simulado exitoso
            mostrarNotificacion("¡Pago procesado correctamente! Gracias por tu compra.", "success");

            // Limpiar pago pendiente
            localStorage.removeItem("pagoPendiente");
            // Disparar evento para que el Header se actualice
            window.dispatchEvent(new Event("pagoPendienteChanged"));

            setTimeout(() => {
                navigate("/subastas");
            }, 2500);
        } catch (error) {
            mostrarNotificacion("Error al procesar el pago. Intenta nuevamente.", "error");
            setProcesando(false);
        }
    };

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

            <Toaster notificacion={notificacion} onClose={cerrarNotificacion} />



            <div className="relative z-10 mx-auto max-w-2xl pt-12 md:pt-14 px-4 pb-12">
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
                    <h1 className="text-2xl md:text-3xl font-bold text-[#F2E199]">Procesar Pago</h1>
                    <div className="w-10" />
                </div>

                {/* Main Card */}
                <Card className="border-[#ECB44D]/20 bg-[#171741]/60 backdrop-blur-sm">
                    <CardHeader className="border-b border-[#ECB44D]/20 pb-6">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-6 w-6 text-[#ECB44D]" />
                            <CardTitle className="text-[#F2E199]">Detalles de la Tarjeta</CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8">
                        <form noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleProcesarPago(); }}>
                            <div className="space-y-6">
                            {/* Nombre del Titular */}
                            <div className="space-y-2">
                                <Label htmlFor="titular" className="text-[#ECB44D] font-semibold">
                                    Nombre del Titular
                                </Label>
                                <Input
                                    id="titular"
                                    name="titular"
                                    type="text"
                                    placeholder="Nombre Completo"
                                    value={formData.titular}
                                    onChange={handleInputChange}
                                    className="bg-[#171741]/40 border-[#ECB44D]/40 text-white placeholder:text-[#ECB44D]/50 focus:border-[#F2E199] focus:ring-[#F2E199]/50"
                                    disabled={procesando}
                                    autoComplete="off"
                                    spellCheck="false"
                                    data-1p-ignore
                                    data-lpignore="true"
                                />
                            </div>

                            {/* Número de Tarjeta */}
                            <div className="space-y-2">
                                <Label htmlFor="numeroTarjeta" className="text-[#ECB44D] font-semibold">
                                    Número de Tarjeta
                                </Label>
                                <Input
                                    id="numeroTarjeta"
                                    name="numeroTarjeta"
                                    type="text"
                                    placeholder="1234567890123456"
                                    value={formData.numeroTarjeta}
                                    onChange={handleInputChange}
                                    maxLength="19"
                                    className="bg-[#171741]/40 border-[#ECB44D]/40 text-white placeholder:text-[#ECB44D]/50 focus:border-[#F2E199] focus:ring-[#F2E199]/50 font-mono"
                                    disabled={procesando}
                                    autoComplete="off"
                                    spellCheck="false"
                                    data-1p-ignore
                                    data-lpignore="true"
                                />
                            </div>

                            {/* Row: Fecha y CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Fecha de Expiración */}
                                <div className="space-y-2">
                                    <Label htmlFor="fechaExpiracion" className="text-[#ECB44D] font-semibold">
                                        Año de Expiración
                                    </Label>
                                    <Input
                                        id="fechaExpiracion"
                                        name="fechaExpiracion"
                                        type="text"
                                        placeholder="2026"
                                        value={formData.fechaExpiracion}
                                        onChange={handleInputChange}
                                        maxLength="4"
                                        className="bg-[#171741]/40 border-[#ECB44D]/40 text-white placeholder:text-[#ECB44D]/50 focus:border-[#F2E199] focus:ring-[#F2E199]/50 font-mono"
                                        disabled={procesando}
                                        autoComplete="off"
                                        spellCheck="false"
                                        data-1p-ignore
                                        data-lpignore="true"
                                    />
                                </div>

                                {/* CVV */}
                                <div className="space-y-2">
                                    <Label htmlFor="cvv" className="text-[#ECB44D] font-semibold">
                                        CVV
                                    </Label>
                                    <Input
                                        id="cvv"
                                        name="cvv"
                                        type="text"
                                        placeholder="123"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        maxLength="4"
                                        className="bg-[#171741]/40 border-[#ECB44D]/40 text-white placeholder:text-[#ECB44D]/50 focus:border-[#F2E199] focus:ring-[#F2E199]/50 font-mono"
                                        disabled={procesando}
                                        autoComplete="off"
                                        spellCheck="false"
                                        data-1p-ignore
                                        data-lpignore="true"
                                    />
                                </div>
                            </div>

                            {/* Info Alert */}
                            

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    variant="outline"
                                    className="flex-1 border-[#ECB44D]/40 text-[#ECB44D] hover:bg-[#171741]/40"
                                    disabled={procesando}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#ECB44D] text-[#171741] hover:bg-[#ECB44D]/80 font-semibold"
                                    disabled={procesando}
                                >
                                    {procesando ? "Procesando..." : "Procesar Pago"}
                                </Button>
                            </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

Pago.propTypes = {
    subastaId: PropTypes.number,
    ganador: PropTypes.object
};

export default Pago;
