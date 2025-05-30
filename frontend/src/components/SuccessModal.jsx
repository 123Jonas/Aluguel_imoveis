import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessModal = ({ show, onHide, message, onConfirm }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center py-4">
        <FaCheckCircle className="text-success mb-3" style={{ fontSize: '3rem' }} />
        <h4 className="mb-3">Sucesso!</h4>
        <p className="mb-4">{message}</p>
        <Button variant="success" onClick={onConfirm}>
          OK
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default SuccessModal; 