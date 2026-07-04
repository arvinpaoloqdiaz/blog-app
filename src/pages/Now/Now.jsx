import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faBook, faBrain, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../UserContext";
import styles from "./Now.module.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Now() {
  const { user } = useContext(UserContext);
  const [now, setNow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ content: "", reading: "", learning: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchNow = () => {
    fetch(`${API_URL}/v1/now`)
      .then((r) => r.json())
      .then((d) => {
        const data = d.data;
        setNow(data);
        if (data) {
          setForm({
            content: data.content || "",
            reading: (data.reading || []).join(", "),
            learning: (data.learning || []).join(", "),
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNow(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/v1/now`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setEditing(false); fetchNow(); }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Status Update</p>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '12px', color: 'var(--accent1)' }} />
            Now
          </h1>
          <p className={styles.subtitle}>What I'm currently focused on.</p>
        </div>
        {user.isAdmin && (
          <button className={styles.editBtn} onClick={() => setEditing((v) => !v)}>
            {editing ? "Cancel" : <><FontAwesomeIcon icon={faPenToSquare} /> Update Now</>}
          </button>
        )}
      </div>

      {/* Edit Form */}
      {user.isAdmin && editing && (
        <motion.form className={styles.form} onSubmit={handleSave} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <label className={styles.label}>What are you up to?</label>
          <textarea
            className={styles.textarea}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
            required
            placeholder="Share what you're currently working on..."
          />
          <label className={styles.label}>Reading (comma-separated)</label>
          <input className={styles.input} value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })} placeholder="e.g. Atomic Habits, Deep Work" />
          <label className={styles.label}>Learning (comma-separated)</label>
          <input className={styles.input} value={form.learning} onChange={(e) => setForm({ ...form, learning: e.target.value })} placeholder="e.g. Kubernetes, Rust" />
          <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
        </motion.form>
      )}

      {loading ? (
        <div className={styles.skeletonBlock}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} style={{ width: '75%' }} />
          <div className={styles.skeletonLine} style={{ width: '55%' }} />
        </div>
      ) : !now ? (
        <p className={styles.muted}>Nothing here yet.</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {now.updatedAt && (
            <p className={styles.updatedAt}>Last updated: {formatDate(now.updatedAt)}</p>
          )}

          <div className={styles.content}>
            {now.content}
          </div>

          {now.reading?.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}><FontAwesomeIcon icon={faBook} style={{marginRight: '0.5rem'}} />Reading</h2>
              <ul className={styles.list}>
                {now.reading.map((r, i) => <li key={i} className={styles.listItem}>{r}</li>)}
              </ul>
            </div>
          )}

          {now.learning?.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}><FontAwesomeIcon icon={faBrain} style={{marginRight: '0.5rem'}} />Learning</h2>
              <ul className={styles.list}>
                {now.learning.map((l, i) => <li key={i} className={styles.listItem}>{l}</li>)}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
