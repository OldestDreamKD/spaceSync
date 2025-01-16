import React, { useState } from 'react';
import FloorMapForm from '../components/floorMapForm';
import FloorMapList from '../components/floorMapListAdmin';
import Layout from '../components/headerAdmin';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const FloorMapManagement = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [refresh, setRefresh] = useState(false); // New state to trigger refresh

    const toggleDialog = () => {
        setIsDialogOpen(!isDialogOpen);
    };

    const handleRefresh = () => {
        setRefresh((prev) => !prev); // Toggle the refresh state
    };

    return (
        <div>
            <span>
                <Layout />
            </span>
            <div className="container">
                <span className="d-flex align-items-center justify-content-between">
                    <h1 className="my-4">Floor Maps</h1>
                    <FontAwesomeIcon icon={faPlus} className='fa-2x' onClick={toggleDialog} />
                </span>
                <FloorMapList refresh={refresh} /> {/* Pass refresh as prop */}
                {isDialogOpen && (
                    <FloorMapForm onClose={toggleDialog} onRefresh={handleRefresh} />
                )}
            </div>
        </div>
    );
};

export default FloorMapManagement;
