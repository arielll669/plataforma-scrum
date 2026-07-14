import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import useAuth from '../../controllers/useAuth';
import authService from '../../models/authService';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const changes = { name: form.name, email: form.email };
      if (form.password) changes.password = form.password;
      const updated = await authService.updateProfile(user.id, changes);
      setUser(updated);
      setForm({ ...form, password: '' });
      setFeedback({ type: 'success', message: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setFeedback({ type: 'danger', message: err.response?.data?.error || 'No se pudo actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Mi perfil</Card.Title>
            {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Nombre</Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Dejar en blanco para no cambiarla"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                />
              </Form.Group>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
