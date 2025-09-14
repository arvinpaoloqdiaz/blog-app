import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Badge, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import BackButton from "../../components/BackButton/BackButton";
import api from "../../utils/api";
import styles from "./EditPost.module.css";

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Arvin Paolo Diaz"); // default author
  const [content, setContent] = useState("");
  const [unformattedTags, setUnformattedTags] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  // ✅ Fetch existing post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.get(`/v1/blog/posts/${postId}`);
        if (data.success && data.data) {
          const { title, author, content, tags } = data.data;
          setTitle(title);
          setAuthor(author || "Arvin Paolo Diaz");
          setContent(content);
          setTags(tags || []);
          setUnformattedTags(tags?.join(", ") || "");
        }
      } catch (err) {
        Swal.fire("Error", "Could not fetch post details", "error");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  // ✅ Convert tags
  useEffect(() => {
    if (unformattedTags !== "") {
      setTags(unformattedTags.split(",").map((tag) => tag.trim()));
    } else {
      setTags([]);
    }
  }, [unformattedTags]);

  // ✅ Enable submit when fields are filled
  useEffect(() => {
    setIsActive(title !== "" && content !== "");
  }, [title, content, tags]);

  // ✅ Update post
  const updatePost = async (e) => {
    e.preventDefault();
    try {
      const data = await api.put(
        `/v1/blog/posts/${postId}`,
        { title, author, content, tags },
        true // withAuth
      );

      if (data.success) {
        Swal.fire("Updated!", "Post updated successfully", "success");
        navigate(`/${postId}`);
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong!", "error");
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className={styles.editPostContainer}>
      <BackButton />

      <h1 className={styles.header}>Edit Post</h1>

      <Form onSubmit={updatePost} className={styles.form}>
        {/* Title */}
        <Form.Group controlId="postTitle" className={styles.formGroup}>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        {/* Author */}
        <Form.Group controlId="postAuthor" className={styles.formGroup}>
          <Form.Label>Author</Form.Label>
          <Form.Control
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <Form.Text className="text-muted">
            Default: <strong>Arvin Paolo Diaz</strong>. You can change this if needed.
          </Form.Text>
        </Form.Group>

        {/* Content */}
        <Form.Group controlId="postContent" className={styles.formGroup}>
          <Form.Label>Content</Form.Label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Update your post content..."
            className={styles.richEditor}
          />
        </Form.Group>

        {/* Tags */}
        <Form.Group controlId="postTags" className={styles.formGroup}>
          <Form.Label>Tags</Form.Label>
          <Form.Control
            type="text"
            placeholder="Separate tags with commas (e.g. JavaScript, HTML)"
            value={unformattedTags}
            onChange={(e) => setUnformattedTags(e.target.value)}
          />
          <div className={styles.tagsPreview}>
            {tags.map((tag, idx) => (
              <Badge key={idx} bg="secondary" className={styles.tagChip}>
                {tag}
              </Badge>
            ))}
          </div>
        </Form.Group>

        {/* Submit */}
        <Button
          className={`${styles.submitBtn} btn btn-accent`}
          type="submit"
          disabled={!isActive}
        >
          Update Post
        </Button>
      </Form>
    </Container>
  );
}
