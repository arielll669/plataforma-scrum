import useProject from '../../controllers/useProject';

/**
 * Muestra `children` solo si el rol del usuario en el proyecto actual
 * está incluido en `allow` (RF-02.2: restringir acciones por rol).
 */
export default function RoleGuard({ allow, children, fallback = null }) {
  const { role } = useProject();

  if (!role || !allow.includes(role)) {
    return fallback;
  }

  return children;
}
