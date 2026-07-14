import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Alert, Badge, Button, Card, Spinner } from 'react-bootstrap';
import useProject from '../../controllers/useProject';
import storyService from '../../models/storyService';
import StoryFormModal from '../components/StoryFormModal';
import RoleGuard from '../components/RoleGuard';
import { ROLES } from '../../config/constants';

export default function BacklogPage() {
  const { project, role } = useProject();
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const isProductOwner = role === ROLES.PRODUCT_OWNER;

  async function fetchBacklog() {
    setLoading(true);
    try {
      const data = await storyService.getBacklog(project.id);
      setBacklog(data);
    } catch {
      setError('No se pudo cargar el Product Backlog.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (project) fetchBacklog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function handleCreateOrUpdate(data) {
    if (editingStory) {
      await storyService.update(editingStory.id, data);
    } else {
      await storyService.create(project.id, data);
    }
    await fetchBacklog();
  }

  async function handleDelete(storyId) {
    if (!window.confirm('¿Eliminar esta historia de usuario?')) return;
    await storyService.remove(storyId);
    await fetchBacklog();
  }

  async function handleDragEnd(result) {
    if (!result.destination || !isProductOwner) return;
    const reordered = Array.from(backlog);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setBacklog(reordered);
    try {
      await storyService.reorder(project.id, reordered.map((s) => s.id));
    } catch {
      await fetchBacklog();
    }
  }

  if (!project) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Product Backlog</h3>
          <small className="text-muted">
            {isProductOwner
              ? 'Arrastre las historias para reordenar la prioridad (RF-03.3 / RF-04.4).'
              : 'Solo el Product Owner puede reordenar la prioridad.'}
          </small>
        </div>
        <Button onClick={() => { setEditingStory(null); setShowModal(true); }}>+ Nueva historia</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : backlog.length === 0 ? (
        <Alert variant="info">El Product Backlog está vacío. Agregue la primera historia de usuario.</Alert>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="backlog">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {backlog.map((story, index) => (
                  <Draggable
                    key={story.id}
                    draggableId={story.id}
                    index={index}
                    isDragDisabled={!isProductOwner}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <Card
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`mb-2 shadow-sm backlog-item ${dragSnapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <Card.Body className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="secondary">#{story.priorityOrder}</Badge>
                              <strong>{story.title}</strong>
                              {story.storyPoints != null && (
                                <Badge bg="info">{story.storyPoints} pts</Badge>
                              )}
                            </div>
                            {(story.asA || story.iWant || story.soThat) && (
                              <p className="text-muted small mb-1 mt-1">
                                Como <em>{story.asA || '—'}</em>, quiero <em>{story.iWant || '—'}</em> para <em>{story.soThat || '—'}</em>.
                              </p>
                            )}
                            {story.acceptanceCriteria?.length > 0 && (
                              <ul className="small text-muted mb-0">
                                {story.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            )}
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => { setEditingStory(story); setShowModal(true); }}
                            >
                              Editar
                            </Button>
                            <RoleGuard allow={[ROLES.PRODUCT_OWNER, ROLES.SCRUM_MASTER]}>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(story.id)}>
                                Eliminar
                              </Button>
                            </RoleGuard>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <StoryFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleCreateOrUpdate}
        story={editingStory}
        members={project.members}
      />
    </div>
  );
}
