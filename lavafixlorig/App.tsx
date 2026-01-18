import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Diagnosis from './components/Diagnosis';
import DeviceDetails from './components/DeviceDetails';
import Auth from './components/Auth';
import DiagnosisHistory from './components/DiagnosisHistory';

const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/history" element={<DiagnosisHistory />} />
                <Route path="/diagnosis" element={<Diagnosis />} />
                <Route path="/devices" element={<DeviceDetails />} />
            </Routes>
        </HashRouter>
    );
};

export default App;
