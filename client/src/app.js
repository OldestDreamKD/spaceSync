import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FloorMapManagement from './pages/floorMapManagement';
import Register from './pages/register';
import Login from './pages/login';
import AdminLogin from './pages/adminLogin';
import ProtectedRoute from './utils/protectedRoute';
import FloorMapEditor from './pages/floorMapEditor';
import FloorMap from './pages/floorMap';
import EmployeeDashboard from './pages/employeeDashboard';
import UserBookedList from "./pages/userBookedList"
import EmployeeList from "./pages/employeeList";
import BookingList from './pages/bookingsList';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/adminLogin" element={<AdminLogin />} />

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

                <Route path='/employeedash' element={
                    <ProtectedRoute>
                        <EmployeeDashboard />
                    </ProtectedRoute>
                }
                />


                <Route path='/map' element={
                    <ProtectedRoute>
                        <FloorMap />
                    </ProtectedRoute>
                }
                />

                <Route path='/list' element={
                    <ProtectedRoute>
                        <UserBookedList />
                    </ProtectedRoute>
                }
                />

                <Route path='/profile' element={
                    <ProtectedRoute>
                        <EmployeeList />
                    </ProtectedRoute>
                }
                />

                <Route path='/listall' element={
                    <ProtectedRoute>
                        <BookingList />
                    </ProtectedRoute>
                }
                />
                {/* Add other routes as needed */}
            </Routes>
        </BrowserRouter>
    );
};

export default App;
