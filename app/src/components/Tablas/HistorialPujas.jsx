import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    ArrowLeft,
    Gavel,
    User,
    CalendarDays,
    DollarSign
} from "lucide-react";

import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";

import SubastaService from "@/services/SubastaService";

export function HistorialPujas() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [pujas, setPujas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // FORMATO DE PRECIO
    const formatPrice = (price) => {
        return `$ ${Number(price).toFixed(2)}`;
    };

    // FORMATO DE FECHA
    const formatDate = (date) => {

        return new Date(date).toLocaleString("es-CR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    useEffect(() => {

        const fetchData = async () => {

            try {

                const response = await SubastaService.getHistorialPujas(id);
                const result = response.data;

                if (result.success) {

                    const pujasArray = Array.isArray(result.data) ? result.data : [];

                    // VALIDACIÓN: solo pujas relacionadas con esta subasta
                    const pujasFiltradas = pujasArray.filter(
                        (p) => p.id_subasta == id
                    );

                    // ORDEN CRONOLÓGICO DESCENDENTE
                    const ordenadas = pujasFiltradas.sort(
                        (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)
                    );

                    setPujas(ordenadas);

                } else {

                    setError(result.message);

                }

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }

        };

        fetchData();

    }, [id]);


    if (loading) return <LoadingGrid type="grid" />;

    if (error)
        return <ErrorAlert title="Error al cargar historial de pujas" message={error} />;

    if (pujas.length === 0)
        return <EmptyState message="No hay pujas registradas para esta subasta." />;


    // PUJA MÁS ALTA
    const pujaMaxima = Math.max(...pujas.map(p => Number(p.monto)));

    // RANKING POR MONTO
    const ranking = [...pujas].sort(
        (a, b) => Number(b.monto) - Number(a.monto)
    );

    // GANADOR ACTUAL
    const pujaGanadora = ranking[0];


    return (

        <div className="container mx-auto py-8">

            {/* HEADER */}

            <div className="flex items-center gap-3 mb-4">

                <Gavel className="w-6 h-6 text-primary" />

                <h1 className="text-3xl font-bold tracking-tight">
                    Historial de Pujas
                </h1>

            </div>


            {/* PUJA GANADORA */}

            <Card className="mb-6 border-green-200 bg-green-50">

                <CardContent className="p-4 flex items-center gap-3">

                    <Gavel className="text-green-600 w-5 h-5" />

                    <div>

                        <p className="font-semibold text-green-700">
                            Puja más alta actual
                        </p>

                        <p className="text-sm text-muted-foreground">

                            {pujaGanadora.usuario} — {formatPrice(pujaGanadora.monto)}

                        </p>

                    </div>

                </CardContent>

            </Card>


            {/* TOTAL PUJAS */}

            <p className="text-muted-foreground mb-6">

                Total de pujas registradas:

                <span className="font-semibold text-primary ml-1">
                    {pujas.length}
                </span>

            </p>


            <Card>

                <CardContent className="p-0">

                    <div className="rounded-md border">

                        <Table>

                            <TableHeader className="bg-primary/10">

                                <TableRow>

                                    <TableHead>Ranking</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Monto ofertado</TableHead>
                                    <TableHead>Fecha y hora</TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody>

                                {pujas.map((puja) => {

                                    const esMayor = Number(puja.monto) === pujaMaxima;

                                    const posicion =
                                        ranking.findIndex(r => r.id === puja.id) + 1;

                                    return (

                                        <TableRow
                                            key={puja.id}
                                            className={esMayor ? "bg-cyan-500 font-semibold" : ""}
                                        >

                                            {/* RANKING */}

                                            <TableCell className="font-bold text-primary">

                                                #{posicion}

                                            </TableCell>


                                            {/* USUARIO */}

                                            <TableCell className="flex items-center gap-2 font-medium">

                                                <User className="w-4 h-4 text-muted-foreground" />

                                                {puja.usuario}

                                            </TableCell>


                                            {/* MONTO */}

                                            <TableCell
                                                className={
                                                    esMayor
                                                        ? "text-green-600 font-bold"
                                                        : ""
                                                }
                                            >

                                                <div className="flex items-center gap-2">

                                                    <DollarSign className="w-4 h-4 text-muted-foreground" />

                                                    {formatPrice(puja.monto)}

                                                </div>

                                            </TableCell>


                                            {/* FECHA */}

                                            <TableCell>

                                                <div className="flex items-center gap-2">

                                                    <CalendarDays className="w-4 h-4 text-muted-foreground" />

                                                    {formatDate(puja.fecha_hora)}

                                                </div>

                                            </TableCell>

                                        </TableRow>

                                    );

                                })}

                            </TableBody>

                        </Table>

                    </div>

                </CardContent>

            </Card>


            {/* BOTÓN REGRESAR */}
            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-accent text-white hover:bg-accent/90 mt-6"
            >

                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>

        </div>
    );
}