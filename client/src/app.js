import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FloorMapManagement from './pages/floorMapManagement';
import Register from './pages/register';
import Login from './pages/login';
import ProtectedRoute from './utils/protectedRoute';
import FloorMapEditor from './pages/floorMapEditor';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route
                    path="/admindash"
                    element={
                        <ProtectedRoute>
                            <FloorMapManagement />
                        </ProtectedRoute>
                    }
                />
                <Route path='/mapedit' element={
                    <ProtectedRoute>
                        <FloorMapEditor />
                    </ProtectedRoute>
                    } 
                />
                {/* Add other routes as needed */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;
