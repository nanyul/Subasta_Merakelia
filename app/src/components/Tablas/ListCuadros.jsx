import { useEffect, useState } from "react";
import CuadrosService from "../../services/CuadrosService";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { EmptyState } from "../ui/custom/EmptyState";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { ListCardCuadros } from "./ListCardCuadros";

export function ListCuadros() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await CuadrosService.getCuadros();
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
    if (error) return <ErrorAlert title="Error al cargar cuadros" message={error} />;
    if (!data || !data.data || data.data.length === 0)
        return <EmptyState message="No se encontraron cuadros subastables." />;

    return (
        <div className="mx-auto max-w-7xl p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
                Cuadros Subastables
            </h1>
            {data && (
                <ListCardCuadros data={data.data} />
            )}
        </div>
    );
}
