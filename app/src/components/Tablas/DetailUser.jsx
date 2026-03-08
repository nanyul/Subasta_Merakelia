import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorAlert } from "../ui/custom/ErrorAlert";
// Shadcn UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    ArrowLeft,
    Mail,
    CalendarDays,
    ShieldCheck,
    Star
} from "lucide-react";
import { LoadingGrid } from '../ui/custom/LoadingGrid';
import { EmptyState } from '../ui/custom/EmptyState';
import fondoTabla from "@/assets/fondoTabla.png";

//Services
import UserService from '../../services/UserService';

export function DetailUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setData] = useState(null); //Constante para guardar los datos del usuario
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await UserService.getUserById(id);
                setData(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                }
            } catch (err) {
                // Si el error no es por cancelación, se registra
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                // Independientemente del resultado, se actualiza el loading
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);


    if (loading) return <LoadingGrid count={1} type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar usuarios" message={error} />;
    if (!user || !user.data || (Array.isArray(user.data) && user.data.length === 0))
        return <EmptyState message="No se encontraron usuarios en esta tienda." />;

    const userData = Array.isArray(user.data) ? user.data[0] : user.data;
    const userRoleId = Number(userData.id_rol);
    const metricLabel = userRoleId === 2 ? 'Cantidad de Subastas:' : 'Cantidad de Pujas:';
    const metricValue = userRoleId === 2 ? userData.cantidad_subastas : userData.cantidad_pujas;
    const detailItems = [
        {
            label: 'Correo',
            value: userData.correo,
            icon: Mail,
            accent: '#6FB8E6',
        },
        {
            label: 'Estado',
            value: userData.estado,
            icon: ShieldCheck,
            accent: '#ECB44D',
        },
        {
            label: metricLabel.replace(':', ''),
            value: metricValue ?? 'N/D',
            icon: Star,
            accent: '#F2E199',
        },
        {
            label: 'Fecha de Registro',
            value: userData.fecha_registro,
            icon: CalendarDays,
            accent: '#6FB8E6',
        },
    ];

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-8 md:py-12"
            style={{
                backgroundImage: `linear-gradient(rgba(7, 13, 34, 0.35), rgba(7, 13, 34, 0.68)), url(${fondoTabla})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="hero-stars-soft absolute inset-0 opacity-80" />
            <div className="hero-stars absolute inset-0 opacity-90" />
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 18% 18%, rgba(111,184,230,0.16) 0%, rgba(111,184,230,0) 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.22) 0%, rgba(242,225,153,0) 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.15) 0%, rgba(236,180,77,0) 26%)',
                }}
            />

            <div className="relative z-10 mx-auto max-w-[68rem] pt-14 md:pt-16">
                <div className="mb-5 flex flex-col gap-3 md:mb-6">
                    <h1
                        className="text-[2.1rem] leading-none text-[#F2E199] drop-shadow-[0_0_12px_rgba(242,225,153,0.95)] md:text-[3.15rem]"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        Detalle del usuario
                    </h1>
                </div>

                <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
                    <Card
                        className="overflow-hidden border-[#ECB44D]/50 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md"
                        style={{
                            background: 'linear-gradient(180deg, rgba(34,56,104,0.88) 0%, rgba(23,23,65,0.9) 52%, rgba(19,22,78,0.92) 100%)',
                        }}
                    >
                        <CardContent className="relative p-4 md:p-5">
                            <div className="relative flex flex-col items-center text-center">
                                <div className="relative mb-3 mt-1 flex h-24 w-24 items-center justify-center rounded-full border border-[#ECB44D] bg-[#194174]/60 shadow-[0_0_24px_rgba(111,184,230,0.26)] md:h-26 md:w-26">
                                    <div className="absolute inset-2 rounded-full border border-[#F2E199]/40" />
                                    <User className="h-9 w-9 text-[#F2E199]" />
                                </div>
                                <h2 className="text-[1.5rem] font-semibold tracking-wide text-[#F2E199] md:text-[1.75rem]">
                                    {userData.nombre}
                                </h2>
                                <Badge className="mt-2.5 border-[#ECB44D]/80 bg-[#194174]/70 px-3 py-1 text-xs text-[#F2E199] hover:bg-[#194174]/70 md:text-sm">
                                    {userData.rol}
                                </Badge>
                                <div className="mt-4 grid w-full gap-3">

                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#ECB44D]/50 bg-[#171741]/64 shadow-[0_20px_60px_rgba(12,18,46,0.42)] backdrop-blur-md">
                        <CardContent className="p-4 md:p-5">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#6FB8E6]/40 bg-[#194174]/55 px-3 py-1.5 text-[#F2E199]">
                                    <Star className="h-3.5 w-3.5 text-[#ECB44D]" />
                                    <span className="text-xs tracking-[0.24em] uppercase md:text-sm">Datos personales</span>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {detailItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.label}
                                            className="group rounded-[1.15rem] border border-[#ECB44D]/40 bg-[#194174]/24 p-3.5 transition duration-300 hover:-translate-y-1 hover:bg-[#194174]/36"
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                                                    style={{
                                                        borderColor: `${item.accent}88`,
                                                        backgroundColor: `${item.accent}1c`,
                                                        boxShadow: `0 0 24px ${item.accent}22`,
                                                    }}
                                                >
                                                    <Icon className="h-4 w-4" style={{ color: item.accent }} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#6FB8E6]">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-1 break-words text-[0.9rem] font-semibold text-[#F2E199] md:text-[1rem]">
                                                        {item.value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-5 flex h-8.5 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-3.5 text-xs text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.15)] hover:bg-[#194174] hover:text-[#F2E199] md:text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Regresar
                </Button>
            </div>
        </div>
    );
}