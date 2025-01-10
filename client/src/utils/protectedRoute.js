import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (!isLoggedIn || !sessionExpiry || Date.now() > parseInt(sessionExpiry, 10)) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('sessionExpiry');
        return <Navigate to="/" replace />; // Redirect to login
    }

    return children;
};

export default ProtectedRoute;
