import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import UserService from "@/services/UserService";
import { Eye, EyeOff } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomInputField } from "../ui/custom/custom-input-field";

const schema = yup.object({
    correo: yup.string().email("Correo inválido").required("El correo es obligatorio"),
    contrasena: yup.string().required("La contraseña es obligatoria"),
});

export default function Login() {
    const { saveUser } = useUser();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        try {
            const response = await UserService.loginUser(data);
            
            // Verificar si la respuesta es exitosa y devolvió un token válido
            if (response?.data?.success && response.data?.data && typeof response.data.data === 'string') {
                const token = response.data.data;
                // Guardar el token JWT
                saveUser(token);
                toast.success("Inicio de sesión exitoso");
                navigate("/");
            } else {
                toast.error("Credenciales inválidas o token inválido");
            }
        } catch (error) {
            toast.error("Error al iniciar sesión");
            console.error("Error en login:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md shadow-lg border border-white/10 bg-white/10 backdrop-blur-lg text-white">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Iniciar Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <CustomInputField
                                {...register("correo")}
                                label="Correo electrónico"
                                placeholder="ejemplo@correo.com"
                                error={errors.correo?.message} />
                        </div>
                        <div>
                            <Label htmlFor="contrasena" className="text-white">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="contrasena"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********"
                                    {...register("contrasena")}
                                    className="bg-white text-white placeholder:text-gray-400 border border-gray-300 pr-16"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-md bg-white/10 p-1 text-accent border border-accent hover:border-accent/90"
                                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.contrasena && (
                                <p className="text-red-400 text-sm mt-1">{errors.contrasena.message}</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold mt-2"
                        >
                            {isSubmitting ? "Ingresando..." : "Ingresar"}
                        </Button>

                        <p className="text-sm text-center mt-4 text-gray-300">
                            ¿No tienes cuenta?{" "}
                            <a href="/user/register" className="text-accent underline hover:text-accent/80">
                                Regístrate
                            </a>
                        </p>
                    </form>

                </CardContent>
            </Card>
        </div>
    );
}
