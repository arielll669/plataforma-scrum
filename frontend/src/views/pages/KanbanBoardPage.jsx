import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Alert, Badge, Card, Col, ProgressBar, Row, Spinner } from 'react-bootstrap';
import sprintService from '../../models/sprintService';
import storyService from '../../models/storyService';
import { KANBAN_COLUMNS } from '../../config/constants';

export default function KanbanBoardPage() {
  const { sprintId } = useParams();
  const [board, setBoard] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchBoard() {
    try {
      const [boardData, progressData] = await Promise.all([
        sprintService.getBoard(sprintId),
        sprintService.getProgress(sprintId),
      ]);
      setBoard(boardData);
      setProgress(progressData);
    } catch {
      setError('No se pudo cargar el tablero Kanban.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId]);

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = Array.from(board[source.droppableId]);
    const [moved] = sourceCol.splice(source.index, 1);
    const destCol = source.droppableId === destination.droppableId ? sourceCol : Array.from(board[destination.droppableId]);
    moved.status = destination.droppableId;
    destCol.splice(destination.index, 0, moved);

    const nextBoard = { ...board, [source.droppableId]: sourceCol, [destination.droppableId]: destCol };
    setBoard(nextBoard);

    try {
      await storyService.updateStatus(draggableId, destination.droppableId);
      const progressData = await sprintService.getProgress(sprintId);
      setProgress(progressData);
    } catch {
      fetchBoard();
    }
  }

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Tablero Kanban — {progress?.sprintName}</h3>
        {progress && (
          <div style={{ minWidth: '16rem' }}>
            <ProgressBar now={progress.percentComplete} label={`${progress.percentComplete}%`} />
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Row className="g-3">
          {KANBAN_COLUMNS.map((col) => (
            <Col md={4} key={col.key}>
              <div className="kanban-column">
                <h6 className="text-uppercase text-muted mb-3">
                  {col.label} <Badge bg="secondary">{board[col.key].length}</Badge>
                </h6>
                <Droppable droppableId={col.key}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '10rem' }}>
                      {board[col.key].map((story, index) => (
                        <Draggable key={story.id} draggableId={story.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <Card
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`mb-2 shadow-sm kanban-card ${dragSnapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <Card.Body className="py-2 px-3">
                                <div className="fw-semibold small">{story.title}</div>
                                {story.storyPoints != null && (
                                  <Badge bg="info" className="mt-1">{story.storyPoints} pts</Badge>
                                )}
                              </Card.Body>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    </div>
  );
}
