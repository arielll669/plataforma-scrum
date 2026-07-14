import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useProject from '../../controllers/useProject';
import reportService from '../../models/reportService';
import { DEFECT_SEVERITY_LABELS } from '../../config/constants';

const SEVERITY_COLORS = { low: '#0dcaf0', medium: '#ffc107', high: '#fd7e14', critical: '#dc3545' };

export default function ReportsPage() {
  const { project } = useProject();
  const [statusReport, setStatusReport] = useState(null);
  const [teamReport, setTeamReport] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [defectForm, setDefectForm] = useState({ title: '', description: '', severity: 'medium' });
  const [busy, setBusy] = useState(false);

  async function fetchAll() {
    setLoading(true);
    try {
      const [status, team, quality, defectList] = await Promise.all([
        reportService.getStatusReport(project.id),
        reportService.getTeamPerformanceReport(project.id),
        reportService.getQualityReport(project.id),
        reportService.listDefects(project.id),
      ]);
      setStatusReport(status);
      setTeamReport(team);
      setQualityReport(quality);
      setDefects(defectList);
    } catch {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function handleCreateDefect(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await reportService.createDefect(project.id, defectForm);
      setShowModal(false);
      setDefectForm({ title: '', description: '', severity: 'medium' });
      await fetchAll();
    } catch {
      setError('No se pudo registrar el defecto.');
    } finally {
      setBusy(false);
    }
  }

  if (!project) return null;
  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const severityData = Object.entries(qualityReport?.defectsBySeverity || {}).map(([severity, count]) => ({
    name: DEFECT_SEVERITY_LABELS[severity] || severity,
    value: count,
    severity,
  }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Reportes (RF-08)</h3>
        <Button onClick={() => setShowModal(true)}>+ Reportar defecto</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fs-6 text-uppercase text-muted">Estado del proyecto (RF-08.1)</Card.Title>
              <Table size="sm" borderless className="mb-0">
                <tbody>
                  <tr><td>Historias totales</td><td className="text-end fw-bold">{statusReport?.totalStories}</td></tr>
                  <tr><td>En backlog</td><td className="text-end fw-bold">{statusReport?.backlogCount}</td></tr>
                  <tr><td>Terminadas</td><td className="text-end fw-bold">{statusReport?.doneCount}</td></tr>
                  <tr><td>Sprints totales</td><td className="text-end fw-bold">{statusReport?.totalSprints}</td></tr>
                  <tr><td>Sprints cerrados</td><td className="text-end fw-bold">{statusReport?.closedSprints}</td></tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fs-6 text-uppercase text-muted">Indicadores de calidad (RF-08.3)</Card.Title>
              <Table size="sm" borderless className="mb-0">
                <tbody>
                  <tr><td>% historias completadas</td><td className="text-end fw-bold">{qualityReport?.completionRate}%</td></tr>
                  <tr><td>Defectos totales</td><td className="text-end fw-bold">{qualityReport?.totalDefects}</td></tr>
                  <tr><td>Defectos abiertos</td><td className="text-end fw-bold">{qualityReport?.openDefects}</td></tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fs-6 text-uppercase text-muted">Defectos por severidad</Card.Title>
              {severityData.length === 0 ? (
                <p className="text-muted small mb-0">Sin defectos reportados todavía.</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={severityData} dataKey="value" nameKey="name" outerRadius={60} label>
                      {severityData.map((entry) => (
                        <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] || '#6c757d'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-6 text-uppercase text-muted">Desempeño del equipo (RF-08.2)</Card.Title>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={teamReport}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedCount" name="Historias completadas" fill="#0d6efd" />
                  <Bar dataKey="pointsCompleted" name="Puntos completados" fill="#20c997" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="fs-6 text-uppercase text-muted">Defectos reportados</Card.Title>
          {defects.length === 0 ? (
            <p className="text-muted small mb-0">No hay defectos registrados.</p>
          ) : (
            <Table size="sm" hover responsive>
              <thead>
                <tr><th>Título</th><th>Severidad</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {defects.map((d) => (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td><Badge bg="secondary">{DEFECT_SEVERITY_LABELS[d.severity]}</Badge></td>
                    <td>{d.status}</td>
                    <td>{new Date(d.reportedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reportar defecto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateDefect}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Título</Form.Label>
              <Form.Control
                value={defectForm.title}
                onChange={(e) => setDefectForm({ ...defectForm, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={defectForm.description}
                onChange={(e) => setDefectForm({ ...defectForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="severity">
              <Form.Label>Severidad</Form.Label>
              <Form.Select
                value={defectForm.severity}
                onChange={(e) => setDefectForm({ ...defectForm, severity: e.target.value })}
              >
                {Object.entries(DEFECT_SEVERITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Reportar'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
