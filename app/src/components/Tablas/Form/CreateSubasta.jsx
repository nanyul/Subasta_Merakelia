import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { format, isAfter } from "date-fns";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// icons
import { Save, ArrowLeft, ShieldCheck, UserRound } from "lucide-react";

// servicios
import SubastaService from "../../../services/SubastaService";
import CuadrosService from "../../../services/CuadrosService";
import UserService from "../../../services/UserService";

// componentes reutilizables
import { CustomSelect } from "../../ui/custom/custom-select";
import { CustomInputField } from "../../ui/custom/custom-input-field";
import fondoTabla from "@/assets/fondoTabla.png";

// Usuario vendedor simulado (variable lógica simulada)
const ID_USUARIO_VENDEDOR = 10; // única variable simulada
const ESTADO_CUADRO_ACTIVO = "Publicado";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const extractArrayFromResponse = (response) => {
    const payload = response?.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;

    if (payload && typeof payload === "object") {
        const firstArray = Object.values(payload).find(Array.isArray);
        return Array.isArray(firstArray) ? firstArray : [];
    }

    return [];
};

const extractObjectFromResponse = (response) => {
    const payload = response?.data;

    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        if (payload.data && typeof payload.data === "object") return payload.data;
        return payload;
    }

    if (Array.isArray(payload) && payload.length > 0) {
        return payload[0];
    }

    return null;
};

const toMySqlDateTime = (value) => {
    if (!value) return "";
    return format(new Date(value), "yyyy-MM-dd HH:mm:ss");
};

