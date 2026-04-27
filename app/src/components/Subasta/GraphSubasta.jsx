import { useEffect, useState } from "react";
import SubastaService from "../../services/SubastaService";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import UserService from "../../services/UserService";
import CuadrosService from "../../services/CuadrosService";
import fondoTabla from "@/assets/fondoTabla.png";

function extractArray(response) {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object") {
    const match = Object.values(payload).find(Array.isArray);
    return Array.isArray(match) ? match : [];
  }
  return [];
}

function isVendedor(user) {
  const rol = String(user?.rol ?? user?.descripcion_rol ?? user?.tipo_rol ?? "").toLowerCase();
  return Number(user?.id_rol) === 2 || rol.includes("vendedor");
}

export function GraphSubasta() {
  const [data, setData] = useState([]);
  const [sellerData, setSellerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [subastasResp, usersResp, cuadrosResp] = await Promise.all([
          SubastaService.getAllSubastas(),
          UserService.getUsers(),
          CuadrosService.getCuadros(),
        ]);

        const items = extractArray(subastasResp);
        const users = extractArray(usersResp).filter(isVendedor);
        const cuadros = extractArray(cuadrosResp);
        const usersById = new Map(
          users.map((user) => [String(user.id), user])
        );
        const cuadrosByName = new Map(
          cuadros.map((cuadro) => [String(cuadro.nombre ?? "").trim().toLowerCase(), cuadro])
        );

        const normalizedItems = Array.isArray(items) ? items : [];

        const counts = { Activas: 0, Finalizadas: 0, Canceladas: 0, Otros: 0 };

        normalizedItems.forEach((s) => {
          const raw = (s.estado ?? s.estado_subasta ?? s.status ?? "").toString().toLowerCase();
          if (raw.includes("act")) counts.Activas += 1;
          else if (raw.includes("fin")) counts.Finalizadas += 1;
          else if (raw.includes("can") || raw.includes("cancel")) counts.Canceladas += 1;
          else counts.Otros += 1;
        });

        const chart = [
          { name: "Activas", value: counts.Activas },
          { name: "Finalizadas", value: counts.Finalizadas },
          { name: "Canceladas", value: counts.Canceladas },
        ];

        const sellerCounts = new Map();

        normalizedItems.forEach((item) => {
          const cuadroNombre = String(item.objeto ?? item.nombre_cuadro ?? item.nombre ?? "").trim().toLowerCase();
          const cuadro = cuadroNombre ? cuadrosByName.get(cuadroNombre) : null;
          const sellerId = cuadro?.id_usuario ?? null;
          const sellerUser = sellerId !== null ? usersById.get(String(sellerId)) : null;
          if (!sellerUser || !isVendedor(sellerUser)) return;

          const sellerName = sellerUser.nombre || sellerUser.name || sellerUser.correo || sellerUser.email;
          if (!sellerName) return;

          const sellerLabel = sellerName;
          const key = String(sellerId);

          const current = sellerCounts.get(key) ?? { name: sellerLabel, value: 0 };
          current.value += 1;
          sellerCounts.set(key, current);
        });

        const sellers = Array.from(sellerCounts.values()).sort((a, b) => b.value - a.value);

        setData(chart);
        setSellerData(sellers);
      } catch (err) {
        setError(err?.message ?? "Error al obtener subastas");
        toast.error("No se pudieron cargar las subastas");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const COLORS = ["#ECB44D", "#6FB8E6", "#F2E199"];
  const SELLER_COLORS = ["#6FB8E6", "#ECB44D", "#F2E199", "#194174", "#D8A33E"];

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">Cargando subastas...</div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 font-medium mt-10">Ocurrió un error: {error}</div>
    );

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-7 md:py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(7, 13, 34, 0.34), rgba(7, 13, 34, 0.68)), url(${fondoTabla})`,
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
          background: 'radial-gradient(circle at 18% 18%, rgba(111,184,230,0.16) 0%, rgba(111,184,230,0) 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.18) 0%, rgba(242,225,153,0) 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.14) 0%, rgba(236,180,77,0) 26%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl pt-12 md:pt-14">
        <div className="mb-5 md:mb-6">
          <h1
            className="text-[1.9rem] leading-none text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.8rem] text-center"
            style={{ fontFamily: '"Great Vibes", cursive' }}
          >
            Reportes de Subastas
          </h1>
        </div>
      </div>
      <Card className="mx-auto w-full max-w-6xl overflow-hidden rounded-lg border border-[#ECB44D]/50 bg-transparent shadow-[0_20px_60px_rgba(12,18,46,0.42)]">
        <CardHeader>
          <CardTitle className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-[#F2E199] md:text-base">
            Subasta por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto flex w-full max-w-5xl justify-center">
            <div className="h-80 min-h-80 w-full min-w-0 max-w-4xl">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6FB8E6" opacity={0.35} />
                  <XAxis dataKey="name" stroke="#F2E199" tick={{ fill: "#F2E199" }} />
                  <YAxis allowDecimals={false} stroke="#F2E199" tick={{ fill: "#F2E199" }} />
                  <Tooltip
                    formatter={(value) => [value, "Cantidad"]}
                    contentStyle={{ backgroundColor: "#194174", border: "1px solid #6FB8E6", color: "#F2E199" }}
                    labelStyle={{ color: "#F2E199" }}
                  />
                  <Legend wrapperStyle={{ color: "#F2E199" }} />
                  <Bar dataKey="value" name="Subastas" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

         {/* <div className="w-full md:w-1/3 text-card-foreground">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Activas:</span>
                  <strong>{data.find((d) => d.name === "Activas")?.value ?? 0}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Finalizadas:</span>
                  <strong>{data.find((d) => d.name === "Finalizadas")?.value ?? 0}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Canceladas:</span>
                  <strong>{data.find((d) => d.name === "Canceladas")?.value ?? 0}</strong>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span>Total:</span>
                  <strong>{total}</strong> 
                </div> 
              </div>
            </div>*/}
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-lg border border-[#ECB44D]/50 bg-transparent shadow-[0_20px_60px_rgba(12,18,46,0.42)]">
        <CardHeader>
          <CardTitle className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-[#F2E199] md:text-base">
            Subastas por Usuario Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto flex w-full max-w-5xl justify-center">
            <div className="h-104 min-h-104 w-full min-w-0 max-w-4xl">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sellerData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#6FB8E6" opacity={0.35} />
                  <XAxis
                    dataKey="name"
                    stroke="#F2E199"
                    tick={{ fill: "#F2E199" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis allowDecimals={false} stroke="#F2E199" tick={{ fill: "#F2E199" }} />
                  <Tooltip
                    formatter={(value) => [value, "Subastas creadas"]}
                    contentStyle={{ backgroundColor: "#194174", border: "1px solid #6FB8E6", color: "#F2E199" }}
                    labelStyle={{ color: "#F2E199" }}
                  />
                  <Legend wrapperStyle={{ color: "#F2E199" }} />
                  <Bar dataKey="value" name="Subastas creadas" radius={[6, 6, 0, 0]}>
                    {sellerData.map((entry, index) => (
                      <Cell key={`seller-cell-${index}`} fill={SELLER_COLORS[index % SELLER_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-[#6FB8E6]">
                  <th className="px-3 py-2 uppercase tracking-[0.22em]">Usuario vendedor</th>
                  <th className="px-3 py-2 uppercase tracking-[0.22em]">Cantidad total</th>
                </tr>
              </thead>
              <tbody>
                {sellerData.map((item) => (
                  <tr key={item.name} className="rounded-lg border border-border bg-[#194174]/20 text-[#F2E199]">
                    <td className="px-3 py-2 font-semibold">{item.name}</td>
                    <td className="px-3 py-2">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
