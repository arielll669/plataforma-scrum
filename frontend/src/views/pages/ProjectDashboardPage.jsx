import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import useProject from '../../controllers/useProject';
import projectService from '../../models/projectService';
import reportService from '../../models/reportService';
import RoleGuard from '../components/RoleGuard';
import { ALL_ROLES, ROLE_LABELS, ROLES } from '../../config/constants';

export default function ProjectDashboardPage() {
  const { project, loadProject } = useProject();
  const [statusReport, setStatusReport] = useState(null);
  const [memberForm, setMemberForm] = useState({ email: '', role: ROLES.DEV_TEAM });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!project) return;
    reportService.getStatusReport(project.id).then(setStatusReport).catch(() => {});
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project) return null;

  async function handleAddMember(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await projectService.addMember(project.id, memberForm);
      await loadProject(project.id);
      setMemberForm({ email: '', role: ROLES.DEV_TEAM });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo agregar al miembro.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(userId, role) {
    setBusy(true);
    setError(null);
    try {
      await projectService.reassignRole(project.id, userId, role);
      await loadProject(project.id);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo reasignar el rol.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3>{project.name}</h3>
          <p className="text-muted mb-0">{project.description}</p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to={`/projects/${project.id}/backlog`} variant="outline-primary">Backlog</Button>
          <Button as={Link} to={`/projects/${project.id}/sprints`} variant="outline-primary">Sprints</Button>
          <Button as={Link} to={`/projects/${project.id}/reports`} variant="outline-primary">Reportes</Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <div className="fs-3 fw-bold">{statusReport?.totalStories ?? '—'}</div>
              <div className="text-muted small">Historias totales</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <div className="fs-3 fw-bold">{statusReport?.backlogCount ?? '—'}</div>
              <div className="text-muted small">En Product Backlog</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <div className="fs-3 fw-bold">{statusReport?.doneCount ?? '—'}</div>
              <div className="text-muted small">Historias terminadas</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <div className="fs-3 fw-bold">{statusReport?.totalSprints ?? '—'}</div>
              <div className="text-muted small">Sprints creados</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Avance general del proyecto (RF-07.2)</Card.Title>
              {statusReport?.activeSprint ? (
                <>
                  <p className="mb-1">Sprint activo: <strong>{statusReport.activeSprint.sprintName}</strong></p>
                  <ProgressBar
                    now={statusReport.activeSprint.percentComplete}
                    label={`${statusReport.activeSprint.percentComplete}%`}
                  />
                  <p className="text-muted small mt-2">
                    {statusReport.activeSprint.doneItems} de {statusReport.activeSprint.totalItems} historias terminadas
                  </p>
                </>
              ) : (
                <Alert variant="secondary" className="mb-0">No hay un sprint activo actualmente.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Miembros y roles Scrum (RF-02)</Card.Title>
              <Table size="sm" borderless className="mb-3">
                <tbody>
                  {project.members.map((m) => (
                    <tr key={m.userId}>
                      <td>{m.user?.name}</td>
                      <td className="text-muted small">{m.user?.email}</td>
                      <td style={{ width: '11rem' }}>
                        <RoleGuard
                          allow={[ROLES.PRODUCT_OWNER, ROLES.SCRUM_MASTER]}
                          fallback={<Badge bg="secondary">{ROLE_LABELS[m.role]}</Badge>}
                        >
                          <Form.Select
                            size="sm"
                            value={m.role}
                            disabled={busy}
                            onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                          >
                            {ALL_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </Form.Select>
                        </RoleGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <RoleGuard allow={[ROLES.PRODUCT_OWNER, ROLES.SCRUM_MASTER]}>
                <Form onSubmit={handleAddMember} className="d-flex gap-2">
                  <Form.Control
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    required
                  />
                  <Form.Select
                    style={{ maxWidth: '12rem' }}
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </Form.Select>
                  <Button type="submit" disabled={busy}>Agregar</Button>
                </Form>
              </RoleGuard>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
