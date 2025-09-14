import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import api from "../../utils/api";
import styles from "./DeletePost.module.css";

export default function DeletePost({ postId, onDeleted }) {
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleDelete = async () => {
    try {
      const data = await api.delete(`/v1/blog/posts/${postId}`, true); // withAuth = true
      if (data.success) {
        Swal.fire({
          title: "Deleted!",
          icon: "success",
          text: "The post was successfully deleted.",
        });
        handleClose();
        if (onDeleted) onDeleted(); // callback to parent
      } else {
        throw new Error(data.message || "Delete failed");
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: err.message || "Something went wrong!",
      });
    }
  };

  return (
    <>
      <Button
        variant="danger"
        className={styles.deleteBtn}
        onClick={handleShow}
      >
        <FontAwesomeIcon icon={faTrash} /> Delete
      </Button>

      <Modal show={show} onHide={handleClose} centered className={styles.modal}>
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
