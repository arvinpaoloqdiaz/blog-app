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
import api from "../../utils/api";
import useCodeCopyButtons from "../../hooks/useCodeCopyButtons";
import styles from "./SpecificPost.module.css";

// ── Loading skeleton ─────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className={styles.skeletonWrapper}>
      <div className={styles.skeletonHero} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonMeta} />
        <div className={styles.skeletonMeta} style={{ width: "30%" }} />
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[100, 95, 88, 92, 60].map((w, i) => (
            <div key={i} className={styles.skeletonLine} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────
function PostError({ message }) {
  const navigate = useNavigate();
  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorIcon}>✦</div>
      <h2 className={styles.errorTitle}>Post Not Found</h2>
      <p className={styles.errorMsg}>{message || "This post doesn't exist or has been removed."}</p>
      <button className={styles.errorBtn} onClick={() => navigate("/")}>Go Home</button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SpecificPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useCodeCopyButtons(post?.content);

  useEffect(() => {
    const getPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/v1/blog/posts/${postId}`);
        if (data.success && data.data) {
          setPost(data.data);
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load post.");
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [postId]);

  const publishDate = useFormattedDate(post?.publishedOn || "");
  const editedDate = useFormattedDate(post?.lastEdit || "");

  if (loading) return <PostSkeleton />;
  if (error || !post) return <PostError message={error} />;

  const wasEdited = post.publishedOn !== post.lastEdit;

  return (
    <article className={styles.article}>
      {/* ── Hero image & Back navigation ── */}
      {post.coverPhoto ? (
        <div className={styles.heroWrapper}>
          <img src={post.coverPhoto} alt={post.title} className={styles.heroImg} />
          <div className={styles.heroOverlay} />
          <div className={`${styles.backRow} ${styles.backRowOverlay}`}>
            <BackButton fallback="/writing" />
            {user?.id && (
              <div className={styles.adminActions}>
                <Link to={`/writing/${postId}/edit`} className={styles.editBtn}>
                  <FontAwesomeIcon icon={faPenToSquare} /> Edit
                </Link>
                <DeletePost postId={postId} onDeleted={() => navigate("/")} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.backRow}>
          <BackButton fallback="/writing" />
          {user?.id && (
            <div className={styles.adminActions}>
              <Link to={`/writing/${postId}/edit`} className={styles.editBtn}>
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </Link>
              <DeletePost postId={postId} onDeleted={() => navigate("/")} />
            </div>
          )}
        </div>
      )}

      {/* ── Content column ── */}
      <div className={styles.contentColumn}>
        {/* Header */}
        <header className={styles.header}>
          {post.tags?.length > 0 && (
            <div className={styles.tagsRow}>
              <Tags data={post.tags} maxVisible={post.tags.length} />
            </div>
          )}

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            <span className={styles.author}>by {post.author}</span>
          </div>

          <div className={styles.divider} />
        </header>

        {/* Body */}
        <div
          className={`post-container ${styles.body}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerDivider} />
          <div className={styles.meta} style={{ marginBottom: 0 }}>
            <time className={styles.date}>
              Published {publishDate[0]}
            </time>
            {wasEdited && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.edited}>
                  Updated {editedDate[0]}
                </span>
              </>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
}
