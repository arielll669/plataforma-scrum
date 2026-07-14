import { Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import useAuth from '../../controllers/useAuth';
import useProject from '../../controllers/useProject';
import { ROLE_LABELS } from '../../config/constants';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const { project, role } = useProject();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container fluid>
        <Navbar.Brand as={Link} to="/projects">Plataforma Scrum</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {project && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to={`/projects/${project.id}`}>Panel</Nav.Link>
              <Nav.Link as={Link} to={`/projects/${project.id}/backlog`}>Product Backlog</Nav.Link>
              <Nav.Link as={Link} to={`/projects/${project.id}/sprints`}>Sprints</Nav.Link>
              <Nav.Link as={Link} to={`/projects/${project.id}/reports`}>Reportes</Nav.Link>
            </Nav>
          )}
          <Nav className="ms-auto align-items-lg-center">
            {project && role && (
              <span className="text-light small me-3">Rol: {ROLE_LABELS[role]}</span>
            )}
            <NavDropdown title={user?.name || 'Cuenta'} align="end">
              <NavDropdown.Item as={Link} to="/profile">Mi perfil</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/projects">Mis proyectos</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>Cerrar sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
