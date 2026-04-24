import { useEffect, useRef } from "react";
import { useUser } from "../../hooks/useUser";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
    ArrowLeft
} from "lucide-react";
import PropTypes from "prop-types";

export function RoleRoute({ children, requiredRoles }) {
    const { authorize } = useUser();
    const hasShownToast = useRef(false);
    const navigate = useNavigate();

    const isAuthorized = authorize(requiredRoles);

    useEffect(() => {
        // Solo mostrar el toast una vez por intento
        if (!isAuthorized && !hasShownToast.current) {
            toast.error("Acceso no autorizado", {
                duration: 3000,
            });
            hasShownToast.current = true;
        }
    }, [isAuthorized]);

    if (isAuthorized) {
        return children;
    }

    // Mostrar un fallback visual en lugar de dejar la pantalla vacía
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-2xl font-bold text-red-600">Acceso no autorizado</h2>
            <p className="text-gray-500 mt-2 ">
                No tienes permisos para ver esta sección.
            </p>
            <Button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-secondary flex items-center gap-2 my-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Regresar
            </Button>
        </div>
    );
}

RoleRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};