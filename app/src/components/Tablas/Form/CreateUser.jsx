import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// icons
import { Save, ArrowLeft } from "lucide-react";

// servicios
import UserService from "../../../services/UserService";
import RolService from "../../../services/RolService";

// componentes reutilizables
import { CustomInputField } from "../../ui/custom/custom-input-field";
import { CustomSelect } from "../../ui/custom/custom-select";
import fondoTabla from "@/assets/fondoTabla.png";


const extractArrayFromResponse = (response) => {
    const payload = response?.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;

    if (payload && typeof payload === "object") {
        const firstArray = Object.values(payload).find(Array.isArray);
        if (Array.isArray(firstArray)) {
            console.log('✓ Caso 4: Se encontró array en Object.values()');
            console.log('Retornando:', firstArray);
            return firstArray;
        }
    }

    console.warn(' No se encontró array en la respuesta');
    console.warn('Retornando array vacío');
    return [];
};

export function CreateUser() {
    const navigate = useNavigate();

    /*** Estados ***/
    const [dataRoles, setDataRoles] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const rolesDisponibles = useMemo(() => {
        return dataRoles.filter((rol) => rol && rol.id && rol.descripcion);
    }, [dataRoles]);

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
        contrasena: yup
            .string()
            .required("La contraseña es requerida")
            .min(6, "La contraseña debe tener al menos 6 caracteres"),
        id_rol: yup
            .number()
            .typeError("Seleccione un rol")
            .required("El rol es requerido"),
    });

    /*** React Hook Form ***/
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            nombre: "",
            correo: "",
            contrasena: "",
            id_rol: "",
        },
        resolver: yupResolver(userSchema),
    });

    /*** Cargar roles disponibles ***/
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const response = await RolService.getRoles();
                const roles = extractArrayFromResponse(response);
                setDataRoles(roles);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError("Error al cargar los roles disponibles");
                    console.error(err);
                }
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    /*** Submit - crea usuario ***/
    const onSubmit = async (dataForm) => {
        try {
            setIsSubmitting(true);
            setError("");

            const payload = {
                nombre: dataForm.nombre.trim(),
                correo: dataForm.correo.trim().toLowerCase(),
                contrasena: dataForm.contrasena,
                id_rol: Number(dataForm.id_rol),
            };

            const response = await UserService.createUser(payload);

            if (response.data?.success || response.data?.data) {
                toast.success("Usuario creado correctamente", { duration: 3000 });
                navigate("/user");
            } else if (response.data?.error) {
                setError(response.data.error);
            } else {
                setError("Error al crear el usuario");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Error al crear el usuario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sinRolesDisponibles = !isLoadingData && rolesDisponibles.length === 0;

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
                    Crear Usuario
                </h2>
                <p className="mb-6 text-sm text-[#6FB8E6]">
                    Complete los datos del usuario y seleccione un rol disponible.
                </p>

                {error && (
                    <div className="mb-4 rounded-md border border-[#ECB44D]/50 bg-[#ECB44D]/10 px-4 py-3 text-sm" style={{ color: '#ECB44D' }}>
                        {error}
                    </div>
                )}

                {sinRolesDisponibles && (
                    <div className="mb-4 rounded-md border border-amber-300/60 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                        No hay roles disponibles en este momento.
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
                                    placeholder="Juan Pérez"
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
                                    placeholder="usuario@ejemplo.com"
                                    error={errors.correo?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <Controller
                            name="contrasena"
                            control={control}
                            render={({ field }) => (
                                <CustomInputField
                                    {...field}
                                    label="Contraseña"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    error={errors.contrasena?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <Label className="mb-1 block text-sm font-medium text-[#F2E199]">Rol del usuario</Label>
                        <Controller
                            name="id_rol"
                            control={control}
                            render={({ field }) => (
                                <CustomSelect
                                    field={field}
                                    data={rolesDisponibles}
                                    label="Rol"
                                    getOptionLabel={(rol) => rol.descripcion}
                                    getOptionValue={(rol) => rol.id}
                                    error={errors.id_rol?.message}
                                />
                            )}
                        />
                        <p className="mt-2 text-xs text-[#6FB8E6]">
                            Seleccione el rol que tendrá este usuario en el sistema.
                        </p>
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
                            disabled={isLoadingData || isSubmitting || sinRolesDisponibles}
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? "Guardando..." : "Crear usuario"}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}
