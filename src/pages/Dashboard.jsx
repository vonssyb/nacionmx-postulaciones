import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import RoleGuard from '../components/auth/RoleGuard';
import Applications from './Applications';
import StaffHub from './StaffHub';
import ShiftPanel from './ShiftPanel';
import FinancePanel from './FinancePanel';
import BoloBoard from './BoloBoard';
import RoleCancellation from './RoleCancellation';
import LogList from './LogList';
import Rules from './Rules';
import Status from './Status';
import AdminPanel from './AdminPanel';
import Settings from './Settings';

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
                <Route path="staff" element={<StaffHub />} />
                <Route path="shifts" element={<ShiftPanel />} />
                <Route path="finance" element={<FinancePanel />} />
                <Route path="bolo" element={<BoloBoard />} />
                <Route path="cancellations" element={<RoleCancellation />} />
                <Route path="logs" element={<LogList />} />
                <Route path="rules" element={<Rules />} />
                <Route path="status" element={<Status />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default Dashboard;