export function CreateSubasta() {
    const [usuarioVendedor, setUsuarioVendedor] = useState(null);
    const navigate = useNavigate();

    /*** Estados ***/
    const [dataCuadros, setDataCuadros] = useState([]);
    const [subastasActivas, setSubastasActivas] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const objetosConSubastaActivaPorNombre = useMemo(() => {
        return new Set(
            subastasActivas
                .map((subasta) => normalizeText(subasta.objeto))
                .filter(Boolean)
        );
    }, [subastasActivas]);

    const cuadrosConSubastaActiva = useMemo(() => {
        return new Set(
            subastasActivas
                .filter((subasta) => !subasta.estado || subasta.estado === "Activa" || subasta.estado === "Programada")
                .map((subasta) => Number(subasta.id_cuadro || subasta.idCuadro || subasta.id_cuadro_subasta || subasta.id_cuadro_fk || 0))
                .filter(Boolean)
        );
    }, [subastasActivas]);

    const objetosDisponibles = useMemo(() => {
        const vendedorNombre = normalizeText(usuarioVendedor?.nombre);

        return dataCuadros.filter((cuadro) => {
            const idCuadro = Number(cuadro.id);
            const nombreCuadro = normalizeText(cuadro.nombre);
            const estadoCuadro = normalizeText(cuadro.estado_cuadro);
            const nombreDuenoCuadro = normalizeText(cuadro.nombre_dueno);

            // Si no hay usuario cargado, no bloquea por dueño para evitar ocultar opciones válidas.
            const coincideVendedor = vendedorNombre
                ? nombreDuenoCuadro === vendedorNombre
                : true;

            return (
                estadoCuadro === normalizeText(ESTADO_CUADRO_ACTIVO) &&
                coincideVendedor &&
                !cuadrosConSubastaActiva.has(idCuadro) &&
                !objetosConSubastaActivaPorNombre.has(nombreCuadro)
            );
        });
    }, [dataCuadros, cuadrosConSubastaActiva, objetosConSubastaActivaPorNombre, usuarioVendedor]);

    /*** Esquema de validación Yup ***/
    const subastaSchema = yup.object({
        id_cuadro: yup
            .number()
            .typeError("Seleccione un objeto")
            .required("El objeto es requerido"),
        fecha_inicio: yup
            .string()
            .required("La fecha de inicio es requerida"),
        fecha_fin: yup
            .string()
            .required("La fecha de cierre es requerida")
            .test(
                "fecha-fin-mayor",
                "La fecha de cierre debe ser posterior a la fecha de inicio",
                function (value) {
                    const { fecha_inicio } = this.parent;
                    if (!fecha_inicio || !value) return true;
                    return isAfter(new Date(value), new Date(fecha_inicio));
                }
            ),
        precio_base: yup
            .number()
            .typeError("Solo acepta números")
            .required("El precio base es requerido")
            .positive("El precio base debe ser mayor a 0"),
        incremento_minimo: yup
            .number()
            .typeError("Solo acepta números")
            .required("El incremento mínimo es requerido")
            .min(50, "El incremento mínimo debe ser mayor o igual a 50"),
    });

    /*** React Hook Form ***/
    const {
        control,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id_cuadro: "",
            fecha_inicio: "",
            fecha_fin: "",
            precio_base: "",
            incremento_minimo: "",
        },
        resolver: yupResolver(subastaSchema),
    });

    const fechaInicio = watch("fecha_inicio");
    // Fecha actual en formato correcto para datetime-local
    const now = new Date().toISOString().slice(0, 16);

    /*** Cargar objetos activos ***/
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [cuadrosRes, activisRes, programadasRes, usuarioRes] = await Promise.all([
                    CuadrosService.getCuadros(),
                    SubastaService.getSubastasActivas(),
                    SubastaService.getProgramadas(),
                    UserService.getUserById(ID_USUARIO_VENDEDOR),
                ]);

                setDataCuadros(extractArrayFromResponse(cuadrosRes));
                const activas = extractArrayFromResponse(activisRes);
                const programadas = extractArrayFromResponse(programadasRes);
                setSubastasActivas([...activas, ...programadas]);
                
                const userData = extractObjectFromResponse(usuarioRes);
                setUsuarioVendedor(userData);

                setError("");
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    /*** Submit - crea subasta asociada al vendedor simulado ***/
    const onSubmit = async (dataForm) => {
        try {
            setIsSubmitting(true);

            const idCuadro = Number(dataForm.id_cuadro);
            const cuadroSeleccionado = dataCuadros.find((cuadro) => Number(cuadro.id) === idCuadro);

            if (!cuadroSeleccionado) {
                toast.error("Debe seleccionar un objeto válido.");
                return;
            }

            if (cuadroSeleccionado.estado_cuadro !== ESTADO_CUADRO_ACTIVO) {
                toast.error("El objeto seleccionado no está activo.");
                return;
            }

            if (cuadrosConSubastaActiva.has(idCuadro)) {
                toast.error("El objeto ya tiene una subasta activa.");
                return;
            }

            if (objetosConSubastaActivaPorNombre.has(normalizeText(cuadroSeleccionado.nombre))) {
                toast.error("El objeto ya tiene una subasta activa.");
                return;
            }

            const payload = {
                id_cuadro: idCuadro,
                fecha_inicio: toMySqlDateTime(dataForm.fecha_inicio),
                fecha_fin: toMySqlDateTime(dataForm.fecha_fin),
                precio_base: Number(dataForm.precio_base),
                incremento_minimo: Number(dataForm.incremento_minimo),
                descripcion: `Subasta de la obra ${cuadroSeleccionado.nombre}.`,
                es_publica: 1,
                id_estado_subasta: 4,
                id_usuario: ID_USUARIO_VENDEDOR,
            };

            const response = await SubastaService.createSubasta(payload);

            if (response.data) {
                toast.success("Subasta creada correctamente.", { duration: 5000 });
                navigate("/Subastas");
                return;
            }

            setError("No fue posible crear la subasta.");
        } catch (err) {
            console.error(err);
            setError("Error al crear la subasta");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sinObjetosDisponibles = !isLoadingData && objetosDisponibles.length === 0;

    return (
        <div
            className="min-h-screen bg-[#171741] px-4 pb-8 pt-14 sm:pt-16"
            style={{
                backgroundImage: `linear-gradient(rgba(10,18,44,0.25), rgba(10,18,44,0.45)), url(${fondoTabla})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Card className="mx-auto w-full max-w-3xl border-[#d8a63b] bg-[#131b49]/90 p-6 shadow-[0_12px_45px_rgba(11,18,44,0.4)]">
                <h2
                    className="mb-1 text-4xl text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.6)]"
                    style={{ fontFamily: '"Great Vibes", cursive' }}
                >
                    Crear Subasta
                </h2>
                <p className="mb-6 text-sm text-[#d6d9f6]">
                    Configure la subasta con un objeto activo disponible y asocie automáticamente al vendedor.
                </p>

                {error && (
                    <div className="mb-4 rounded-md border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                {sinObjetosDisponibles && (
                    <div className="mb-4 rounded-md border border-amber-300/60 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                        No hay objetos activos disponibles para subastar en este momento.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Usuario vendedor (no editable) */}
                    <div className="rounded-lg border border-[#6FB8E6]/45 bg-[#194174]/35 px-4 py-3">
                        <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#BEE7FF]">
                            <UserRound className="h-4 w-4" />
                            Usuario vendedor asignado
                        </Label>
                        <p className="text-sm font-semibold text-white">{usuarioVendedor?.nombre}</p>
                        <p className="text-xs text-[#d6d9f6]">{usuarioVendedor?.correo}</p>
                        <p className="mt-2 flex items-center gap-2 text-xs text-[#F2E199]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Asociación automática, campo no editable.
                        </p>
                    </div>

                    {/* Objeto */}
                    <div>
                        <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Objeto a subastar</Label>
                        <Controller
                            name="id_cuadro"
                            control={control}
                            render={({ field }) => (
                                <CustomSelect
                                    field={field}
                                    data={objetosDisponibles}
                                    label="Objeto"
                                    getOptionLabel={(obj) => `${obj.nombre} (${obj.estado_cuadro})`}
                                    getOptionValue={(obj) => obj.id}
                                    error={errors.id_cuadro?.message}
                                />
                            )}
                        />
                        <p className="mt-2 text-xs text-[#d6d9f6]">
                            Solo se muestran objetos activos y sin subasta activa.
                        </p>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Controller
                                name="fecha_inicio"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Fecha y hora de inicio"
                                        type="datetime-local"
                                        min={now}
                                        error={errors.fecha_inicio?.message}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Controller
                                name="fecha_fin"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Fecha y hora de cierre"
                                        type="datetime-local"
                                        min={fechaInicio || now}
                                        error={errors.fecha_fin?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Precio base e incremento mínimo */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Controller
                                name="precio_base"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Precio base ($)"
                                        placeholder="100.00"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        error={errors.precio_base?.message}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Controller
                                name="incremento_minimo"
                                control={control}
                                render={({ field }) => (
                                    <CustomInputField
                                        {...field}
                                        label="Incremento mínimo ($)"
                                        placeholder="50.00"
                                        type="number"
                                        step="0.01"
                                        min="50"
                                        error={errors.incremento_minimo?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-[#6FB8E6] bg-[#171741] text-[#F2E199] hover:bg-[#194174]"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Regresar
                        </Button>
                        <Button
                            type="submit"
                            className="flex items-center gap-2 bg-[#ECB44D] text-[#171741] hover:bg-[#f3bf60]"
                            disabled={isLoadingData || isSubmitting || sinObjetosDisponibles}
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Guardando..." : "Crear subasta"}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}
