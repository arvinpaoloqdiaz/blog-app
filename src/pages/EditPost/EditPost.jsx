import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import BackButton from "../../components/BackButton/BackButton";
import TipTapEditor from "../../components/TipTapEditor/TipTapEditor";
import api from "../../utils/api";
import useCodeCopyButtons from "../../hooks/useCodeCopyButtons";
import styles from "./EditPost.module.css";

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Arvin Paolo Diaz");
  const [thumbnail, setThumbnail] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [content, setContent] = useState("");
  const [unformattedTags, setUnformattedTags] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useCodeCopyButtons(content);

  // ── Fetch existing post ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.get(`/v1/blog/posts/${postId}`);
        if (data.success && data.data) {
          const { title, author, thumbnail, coverPhoto, content, tags } = data.data;
          setTitle(title);
          setAuthor(author || "Arvin Paolo Diaz");
          setThumbnail(thumbnail || "");
          setCoverPhoto(coverPhoto || "");
          setContent(content || "");
          setTags(tags || []);
          setUnformattedTags(tags?.join(", ") || "");
        }
      } catch (err) {
        Swal.fire("Error", "Could not fetch post details.", "error");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, navigate]);

  // ── Convert tags string → array ─────────────────────────────────────────
  useEffect(() => {
    setTags(
      unformattedTags
        ? unformattedTags.split(",").map((t) => t.trim()).filter(Boolean)
        : []
    );
  }, [unformattedTags]);

  // ── Activate submit ──────────────────────────────────────────────────────
  useEffect(() => {
    const emptyContent = content === "" || content === "<p></p>";
    setIsActive(title.trim() !== "" && !emptyContent);
  }, [title, content]);

  // ── Save / update ────────────────────────────────────────────────────────
  const updatePost = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await api.put(
        `/v1/blog/posts/${postId}`,
        { title, author, thumbnail, coverPhoto, content, tags },
        true
      );

      if (data.success) {
        Swal.fire({
          title: "Saved!",
          icon: "success",
          text: "Post updated successfully.",
          confirmButtonColor: "#7850a0",
        });
        navigate(`/writing/${postId}`);
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: err.message || "Something went wrong!",
        confirmButtonColor: "#7850a0",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <BackButton />
          <div className={styles.headerCenter}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSub} />
          </div>
          <div className={styles.skeletonBtn} />
        </div>
        <div className={styles.skeletonBody}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonLine} style={{ width: `${85 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <BackButton />
        <div className={styles.headerCenter}>
          <h1 className={styles.pageTitle}>Edit Post</h1>
          <p className={styles.pageSubtitle}>Update your post and preview changes live</p>
        </div>
        <button
          className={styles.saveBtn}
          onClick={updatePost}
          disabled={!isActive || isSubmitting}
          type="button"
        >
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── Split pane ── */}
      <div className={styles.splitPane}>
        {/* Left — Editor */}
        <form onSubmit={updatePost} className={styles.editorPanel}>
          <div className={styles.metaGrid}>
            {/* Title */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="editTitle">Title *</label>
              <input
                id="editTitle"
                className={styles.input}
                type="text"
                placeholder="Post title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Author */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="editAuthor">Author</label>
              <input
                id="editAuthor"
                className={styles.input}
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="editTags">Tags</label>
              <input
                id="editTags"
                className={styles.input}
                type="text"
                placeholder="JavaScript, React…"
                value={unformattedTags}
                onChange={(e) => setUnformattedTags(e.target.value)}
              />
            </div>

            {/* Thumbnail */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="editThumb">Thumbnail URL</label>
              <input
                id="editThumb"
                className={styles.input}
                type="url"
                placeholder="https://…"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            {/* Cover Photo */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="editCover">Cover Photo URL</label>
              <input
                id="editCover"
                className={styles.input}
                type="url"
                placeholder="https://…"
                value={coverPhoto}
                onChange={(e) => setCoverPhoto(e.target.value)}
              />
            </div>

            {/* Tag chips */}
            {tags.length > 0 && (
              <div className={`${styles.tagChips} ${styles.fullWidth}`}>
                {tags.map((tag, i) => (
                  <span key={i} className={styles.chip}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Rich text editor */}
          <div className={styles.editorArea}>
            <label className={styles.label}>Content *</label>
            <TipTapEditor
              value={content}
              onChange={setContent}
              placeholder="Edit your post content…"
            />
          </div>
        </form>

        {/* Right — Live Preview */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <span className={styles.previewBadge}>Live Preview</span>
          </div>
          <div className={styles.previewScroll}>
            {coverPhoto && (
              <img src={coverPhoto} alt="Cover" className={styles.previewCover} />
            )}
            <div className={styles.previewMeta}>
              {tags.length > 0 && (
                <div className={styles.previewTags}>
                  {tags.map((t, i) => (
                    <span key={i} className={styles.previewChip}>{t}</span>
                  ))}
                </div>
              )}
              <h1 className={styles.previewTitle}>{title || "Your title…"}</h1>
              <p className={styles.previewByline}>
                by <strong>{author}</strong>
              </p>
              <div className={styles.previewDivider} />
            </div>
            <div
              className={`post-container ${styles.previewContent}`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  content || "<p style='color:#bbb'>Content preview will appear here…</p>"
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
