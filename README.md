# Plataforma Web para la Gestión de Proyectos Scrum

Prototipo funcional desarrollado para la asignatura *Lectura y Escritura de Textos Académicos* (NRC 31139), ESPE. Cubre los módulos RF-01 a RF-08 definidos en `Plan_de_Trabajo_Plataforma_Scrum.md`: usuarios y roles Scrum, historias de usuario, Product Backlog, Sprint Backlog, tablero Kanban, seguimiento de avances y reportes.

## Arquitectura

- **Backend** (`backend/`): Node.js + Express, arquitectura MVC por capas: `routes` → `controllers` → `services` → `models/repositories`. Persistencia en **PostgreSQL** (vía [Supabase](https://supabase.com)) usando el ORM **Sequelize**.
- **Frontend** (`frontend/`): React (Vite), organización MVC-equivalente:
  - `src/models/` — servicios que hablan con la API (axios).
  - `src/controllers/` — hooks que exponen datos y acciones a las vistas (`useAuth`, `useProject`).
  - `src/views/` — páginas (`pages/`) y componentes (`components/`).
  - `src/context/` — estado global con Context API + `useReducer` (`AuthContext`, `ProjectContext`).

## Requisitos

- Node.js 18+
- npm
- Una cuenta gratuita en [supabase.com](https://supabase.com) (ver paso 1 de la puesta en marcha)

## Puesta en marcha

### 1. Crear el proyecto de Supabase (una sola vez)

Supabase da una base de datos PostgreSQL administrada gratis. Si nunca lo ha usado, la experiencia es similar a phpMyAdmin: hay un **Table Editor** (grilla de filas/columnas) y un **SQL Editor**, solo que el motor es Postgres en vez de MySQL.

1. Crear una cuenta en [supabase.com](https://supabase.com) e iniciar sesión.
2. **New project** → elegir organización, nombre (p. ej. `plataforma-scrum`), una **contraseña de base de datos** (guárdela, no se puede volver a ver) y la región más cercana. Esperar 1-2 minutos a que se aprovisione.
3. En el proyecto: **Project Settings → Database → Connection string → pestaña "URI"**. Copiar esa cadena (formato `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`) y reemplazar `[PASSWORD]` por la contraseña del paso 2.
4. Pegar esa cadena como `DATABASE_URL` en `backend/.env` (ver paso siguiente).

No hace falta crear tablas a mano: al arrancar, el backend las crea automáticamente a partir de los modelos Sequelize (`sequelize.sync`). Luego puede verlas en **Table Editor** dentro de Supabase.

### 2. Backend (puerto 4000)

```bash
cd backend
npm install
cp .env.example .env
# Editar backend/.env y pegar el DATABASE_URL obtenido en el paso anterior
npm run dev
```

Si la conexión falla, el servidor lo indica claramente en consola (revisar que `DATABASE_URL` esté bien pegado, con la contraseña correcta y sin espacios).

### 3. Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

El frontend usa un proxy de Vite (`vite.config.js`) que redirige `/api` hacia `http://localhost:4000`, así que no hace falta configurar CORS manualmente en desarrollo.

Abrir `http://localhost:5173`, registrarse, crear un proyecto y comenzar a trabajar (el usuario que crea un proyecto queda como Product Owner; desde el panel del proyecto puede invitar a otros usuarios ya registrados por correo y asignarles rol).

## Módulos funcionales implementados

| RF | Módulo | Dónde |
|---|---|---|
| RF-01 | Usuarios (registro, login, perfil) | `backend/src/{controllers,services}/auth.*`, `user.*`; `frontend/src/views/pages/{Login,Register,Profile}Page.jsx` |
| RF-02 | Roles Scrum por proyecto (PO, SM, equipo de desarrollo) | `project.service.js`, `roleMiddleware.js`; panel del proyecto en el frontend |
| RF-03 / RF-04 | Historias de usuario y Product Backlog (crear, editar, eliminar, priorizar, criterios de aceptación, estimación) | `story.*`; `BacklogPage.jsx` (drag-and-drop solo para Product Owner) |
| RF-05 | Sprint Backlog (crear/cerrar sprint, mover historias) | `sprint.*`; `SprintsPage.jsx` |
| RF-06 | Tablero Kanban (Por hacer / En progreso / Terminado, drag-and-drop) | endpoint `GET /sprints/:id/board`, `PUT /stories/:id/status`; `KanbanBoardPage.jsx` |
| RF-07 | Seguimiento de avances (% completado por sprint, avance general del proyecto) | endpoint `GET /sprints/:id/progress`; barras de progreso en `ProjectDashboardPage.jsx` y `KanbanBoardPage.jsx` |
| RF-08 | Reportes (estado, desempeño del equipo, indicadores de calidad/defectos) | `report.*`, `defect.*`; `ReportsPage.jsx` con gráficos (recharts) |

## Seguridad (RNF-03)

- Contraseñas con hash `bcryptjs`.
- Autenticación con JWT (`Authorization: Bearer <token>`).
- Autorización por rol Scrum dentro de cada proyecto (`authMiddleware` + `roleMiddleware`), p. ej. solo el Product Owner puede reordenar el Product Backlog.

## Persistencia de datos (RNF-07)

> **Nota sobre el requisito RNF-07:** el documento de planificación pedía MySQL 8. El equipo optó por **PostgreSQL vía Supabase** (base de datos relacional gestionada, gratuita para este alcance) en su lugar — cumple el mismo objetivo (persistencia relacional real) con un motor distinto. Vale la pena dejarlo anotado en el informe o consultarlo con el docente.

Cada entidad (`User`, `Project`, `UserStory`, `Sprint`, `Defect`) tiene:
- Un modelo Sequelize en `backend/src/models/index.js` (define las columnas y las relaciones/FKs entre tablas).
- Un repositorio en `backend/src/models/repositories/*.repository.js` que expone una interfaz async CRUD uniforme (`findAll`, `findById`, `create`, `update`, `remove`, más finders propios como `findByEmail` o `findBacklog`), heredada de `SequelizeRepository`.

Esta separación es la que permitió migrar de un prototipo en memoria a Supabase **sin tocar `services/` ni `controllers/`** — solo se reescribió la capa de repositorios. Si en el futuro se quisiera cambiar de proveedor (otro Postgres, o incluso MySQL cambiando el `dialect` de Sequelize), el mismo patrón aplica.

Simplificaciones de diseño para este alcance (ver RNF-09, que descarta grandes volúmenes de datos): los miembros de un proyecto (`Project.members`) se guardan como columna `JSONB` embebida en vez de una tabla de unión aparte, y los criterios de aceptación de una historia (`UserStory.acceptanceCriteria`) como columna `ARRAY` nativa de Postgres.

## Control de versiones (RNF-08)

El repositorio Git local ya está inicializado con un primer commit. Para conectarlo a un remoto de GitHub y subirlo:

```bash
git remote add origin <URL-del-repositorio>
git branch -M main
git push -u origin main
```
