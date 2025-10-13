import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


//Uso: const { idUsuario, nombre, dni } = useAuth();

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }

    const { userInfo, userToken, signIn, signOut, isLoading, selectedRole, setSelectedRole, refreshAccessToken } = context;

    // Extraer datos del token
    const idUsuario = userInfo?.idUsuario || userInfo?.id || userInfo?.sub;
    const dni = userInfo?.dni;
    const nombre = userInfo?.nombre || userInfo?.name;
    const email = userInfo?.email;
    const roles = userInfo?.roles || [];

    return {
        // Datos del usuario
        userInfo,
        idUsuario,
        dni,
        nombre,
        email,
        roles,
        selectedRole,
        
        // Estado
        userToken,
        isLoading,
        
        // Funciones
        signIn,
        signOut,
        setSelectedRole,
        refreshAccessToken,
    };
};
