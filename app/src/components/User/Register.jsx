import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserService from "@/services/UserService";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = yup.object({
    nombre: yup.string().required("El nombre es obligatorio"),
    correo: yup.string().email("Correo inválido").required("El correo es obligatorio"),
    password: yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es obligatoria"),
    id_rol: yup.number().required('El rol es requerido'),
});

export default function Register() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        // Valores iniciales
        defaultValues: {
            nombre: '',
            correo: '',
            password: '',
            id_rol: 2,
        },
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            // Asegurar que contrasena sea hasheada en el backend
            const userData = {
                nombre: data.nombre,
                correo: data.correo,
                contrasena: data.password,
                id_rol: data.id_rol
            };
            
            const response = await UserService.createUser(userData);
            if (response?.data?.success) {
                toast.success("Usuario creado correctamente");
                navigate("/login");
            } else {
                toast.error("No se pudo crear el usuario");
            }
        } catch (error) {
            toast.error("Error al crear usuario");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md shadow-lg border border-white/10 bg-white/10 backdrop-blur-lg text-white">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Crear Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                type="text"
                                placeholder="Tu nombre"
                                {...register("nombre")}
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                            />
                            {errors.nombre && <p className="text-red-300 text-sm mt-1">{errors.nombre.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="correo">Correo electrónico</Label>
                            <Input
                                id="correo"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                {...register("correo")}
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                            />
                            {errors.correo && <p className="text-red-300 text-sm mt-1">{errors.correo.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                {...register("password")}
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                            />
                            {errors.password && (
                                <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold mt-2"
                        >
                            {isSubmitting ? "Creando..." : "Crear cuenta"}
                        </Button>

                        <p className="text-sm text-center mt-4">
                            ¿Ya tienes cuenta?{" "}
                            <a href="/login" className="text-accent underline hover:text-accent/80">
                                Inicia sesión
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
