import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../UserContext";
import styles from "./Bookmarks.module.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Bookmarks() {
  const { user } = useContext(UserContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", description: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchBookmarks = (tag = "") => {
    const url = tag ? `${API_URL}/v1/bookmarks?tag=${encodeURIComponent(tag)}` : `${API_URL}/v1/bookmarks`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        const data = d.data || [];
        setBookmarks(data);
        const tags = [...new Set(data.flatMap((b) => b.tags || []))];
        if (!tag) setAllTags(tags);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookmarks(); }, []);
  useEffect(() => { fetchBookmarks(filterTag); }, [filterTag]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/v1/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", url: "", description: "", tags: "" });
        setShowForm(false);
        fetchBookmarks(filterTag);
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this bookmark?")) return;
    await fetch(`${API_URL}/v1/bookmarks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    fetchBookmarks(filterTag);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Reading List</p>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faBookmark} style={{ marginRight: '12px', color: 'var(--accent1)' }} />
            Bookmarks
          </h1>
          <p className={styles.subtitle}>Interesting links I've saved from across the web.</p>
        </div>
        {user.isAdmin && (
          <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ Add Link"}
          </button>
        )}
      </div>

      {/* Admin Form */}
      {user.isAdmin && showForm && (
        <motion.form className={styles.form} onSubmit={handleCreate} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <input className={styles.input} placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className={styles.input} placeholder="URL *" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          <input className={styles.input} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className={styles.input} placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Bookmark"}</button>
        </motion.form>
      )}

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className={styles.tagFilter}>
          <button
            className={`${styles.filterTag} ${filterTag === "" ? styles.filterTagActive : ""}`}
            onClick={() => setFilterTag("")}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              className={`${styles.filterTag} ${filterTag === t ? styles.filterTagActive : ""}`}
              onClick={() => setFilterTag(t === filterTag ? "" : t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.skeletonList}>
          {[1,2,3,4].map(i => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonMeta} />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <p className={styles.muted}>No bookmarks {filterTag ? `with tag "${filterTag}"` : "yet"}.</p>
      ) : (
        <div className={styles.list}>
          {bookmarks.map((b, i) => (
            <motion.div
              key={b._id}
              className={styles.item}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div className={styles.itemMain}>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className={styles.itemTitle}>
                  {b.title} ↗
                </a>
                <p className={styles.itemUrl}>{b.url}</p>
                {b.description && <p className={styles.itemDesc}>{b.description}</p>}
              </div>
              <div className={styles.itemMeta}>
                {b.tags?.length > 0 && (
                  <div className={styles.tags}>
                    {b.tags.map((t) => (
                      <button key={t} className={styles.tag} onClick={() => setFilterTag(t)}>{t}</button>
                    ))}
                  </div>
                )}
                {user.isAdmin && (
                  <button className={styles.deleteBtn} onClick={() => handleDelete(b._id)}>✕</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
