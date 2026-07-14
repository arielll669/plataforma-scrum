import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from './AppNavbar';

export default function Layout() {
  return (
    <>
      <AppNavbar />
      <Container fluid="lg" className="pb-5">
        <Outlet />
      </Container>
    </>
  );
}
