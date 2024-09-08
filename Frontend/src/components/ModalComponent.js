import { Modal, Button } from 'reactstrap';
import { useState } from 'react';

const ModalComponent = ({ show, handleClose }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Modal Title</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p></p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
      <Button variant="primary">Save Changes</Button>
    </Modal.Footer>
  </Modal>
);

export default ModalComponent;
