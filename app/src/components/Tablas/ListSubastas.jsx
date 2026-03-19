import { useEffect, useState } from "react";
import SubastaService from "../../services/SubastaService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { ListCardsSubastas } from "./ListCardsSubastas";
import fondoTabla from "@/assets/fondoTabla.png";

export function ListSubastas() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await SubastaService.getSubastasActivas();
                console.log(response.data);
                setData(response.data);
                if (!response.data.success) {
                    setError(response.data.message);
                }
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingGrid type="grid" />;
    if (error) return <ErrorAlert title="Error al cargar subastas" message={error} />;
    if (!data || !data.data || data.data.length === 0)
        return <EmptyState message="No se encontraron subastas activas." />;

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-8 md:px-6 md:py-10"
            style={{
                backgroundImage: `linear-gradient(rgba(8, 14, 36, 0.34), rgba(8, 14, 36, 0.68)), url(${fondoTabla})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="hero-stars-soft absolute inset-0 opacity-80" />
            <div className="hero-stars absolute inset-0 opacity-90" />
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle at 16% 22%, rgba(111,184,230,0.15) 0%, rgba(111,184,230,0) 20%), radial-gradient(circle at 82% 18%, rgba(242,225,153,0.18) 0%, rgba(242,225,153,0) 16%), radial-gradient(circle at 56% 74%, rgba(236,180,77,0.14) 0%, rgba(236,180,77,0) 24%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl pt-14 md:pt-16">
                <div className="mb-6 md:mb-8">
                    <p className="mb-4 text-xs uppercase tracking-[0.38em] text-[#6FB8E6] md:mb-5 md:text-sm">
                        Subastas activas
                    </p>
                    <h1
                        className="text-[2.25rem] leading-none text-[#F2E199] drop-shadow-[0_0_12px_rgba(242,225,153,0.95)] md:text-[3.3rem]"
                        style={{ fontFamily: '"Great Vibes", cursive' }}
                    >
                        Subastas en Vivo
                    </h1>
                </div>

                {data && (
                    <ListCardsSubastas data={data.data} />
                )}
            </div>
        </div>
    );
}
