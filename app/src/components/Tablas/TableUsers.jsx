import { Link } from "react-router-dom";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Plus, ArrowLeft, BookUser} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoadingGrid } from "../ui/custom/LoadingGrid";
import { ErrorAlert } from "../ui/custom/ErrorAlert";
import { EmptyState } from "../ui/custom/EmptyState";
import fondoTabla from "@/assets/fondoTabla.png";

//Services
import UserService from "@/services/UserService";

// Headers de la tabla
//map = foreach
const userColumns = [
    { key: "nombre", label: "Nombre" },
    { key: "rol", label: "Rol" },
    { key: "estado", label: "Estado" },
    { key: "actions", label: "Acciones" },
];

//Funcion traer datos de usuarios
export default function TableUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]); //Array para almacenar usuarios
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [togglingUserId, setTogglingUserId] = useState(null);

    /*** Función para alternar estado del usuario ***/
    const handleToggleUserStatus = async (userId) => {
        try {
            setTogglingUserId(userId);
            const response = await UserService.updateUserStatus(userId);
            
            console.log('Response:', response);
            
            // Verificar si la solicitud fue exitosa
            if (response.data?.success === true && response.data?.data) {
                // Actualizar el usuario en la lista con los datos devueltos por el servidor
                setUsers(users.map(user => 
                    user.id === userId 
                        ? response.data.data
                        : user
                ));
                toast.success("Estado del usuario actualizado", { duration: 2000 });
            } else if (response.data?.success === false) {
                // El servidor devolvió un error (ej: usuario tiene subastas)
                toast.error(response.data?.message || "Error al actualizar el estado del usuario", { duration: 2000 });
            }
        } catch (err) {
            console.error(err);
            toast.error("Error al actualizar el estado del usuario", { duration: 2000 });
        } finally {
            setTogglingUserId(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await UserService.getUsers();//Llama servicio para obtener usuarios
            console.log(response) //Lo muestra en al consola
            const result = response.data; //Verificacion
            console.log(result) //Lo muestra en al consola
            if (result.success) {
                setUsers(result.data || []);
            } else {
                setError(result.message || "Error desconocido");
            }
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
        };
        fetchData()
    }, []);

    if (loading) return <LoadingGrid type="grid" />; 
    if (error) return <ErrorAlert title="Error al cargar usuarios" message={error} />; 
    if (users.length === 0) 
    return <EmptyState message="No se encontraron usuarios en esta tienda." />; 

    const minimumRows = 4;
    const emptyRows = Array.from({ length: Math.max(0, minimumRows - users.length) });

    //Diseño tabla y foreach para mostrar usuarios
    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[#171741] px-4 py-8"
            style={{
                backgroundImage: `linear-gradient(rgba(7, 13, 34, 0.34), rgba(7, 13, 34, 0.68)), url(${fondoTabla})`,
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
                    background: 'radial-gradient(circle at 18% 18%, rgba(111,184,230,0.16) 0%, rgba(111,184,230,0) 22%), radial-gradient(circle at 83% 16%, rgba(242,225,153,0.18) 0%, rgba(242,225,153,0) 18%), radial-gradient(circle at 52% 72%, rgba(236,180,77,0.14) 0%, rgba(236,180,77,0) 26%)',
                }}
            />
            <div className="mx-auto max-w-[1200px] py-6 relative z-10">
            <div className="mb-7 flex items-start justify-between gap-4">
                <h1
                    className="text-[1.8rem] leading-none text-[#F2E199] drop-shadow-[0_0_10px_rgba(242,225,153,0.95)] md:text-[2.3rem]"
                    style={{ fontFamily: '"Great Vibes", cursive' }}
                >
                    Listado de Usuarios
                </h1>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                asChild
                                variant="outline"
                                size="icon"
                                className="size-9 border-[#ECB44D] bg-[#171741]/70 text-[#F2E199] shadow-[0_0_18px_rgba(236,180,77,0.18)] hover:bg-[#194174] hover:text-[#F2E199]"
                            >
                                <Link to="/user/create">
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Crear usuario</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-lg border border-[#ECB44D]/50 bg-transparent shadow-[0_20px_60px_rgba(12,18,46,0.42)]">
                <Table className="table-fixed border-separate border-spacing-0">
                    <TableHeader>
                        <TableRow className="border-0 hover:bg-transparent">
                            {/* ()=>{} */}
                            {/* ()=>() */}
                            {userColumns.map((col)=>( 
                                <TableHead
                                    key={col.key}
                                    className="h-9 border-r border-b border-[#ECB44D]/45 bg-[#194174]/55 px-3 text-center text-sm font-bold uppercase tracking-wide text-[#F2E199] last:border-r-0 md:h-11 md:text-[0.92rem]"
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* foreach */}
                        {users.map((user)=>( 
                            <TableRow key={user.id} className="border-0 bg-[#194174]/28 hover:bg-[#194174]/38">
                                <TableCell className="h-10 border-r border-b border-[#ECB44D]/35 px-4 py-1 text-center text-[0.62rem] font-semibold uppercase tracking-wide text-[#F2E199] md:h-12 md:text-[0.74rem]">
                                    {user.nombre}
                                </TableCell>
                                <TableCell className="h-10 border-r border-b border-[#ECB44D]/35 px-4 py-1 text-center text-[0.62rem] font-semibold uppercase tracking-wide text-[#F2E199] md:h-12 md:text-[0.74rem]">
                                    {user.rol}
                                </TableCell>
                                <TableCell className="h-10 border-r border-b border-[#ECB44D]/35 px-4 py-1 text-center text-[0.62rem] font-semibold uppercase tracking-wide text-[#F2E199] md:h-12 md:text-[0.74rem]">
                                    {user.estado}
                                </TableCell>
                                <TableCell className="h-10 border-b border-[#ECB44D]/35 px-3 py-1 md:h-12">
                                    <div className="flex items-center justify-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link to={`/user/${user.id}`}>
                                                    <Button variant="ghost" size="icon" className="size-8 text-[#F2E199] hover:bg-[#194174] hover:text-[#F2E199]">
                                                        <BookUser className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>Detalle Usuario</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link to={`/user/edit/${user.id}`}>
                                                    <Button variant="ghost" size="icon" className="size-8 text-[#6FB8E6] hover:bg-[#194174] hover:text-[#6FB8E6]">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>Editar</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-2 px-2 py-1">
                                                    <Switch
                                                        checked={user.estado === 'Activo'}
                                                        onCheckedChange={() => handleToggleUserStatus(user.id)}
                                                        disabled={togglingUserId === user.id}
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {user.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {emptyRows.map((_, index) => (
                            <TableRow key={`empty-${index}`} className="border-0 bg-[#194174]/28 hover:bg-[#194174]/28">
                                <TableCell className="h-10 border-r border-b border-[#ECB44D]/35 md:h-12" />
                                <TableCell className="h-10 border-r border-b border-[#ECB44D]/35 md:h-12" />
                                <TableCell className="h-10 border-r border-b border-[#ECB44D]/35 md:h-12" />
                                <TableCell className="h-10 border-b border-[#ECB44D]/35 md:h-12" />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </div>
            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-6 flex h-9 items-center gap-2 border border-[#ECB44D] bg-[#171741]/70 px-4 text-sm text-[#F2E199] hover:bg-[#194174] hover:text-[#F2E199]"
            >
                <ArrowLeft x className="w-4 h-4" />
                Regresar
            </Button>
            </div>
        </div>
    );
}
