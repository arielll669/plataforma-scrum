import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import useAuth from '../../controllers/useAuth';

export default function RegisterPage() {
  const { register, status, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register(form);
      navigate('/projects', { replace: true });
    } catch {
      // el error ya queda reflejado en el estado del AuthContext
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: '24rem' }} className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3 text-center">Crear cuenta</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
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
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                required
              />
              <Form.Text muted>Mínimo 6 caracteres.</Form.Text>
            </Form.Group>
            <Button type="submit" className="w-100" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creando cuenta…' : 'Registrarse'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <small>
              ¿Ya tiene cuenta? <Link to="/login">Inicie sesión</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
