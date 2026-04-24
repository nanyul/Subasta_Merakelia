// src/context/UserProvider.jsx
import { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "./UserContext";

export default function UserProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // Decodifica el token actual solo cuando token cambia, evitando usar useEffect para un estado derivado.
    const user = useMemo(() => {
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (error) {
            console.error("Token inválido:", error);
            return null;
        }
    }, [token]);

    // Guarda el token en localStorage y actualiza el estado para mantener la sesión del usuario.
    const saveUser = useCallback((newToken) => {
        // Validar que newToken sea un string válido
        if (typeof newToken !== 'string' || newToken.trim().length === 0) {
            console.error("Token inválido: debe ser un string no vacío");
            return;
        }
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }, []);

    // Limpia la sesión eliminando el token del estado y del almacenamiento local.
    const clearUser = useCallback(() => {
        setToken(null);
        localStorage.removeItem("token");
    }, []);

    // Retorna la información decodificada del token actual de forma segura.
    const decodeToken = useCallback(() => {
        return user;
    }, [user]);

    // Verifica si el rol del usuario autenticado está incluido dentro de los roles permitidos.
    const authorize = useCallback(
        (requiredRoles = []) => {
            if (!user || !user.rol) return false;
            return requiredRoles.includes(user.rol.descripcion);
        },
        [user]
    );

    const isAuthenticated = !!token && !!user;

    const contextValue = useMemo(
        () => ({
            token,
            user,
            isAuthenticated,
            saveUser,
            clearUser,
            decodeToken,
            authorize,
        }),
        [token, user, isAuthenticated, saveUser, clearUser, decodeToken, authorize]
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};