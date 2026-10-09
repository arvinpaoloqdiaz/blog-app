import { useState, useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import UserContext from "../../UserContext";
import BackButton from "../../components/BackButton/BackButton";
import TipTapEditor from "../../components/TipTapEditor/TipTapEditor";
import GalleryImagePicker from "../../components/GalleryImagePicker/GalleryImagePicker";
import api from "../../utils/api";
import useCodeCopyButtons from "../../hooks/useCodeCopyButtons";
import styles from "./CreatePost.module.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Arvin Paolo Diaz");
  const [thumbnail, setThumbnail] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [content, setContent] = useState("");
  const [unformattedTags, setUnformattedTags] = useState("");
  const [tags, setTags] = useState([]);
  const [isPortfolio, setIsPortfolio] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const DRAFT_KEY = "blog_create_draft";

  // Add copy buttons to code blocks in preview
  useCodeCopyButtons(content);

  // Enable submit when required fields are filled
  useEffect(() => {
    const emptyContent = content === "" || content === "<p></p>";
    setIsActive(title.trim() !== "" && !emptyContent);
  }, [title, content]);

  // Convert comma-separated tags string → array
  useEffect(() => {
    setTags(
      unformattedTags
        ? unformattedTags.split(",").map((t) => t.trim()).filter(Boolean)
        : []
    );
  }, [unformattedTags]);

  // Restore draft on load
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
          Swal.fire({
            title: "Restore Draft?",
            text: "We found an unsaved draft. Do you want to restore it?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Restore",
            cancelButtonText: "Discard",
            confirmButtonColor: "#7850a0"
          }).then((result) => {
            if (result.isConfirmed) {
              setTitle(parsed.title || "");
              setAuthor(parsed.author || "Arvin Paolo Diaz");
              setThumbnail(parsed.thumbnail || "");
              setCoverPhoto(parsed.coverPhoto || "");
              setContent(parsed.content || "");
              setUnformattedTags(parsed.unformattedTags || "");
              setIsPortfolio(parsed.isPortfolio || false);
            } else {
              localStorage.removeItem(DRAFT_KEY);
            }
          });
        }
      } catch (e) {}
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => {
      const draftData = {
        title, author, thumbnail, coverPhoto, content, unformattedTags, isPortfolio, timestamp: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setAutoSaveStatus(`Saved to browser at ${new Date().toLocaleTimeString()}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [title, author, thumbnail, coverPhoto, content, unformattedTags, isPortfolio]);

  const createPost = async (isDraft = false) => {
    if (isDraft && typeof isDraft !== "boolean") isDraft = false; // protect against event object
    setIsSubmitting(true);
    try {
      const data = await api.post(
        "/v1/blog/posts",
        { title, author, thumbnail, coverPhoto, content, tags, isPortfolio, isDraft },
        true
      );

      if (data.success) {
        localStorage.removeItem(DRAFT_KEY);
        Swal.fire({
          title: isDraft ? "Saved as Draft" : "Post Published!",
          icon: "success",
          text: isDraft ? "Your draft has been saved successfully." : "Your post went live successfully.",
          confirmButtonColor: "#7850a0",
        });
        navigate("/admin/posts");
      } else {
        throw new Error(data.message || "Something went wrong!");
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

  if (!user.isAdmin && !user.id) return <Navigate to="/" />;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <BackButton />
        <div className={styles.headerCenter}>
          <h1 className={styles.pageTitle}>Create Post</h1>
          <p className={styles.pageSubtitle}>Write and preview your post in real time</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.autoSaveStatus}>{autoSaveStatus}</span>
          <button
            className={styles.draftBtn}
            onClick={() => createPost(true)}
            disabled={!isActive || isSubmitting}
            type="button"
          >
            Save as Draft
          </button>
          <button
            className={styles.publishBtn}
            onClick={() => createPost(false)}
            disabled={!isActive || isSubmitting}
            type="button"
          >
            {isSubmitting ? "Publishing…" : "Publish Post"}
          </button>
        </div>
      </div>

      {/* ── Split pane ── */}
      <div className={styles.splitPane}>
        {/* Left — Editor */}
        <form onSubmit={createPost} className={styles.editorPanel}>
          <div className={styles.metaGrid}>
            {/* Title */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="postTitle">Title *</label>
              <input
                id="postTitle"
                className={styles.input}
                type="text"
                placeholder="Your post title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Author */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="postAuthor">Author</label>
              <input
                id="postAuthor"
                className={styles.input}
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="postTags">Tags</label>
              <input
                id="postTags"
                className={styles.input}
                type="text"
                placeholder="JavaScript, React, CSS…"
                value={unformattedTags}
                onChange={(e) => setUnformattedTags(e.target.value)}
              />
            </div>

            {/* Thumbnail */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="postThumb">Thumbnail URL</label>
              <GalleryImagePicker
                id="postThumb"
                value={thumbnail}
                onChange={setThumbnail}
                placeholder="https://… or pick from gallery"
                inputClassName={styles.input}
              />
            </div>

            {/* Cover Photo */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="postCover">Cover Photo URL</label>
              <GalleryImagePicker
                id="postCover"
                value={coverPhoto}
                onChange={setCoverPhoto}
                placeholder="https://… or pick from gallery"
                inputClassName={styles.input}
              />
            </div>

            {/* Is Portfolio Toggle */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.switchLabel}>
                <div className={styles.switchText}>
                  <span className={styles.switchTitle}>Portfolio Item</span>
                  <span className={styles.switchDesc}>Display this post on your portfolio site</span>
                </div>
                <div className={styles.switchControl}>
                  <input 
                    type="checkbox"
                    checked={isPortfolio}
                    onChange={(e) => setIsPortfolio(e.target.checked)}
                    className={styles.switchInput}
                  />
                  <span className={styles.switchSlider}></span>
                </div>
              </label>
            </div>

            {/* Tag chips preview */}
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
              placeholder="Write your post here…"
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
                  {tags.map((t, i) => <span key={i} className={styles.previewChip}>{t}</span>)}
                </div>
              )}
              <h1 className={styles.previewTitle}>{title || "Your title will appear here…"}</h1>
              <p className={styles.previewByline}>
                by <strong>{author}</strong>
              </p>
              <div className={styles.previewDivider} />
            </div>
            <div
              className={`post-container ${styles.previewContent}`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  content || "<p style='color:#bbb'>Your content will appear here as you type…</p>"
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
