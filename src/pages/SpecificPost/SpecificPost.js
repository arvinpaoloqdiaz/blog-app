import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

import UserContext from "../../UserContext";
import useFormattedDate from "../../hooks/useFormattedDate";
import Tags from "../../components/Tags/Tags";
import BackButton from "../../components/BackButton/BackButton";
import DeletePost from "../../components/DeletePost/DeletePost";

import styles from "./SpecificPost.module.css";

export default function SpecificPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch post
  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/v1/blog/posts/${postId}`);
        const data = await res.json();
        setPost(data.data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [postId]);

  const publishDate = useFormattedDate(post?.publishedOn || "");
  const editedDate = useFormattedDate(post?.lastEdit || "");

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (!post) return <p className={styles.error}>Post not found.</p>;

  return (
    <div className={styles.postContainer}>
      <div className="mb-2">
        <BackButton fallback="/" />
      </div>

      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.meta}>
        by <span className={styles.author}>{post.author}</span> ·{" "}
        <span>{publishDate[0]} at {publishDate[1]}</span>
        {post.publishedOn !== post.lastEdit && (
          <span className={styles.editDate}> · Last edit: {editedDate[0]} at {editedDate[1]}</span>
        )}
      </p>

      <div
        className={`post-container ${styles.content}`}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
      />

      {/* Tags */}
      <div className={styles.tagsWrapper}>
        <Tags data={post.tags} maxVisible={post.tags.length} />
      </div>

      {/* Actions */}
      {user?.id && user.isAdmin && (
        <div className={`mt-4 justify-content-end ${styles.actions}`}>
          <Link to={`/${postId}/edit`} className={styles.editBtn}>
            <FontAwesomeIcon icon={faPenToSquare} /> Edit
          </Link>
          <DeletePost postId={postId} onDeleted={() => navigate("/")} />
        </div>
      )}
    </div>
  );
}
