import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { format, isAfter, parseISO } from "date-fns";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// icons
import { Save, ArrowLeft, ShieldCheck, UserRound } from "lucide-react";

// servicios
import SubastaService from "../../../services/SubastaService";

// componentes reutilizables
import { CustomInputField } from "../../ui/custom/custom-input-field";
import fondoTabla from "@/assets/fondoTabla.png";

export function UpdateSubasta() {
    const navigate = useNavigate();
    const { id } = useParams();

    /*** Estados ***/
    const [error, setError] = useState("");
    const [subastaInfo, setSubastaInfo] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    /*** Esquema de validación Yup ***/
    const subastaSchema = yup.object({
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
            .positive("El incremento mínimo debe ser mayor a 0"),
    });

    /*** React Hook Form ***/
    const {
        control,
        watch,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fecha_inicio: "",
            fecha_fin: "",
            precio_base: "",
            incremento_minimo: "",
        },
        resolver: yupResolver(subastaSchema),
    });


    const fechaInicio = watch("fecha_inicio");
    // Fecha actual para bloquear pasado
    const now = new Date().toISOString().slice(0, 16);

    // Formatear fecha a formato datetime-local (YYYY-MM-DDTHH:mm)
    const toDatetimeLocal = (dateStr) => {
        if (!dateStr) return "";
        try {
            const date = parseISO(dateStr);
            return format(date, "yyyy-MM-dd'T'HH:mm");
        } catch (e) {
            console.error("Error parsing date:", dateStr, e);
            return "";
        }
    };

    const normalizeEstado = (estado) => String(estado || "").trim().toLowerCase();

    /*** Cargar datos de la subasta ***/
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const response = await SubastaService.getSubastaById(id);
                if (response.data?.data) {
                    const subasta = response.data.data;
                    setSubastaInfo(subasta);

                    // Requisitos de edición: no ha iniciado Y no tiene pujas
                    const ahora = new Date();
                    const inicio = new Date(subasta.fecha_inicio);
                    const noHaIniciado = inicio > ahora;
                    const cantidadPujas = Number(
                        subasta.cantidad_pujas ?? subasta.pujas ?? subasta.total_pujas ?? 0
                    );
                    const sinPujas = Number.isNaN(cantidadPujas) || cantidadPujas <= 0;
                    const estado = normalizeEstado(subasta.estado);
                    const estadoValido = estado !== "cancelada" && estado !== "finalizada";

                    if (noHaIniciado && sinPujas && estadoValido) {
                        setCanEdit(true);
                        reset({
                            fecha_inicio: toDatetimeLocal(subasta.fecha_inicio),
                            fecha_fin: toDatetimeLocal(subasta.fecha_fin),
                            precio_base: subasta.precio_base,
                            incremento_minimo: subasta.incremento_minimo,
                        });
                    } else {
                        setCanEdit(false);
                    }
                }
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id, reset]);

    /*** Submit ***/
    const onSubmit = async (dataForm) => {
        try {
            setIsSubmitting(true);
            const isValid = await subastaSchema.isValid(dataForm);
            if (!isValid) return;

            const response = await SubastaService.updateSubasta({ id, ...dataForm });
            if (response.data?.success || response.data?.data) {
                toast.success(`Subasta #${id} actualizada correctamente.`, { duration: 3000 });
                navigate("/subastas");
            } else if (response.data?.error || response.error) {
                setError(response.data?.error || response.error);
            }
        } catch (err) {
            console.error(err);
            setError("Error al actualizar la subasta");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    Editar Subasta #{id}
                </h2>
                <p className="mb-6 text-sm text-[#d6d9f6]">
                    Actualice la programación y montos de la subasta respetando sus restricciones actuales.
                </p>

                {error && (
                    <div className="mb-4 rounded-md border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                {/* Casilla informativa adaptada al estilo general */}
                {subastaInfo && (
                    <div className="mb-6 rounded-lg border border-[#6FB8E6]/45 bg-[#194174]/35 px-4 py-3">
                        <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#BEE7FF]">
                            <UserRound className="h-4 w-4" />
                            Detalle de la subasta
                        </Label>
                        <p className="text-xs uppercase tracking-wide text-[#d6d9f6]">Objeto</p>
                        <p className="text-sm font-semibold text-white">{subastaInfo.objeto || "Sin información"}</p>

                        <p className="mt-2 text-xs uppercase tracking-wide text-[#d6d9f6]">Estado</p>
                        <p className="text-sm font-semibold text-white">{subastaInfo.estado || "No activa"}</p>

                        {subastaInfo.usuario_vendedor && (
                            <>
                                <p className="mt-2 text-xs uppercase tracking-wide text-[#d6d9f6]">Vendedor</p>
                                <p className="text-sm font-semibold text-white">{subastaInfo.usuario_vendedor}</p>
                            </>
                        )}

                        <p className="mt-2 flex items-center gap-2 text-xs text-[#F2E199]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Solo editable si no ha iniciado y no tiene pujas registradas.
                        </p>
                    </div>
                )}

                {!canEdit && subastaInfo && (
                    <div className="mb-4 rounded-md border border-amber-300/60 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                        Esta subasta no puede editarse: debe no haber iniciado y no tener pujas registradas.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
                                        disabled={!canEdit || isLoadingData || isSubmitting}
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
                                        disabled={!canEdit || isLoadingData || isSubmitting}
                                    />
                                )}
                            />
                        </div>
                    </div>

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
                                        error={errors.precio_base?.message}
                                        disabled={!canEdit || isLoadingData || isSubmitting}
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
                                        placeholder="10.00"
                                        type="number"
                                        step="0.01"
                                        error={errors.incremento_minimo?.message}
                                        disabled={!canEdit || isLoadingData || isSubmitting}
                                    />
                                )}
                            />
                        </div>
                    </div>

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
                        {canEdit && (
                            <Button
                                type="submit"
                                className="flex items-center gap-2 bg-[#ECB44D] text-[#171741] hover:bg-[#f3bf60]"
                                disabled={isLoadingData || isSubmitting}
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Guardando..." : "Guardar cambios"}
                            </Button>
                        )}
                    </div>

                </form>
            </Card>
        </div>
    );
}
