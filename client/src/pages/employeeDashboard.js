import React from 'react';
import FloorMapList from '../components/floorMapListEmp';
import Layout from '../components/headerEmployee';


const EmployeeDashboard = () => {
    return (
        <div>
            <span>
                <Layout />
            </span>
            <div className="container">
                <span className="d-flex align-items-center justify-content-between">
                    <h1 className="my-4">Floor Maps</h1>
                </span>
                <FloorMapList />
            </div>
        </div>
    );
};

export default EmployeeDashboard;
