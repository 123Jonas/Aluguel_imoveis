import { Modal, Button } from 'react-bootstrap';

const DeleteUserModal = ({ show, onHide, onConfirm, userName }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Exclusão</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.</p>
        {userName && <p className="text-danger">Você está prestes a excluir a conta de: <strong>{userName}</strong></p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirmar Exclusão
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteUserModal; 