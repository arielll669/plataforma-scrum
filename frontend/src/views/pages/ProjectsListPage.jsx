import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import projectService from '../../models/projectService';
import { ROLE_LABELS } from '../../config/constants';
import useAuth from '../../controllers/useAuth';

export default function ProjectsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  async function fetchProjects() {
    setLoading(true);
    try {
      const data = await projectService.list();
      setProjects(data);
    } catch {
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await projectService.create(form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      await fetchProjects();
    } catch {
      setError('No se pudo crear el proyecto.');
    } finally {
      setCreating(false);
    }
  }

  function myRoleIn(project) {
    const membership = project.members.find((m) => m.userId === user.id);
    return membership ? ROLE_LABELS[membership.role] : '—';
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Mis proyectos</h3>
        <Button onClick={() => setShowModal(true)}>+ Nuevo proyecto</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : projects.length === 0 ? (
        <Alert variant="info">Aún no participa en ningún proyecto. Cree uno para comenzar.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {projects.map((project) => (
            <Col key={project.id}>
              <Card
                className="h-100 shadow-sm"
                role="button"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Card.Body>
                  <Card.Title>{project.name}</Card.Title>
                  <Card.Text className="text-muted">{project.description || 'Sin descripción'}</Card.Text>
                  <div className="d-flex justify-content-between small text-secondary">
                    <span>{project.members.length} miembro(s)</span>
                    <span>Rol: {myRoleIn(project)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo proyecto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Creando…' : 'Crear'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
