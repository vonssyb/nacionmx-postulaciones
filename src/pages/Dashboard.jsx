import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Applications from './Applications';
import AdminPanel from './AdminPanel';
import RoleGuard from '../components/auth/RoleGuard';

const Dashboard = () => {
    return (
        <Routes>
            <Route element={
                <RoleGuard>
                    <MainLayout />
                </RoleGuard>
            }>
                <Route index element={<Applications />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default Dashboard;
