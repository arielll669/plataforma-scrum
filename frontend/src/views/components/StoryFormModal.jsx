import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const emptyForm = { title: '', asA: '', iWant: '', soThat: '', acceptanceCriteria: '', storyPoints: '', assignedTo: '' };

function toFormState(story) {
  if (!story) return emptyForm;
  return {
    title: story.title || '',
    asA: story.asA || '',
    iWant: story.iWant || '',
    soThat: story.soThat || '',
    acceptanceCriteria: (story.acceptanceCriteria || []).join('\n'),
    storyPoints: story.storyPoints ?? '',
    assignedTo: story.assignedTo || '',
  };
}

export default function StoryFormModal({ show, onHide, onSubmit, story, members = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) setForm(toFormState(story));
  }, [show, story]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        title: form.title,
        asA: form.asA,
        iWant: form.iWant,
        soThat: form.soThat,
        acceptanceCriteria: form.acceptanceCriteria
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        storyPoints: form.storyPoints === '' ? null : Number(form.storyPoints),
        assignedTo: form.assignedTo || null,
      });
      onHide();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{story ? 'Editar historia de usuario' : 'Nueva historia de usuario'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Título</Form.Label>
            <Form.Control
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Label className="fw-semibold">Formato "Como / Quiero / Para" (RF-03.1)</Form.Label>
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <Form.Control
                placeholder="Como (rol)..."
                value={form.asA}
                onChange={(e) => setForm({ ...form, asA: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <Form.Control
                placeholder="Quiero (acción)..."
                value={form.iWant}
                onChange={(e) => setForm({ ...form, iWant: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <Form.Control
                placeholder="Para (beneficio)..."
                value={form.soThat}
                onChange={(e) => setForm({ ...form, soThat: e.target.value })}
              />
            </div>
          </div>

          <Form.Group className="mb-3" controlId="acceptanceCriteria">
            <Form.Label>Criterios de aceptación (RF-04.2, uno por línea)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.acceptanceCriteria}
              onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })}
            />
          </Form.Group>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group controlId="storyPoints">
                <Form.Label>Estimación (puntos de historia, RF-04.3)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.storyPoints}
                  onChange={(e) => setForm({ ...form, storyPoints: e.target.value })}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group controlId="assignedTo">
                <Form.Label>Asignado a</Form.Label>
                <Form.Select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                >
                  <option value="">Sin asignar</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
