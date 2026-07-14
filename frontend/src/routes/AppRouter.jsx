import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../views/components/ProtectedRoute';
import Layout from '../views/components/Layout';
import ProjectLoader from '../views/components/ProjectLoader';

import LoginPage from '../views/pages/LoginPage';
import RegisterPage from '../views/pages/RegisterPage';
import ProfilePage from '../views/pages/ProfilePage';
import ProjectsListPage from '../views/pages/ProjectsListPage';
import ProjectDashboardPage from '../views/pages/ProjectDashboardPage';
import BacklogPage from '../views/pages/BacklogPage';
import SprintsPage from '../views/pages/SprintsPage';
import KanbanBoardPage from '../views/pages/KanbanBoardPage';
import ReportsPage from '../views/pages/ReportsPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects" element={<ProjectsListPage />} />

          <Route path="/projects/:projectId" element={<ProjectLoader />}>
            <Route index element={<ProjectDashboardPage />} />
            <Route path="backlog" element={<BacklogPage />} />
            <Route path="sprints" element={<SprintsPage />} />
            <Route path="sprints/:sprintId/board" element={<KanbanBoardPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
