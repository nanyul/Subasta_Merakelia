import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// icons
import { Save, ArrowLeft } from "lucide-react";

// servicios
import UserService from "../../../services/UserService";

// componentes reutilizables
import { CustomInputField } from "../../ui/custom/custom-input-field";
import fondoTabla from "@/assets/fondoTabla.png";


export function UpdateUser() {
    const navigate = useNavigate();
    const { id } = useParams();

    /*** Estados ***/
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    /*** Esquema de validación Yup ***/
    const userSchema = yup.object({
        nombre: yup
            .string()
            .required("El nombre es requerido")
            .min(3, "El nombre debe tener al menos 3 caracteres")
            .max(100, "El nombre no puede exceder 100 caracteres"),
        correo: yup
            .string()
            .required("El correo es requerido")
            .email("Correo inválido"),
    });

    /*** React Hook Form ***/
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            nombre: "",
            correo: "",
        },
        resolver: yupResolver(userSchema),
    });

    /*** Cargar datos del usuario ***/
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoadingData(true);
                const response = await UserService.getUserById(id);
                const user = response.data?.data || response.data;
                setUserData(user);
                
                // Rellenar el formulario con los datos
                reset({
                    nombre: user.nombre || "",
                    correo: user.correo || "",
                });
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("Error al cargar los datos del usuario");
                    console.error(err);
                }
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchUserData();
    }, [id, reset]);

    /*** Submit - actualiza usuario ***/
    const onSubmit = async (dataForm) => {
        try {
            setIsSubmitting(true);
            setError("");

            const payload = {
                id: Number(id),
                nombre: dataForm.nombre.trim(),
                correo: dataForm.correo.trim().toLowerCase(),
            };

            const response = await UserService.updateUser(payload);

            if (response.data?.success || response.data?.data) {
                toast.success("Usuario actualizado correctamente", { duration: 3000 });
                navigate("/user");
            } else if (response.data?.error) {
                setError(response.data.error);
            } else {
                setError("Error al actualizar el usuario");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Error al actualizar el usuario");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#171741] flex items-center justify-center">
                <div className="text-[#F2E199]">Cargando datos del usuario...</div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-[#171741] flex items-center justify-center">
                <div className="text-[#ECB44D]">Usuario no encontrado</div>
            </div>
        );
    }

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
            <Card className="mx-auto w-full max-w-3xl border-[#ECB44D] bg-[#171741]/90 p-6 shadow-[0_12px_45px_rgba(11,18,44,0.4)]">
                <h2
                    className="mb-1 text-4xl text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.6)]"
                    style={{ fontFamily: '"Great Vibes", cursive' }}
                >
                    Actualizar Perfil
                </h2>
                <p className="mb-6 text-sm text-[#6FB8E6]">
                    Actualiza tu nombre y correo electrónico. Los campos de rol y fecha de registro no pueden modificarse.
                </p>

                {error && (
                    <div className="mb-4 rounded-md border border-[#ECB44D]/50 bg-[#ECB44D]/10 px-4 py-3 text-sm" style={{ color: '#ECB44D' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Nombre */}
                    <div>
                        <Controller
                            name="nombre"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Nombre completo"
                                    type="text"
                                    placeholder="Tu nombre"
                                    error={errors.nombre?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Correo */}
                    <div>
                        <Controller
                            name="correo"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Correo electrónico"
                                    type="email"
                                    placeholder="tu@email.com"
                                    error={errors.correo?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Rol - Solo lectura */}
                    <div>
                        <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Rol del usuario</Label>
                        <Input
                            type="text"
                            value={userData.rol || ""}
                            readOnly
                            className="w-full rounded-xl border border-[#6FB8E6] bg-[#194174]/40 text-[#F2E199] cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-[#6FB8E6]">Este campo no puede modificarse</p>
                    </div>

                    {/* Fecha de Registro - Solo lectura */}
                    <div>
                        <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Fecha de registro</Label>
                        <Input
                            type="text"
                            value={userData.fecha_registro ? new Date(userData.fecha_registro).toLocaleDateString('es-ES') : ""}
                            readOnly
                            className="w-full rounded-xl border border-[#6FB8E6] bg-[#194174]/40 text-[#F2E199] cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-[#6FB8E6]">Este campo no puede modificarse</p>
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
                            className="flex items-center gap-2 bg-[#ECB44D] text-[#171741] hover:bg-[#ECB44D]/80"
                            disabled={isSubmitting}
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}
