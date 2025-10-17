import { useContext } from 'react';
import { LocationContext } from '../context/LocationContext';

export const useLocation = () => {
    const context = useContext(LocationContext);

    if (!context) {
        throw new Error('useLocation debe usarse dentro de LocationProvider');
    }

    return context;
};
