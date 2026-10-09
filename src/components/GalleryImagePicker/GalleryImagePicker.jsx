import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages, faTimes, faCheck, faLink } from "@fortawesome/free-solid-svg-icons";
import styles from "./GalleryImagePicker.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Cloudinary thumbnail transform
function thumb(url) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/w_120,h_120,c_fill,q_auto/");
}

/**
 * GalleryImagePicker
 *
 * A drop-in replacement for a plain URL input that also lets the user
 * pick an image from the stored gallery via a floating dropdown panel.
 *
 * Props:
 *   id        – input id (for the <label htmlFor> link)
 *   value     – current URL string (controlled)
 *   onChange  – (url: string) => void
 *   placeholder – optional placeholder text
 *   inputClassName – optional extra class for the text input
 */
export default function GalleryImagePicker({
  id,
  value,
  onChange,
  placeholder = "https://…",
  inputClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch gallery when dropdown opens
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/v1/gallery`);
        const data = await res.json();
        if (data.success) {
          setImages(data.data);
        } else {
          setError("Failed to load gallery.");
        }
      } catch {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  // When the picker opens, pre-select whatever matches current value
  useEffect(() => {
    if (open && value && images.length > 0) {
      const match = images.find((img) => img.imageUrl === value);
      if (match) setSelected(match);
    }
  }, [open, images, value]);

  const handleConfirm = () => {
    if (selected) {
      onChange(selected.imageUrl);
    }
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* ── URL text input + gallery toggle button ── */}
      <div className={styles.inputRow}>
        <input
          id={id}
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${styles.urlInput} ${inputClassName}`}
        />
        <button
          type="button"
          className={`${styles.galleryToggle} ${open ? styles.galleryToggleActive : ""}`}
          onClick={() => setOpen((v) => !v)}
          title="Pick from gallery"
        >
          <FontAwesomeIcon icon={faImages} />
          <span className={styles.toggleLabel}>Gallery</span>
        </button>
      </div>

      {/* ── Inline preview of current URL ── */}
      {value && !open && (
        <div className={styles.currentPreview}>
          <img
            src={thumb(value)}
            alt="current"
            className={styles.currentThumb}
            onError={(e) => (e.target.style.display = "none")}
          />
          <span className={styles.currentUrl}>
            <FontAwesomeIcon icon={faLink} style={{ marginRight: 5, opacity: 0.5 }} />
            {value.length > 55 ? value.slice(0, 55) + "…" : value}
          </span>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onChange("")}
            title="Clear URL"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* ── Dropdown panel ── */}
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>
              <FontAwesomeIcon icon={faImages} style={{ marginRight: 7 }} />
              Pick from Gallery
            </span>
            <button
              type="button"
              className={styles.dropdownClose}
              onClick={() => setOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.dropdownBody}>
            {loading && <div className={styles.statusMsg}>Loading images…</div>}
            {error && <div className={styles.errorMsg}>{error}</div>}
            {!loading && !error && images.length === 0 && (
              <div className={styles.statusMsg}>No images in gallery yet.</div>
            )}

            <div className={styles.grid}>
              {images.map((img) => (
                <button
                  key={img._id}
                  type="button"
                  className={`${styles.thumbBtn} ${
                    selected?._id === img._id ? styles.thumbSelected : ""
                  }`}
                  onClick={() => setSelected(img)}
                  title={img.caption || img.altText || img.imageUrl}
                >
                  <img
                    src={thumb(img.imageUrl)}
                    alt={img.altText || img.caption || "gallery"}
                    className={styles.thumbImg}
                  />
                  {selected?._id === img._id && (
                    <div className={styles.thumbCheck}>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                  {img.caption && (
                    <div className={styles.thumbCaption}>{img.caption}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.dropdownFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={!selected}
            >
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
              Use Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
