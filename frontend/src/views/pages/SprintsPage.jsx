import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import useProject from '../../controllers/useProject';
import sprintService from '../../models/sprintService';
import storyService from '../../models/storyService';
import RoleGuard from '../components/RoleGuard';
import { ROLES, SPRINT_STATUS_LABELS } from '../../config/constants';

const statusVariant = { planned: 'secondary', active: 'primary', closed: 'success' };

export default function SprintsPage() {
  const { project } = useProject();
  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', goal: '' });
  const [selectedStory, setSelectedStory] = useState({});
  const [busy, setBusy] = useState(false);

  async function fetchAll() {
    setLoading(true);
    try {
      const [sprintsData, backlogData] = await Promise.all([
        sprintService.list(project.id),
        storyService.getBacklog(project.id),
      ]);
      setSprints(sprintsData);
      setBacklog(backlogData);
    } catch {
      setError('No se pudieron cargar los sprints.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function handleCreateSprint(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sprintService.create(project.id, form);
      setShowModal(false);
      setForm({ name: '', startDate: '', endDate: '', goal: '' });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el sprint.');
    } finally {
      setBusy(false);
    }
  }

  async function handleClose(sprintId) {
    setBusy(true);
    setError(null);
    try {
      await sprintService.close(sprintId);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cerrar el sprint.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddItem(sprintId) {
    const storyId = selectedStory[sprintId];
    if (!storyId) return;
    setBusy(true);
    setError(null);
    try {
      await sprintService.addItem(sprintId, storyId);
      setSelectedStory({ ...selectedStory, [sprintId]: '' });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo mover la historia al sprint.');
    } finally {
      setBusy(false);
    }
  }

  if (!project) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Sprints</h3>
        <RoleGuard allow={[ROLES.SCRUM_MASTER, ROLES.PRODUCT_OWNER]}>
          <Button onClick={() => setShowModal(true)}>+ Nuevo sprint</Button>
        </RoleGuard>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : sprints.length === 0 ? (
        <Alert variant="info">Aún no hay sprints creados para este proyecto.</Alert>
      ) : (
        <Row xs={1} md={2} className="g-3">
          {sprints.map((sprint) => (
            <Col key={sprint.id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title>{sprint.name}</Card.Title>
                    <Badge bg={statusVariant[sprint.status]}>{SPRINT_STATUS_LABELS[sprint.status]}</Badge>
                  </div>
                  <p className="text-muted small mb-1">
                    {sprint.startDate} — {sprint.endDate}
                  </p>
                  {sprint.goal && <p className="small mb-2">Objetivo: {sprint.goal}</p>}

                  <div className="d-flex gap-2 mb-3">
                    <Button as={Link} to={`/projects/${project.id}/sprints/${sprint.id}/board`} size="sm" variant="outline-primary">
                      Tablero Kanban
                    </Button>
                    <RoleGuard allow={[ROLES.SCRUM_MASTER, ROLES.PRODUCT_OWNER]}>
                      {sprint.status !== 'closed' && (
                        <Button size="sm" variant="outline-danger" disabled={busy} onClick={() => handleClose(sprint.id)}>
                          Cerrar sprint
                        </Button>
                      )}
                    </RoleGuard>
                  </div>

                  {sprint.status !== 'closed' && (
                    <Form.Group className="d-flex gap-2">
                      <Form.Select
                        size="sm"
                        value={selectedStory[sprint.id] || ''}
                        onChange={(e) => setSelectedStory({ ...selectedStory, [sprint.id]: e.target.value })}
                      >
                        <option value="">Seleccionar historia del backlog…</option>
                        {backlog.map((s) => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </Form.Select>
                      <Button size="sm" disabled={busy || !selectedStory[sprint.id]} onClick={() => handleAddItem(sprint.id)}>
                        Agregar
                      </Button>
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo sprint</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSprint}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Form.Group>
            <Row className="mb-3">
              <Col>
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </Col>
              <Col>
                <Form.Label>Fecha de fin</Form.Label>
                <Form.Control
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </Col>
            </Row>
            <Form.Group controlId="goal">
              <Form.Label>Objetivo del sprint</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Creando…' : 'Crear sprint'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
