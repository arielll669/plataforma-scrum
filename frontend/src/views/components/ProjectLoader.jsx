import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import useProject from '../../controllers/useProject';

/**
 * Carga el proyecto indicado por el parámetro de ruta `:projectId` en el
 * ProjectContext antes de renderizar las páginas anidadas (backlog,
 * sprints, kanban, reportes), que asumen que ya hay un proyecto activo.
 */
export default function ProjectLoader() {
  const { projectId } = useParams();
  const { project, status, error, loadProject } = useProject();

  useEffect(() => {
    if (!project || project.id !== projectId) {
      loadProject(projectId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (status === 'loading' || (!project && status !== 'error')) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (status === 'error') {
    return <Alert variant="danger">{error}</Alert>;
  }

  return <Outlet />;
}
