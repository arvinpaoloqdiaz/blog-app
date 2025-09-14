import { useState, useContext, useEffect } from "react";
import { Form, Button, Container, Badge } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import UserContext from "../../UserContext";
import BackButton from "../../components/BackButton/BackButton";
import api from "../../utils/api";
import styles from "./CreatePost.module.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Arvin Paolo Diaz"); // ✅ Default author
  const [content, setContent] = useState(""); // Rich text editor
  const [unformattedTags, setUnformattedTags] = useState("");
  const [tags, setTags] = useState([]);
  const [isActive, setIsActive] = useState(false);

  // ✅ Auto-activate submit button when form is filled
  useEffect(() => {
    setIsActive(title !== "" && content !== "");
  }, [title, content, tags]);

  // ✅ Convert tags
  useEffect(() => {
    if (unformattedTags !== "") {
      setTags(unformattedTags.split(",").map((tag) => tag.trim()));
    } else {
      setTags([]);
    }
  }, [unformattedTags]);

  const createPost = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post(
        "/v1/blog/posts",
        { title, author, content, tags },
        true // withAuth
      );

      if (data.success) {
        Swal.fire({
          title: "Post Created!",
          icon: "success",
          text: "Your post was published successfully!",
        });
        navigate("/");
      } else {
        throw new Error(data.message || "Something went wrong!");
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: err.message || "Something went wrong!",
      });
    }
  };

  if (!user.isAdmin) return <Navigate to="/" />;

  return (
    <Container className={styles.createPostContainer}>
      <BackButton />

      <h1 className={styles.header}>Create Post</h1>

      <Form onSubmit={createPost} className={styles.form}>
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
            placeholder="Write your post here..."
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
          Submit
        </Button>
      </Form>
    </Container>
  );
}
