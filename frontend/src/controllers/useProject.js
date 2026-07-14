import { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import useAuth from './useAuth';

export default function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject debe usarse dentro de ProjectProvider');
  const { user } = useAuth();

  const membership = ctx.project && user
    ? ctx.project.members.find((m) => m.userId === user.id)
    : null;

  return { ...ctx, role: membership?.role || null };
}
