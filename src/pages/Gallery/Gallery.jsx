import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faHammer } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import styles from "./Gallery.module.css";

export default function Gallery() {
  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Visual Journal</p>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faImage} style={{ marginRight: '12px', color: 'var(--accent1)' }} />
            Gallery
          </h1>
          <p className={styles.subtitle}>Moments, snapshots, and things I want to remember.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--text-muted)' }}>
        <FontAwesomeIcon icon={faHammer} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'var(--text-main)' }}>Coming Soon</h2>
        <p style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>I'm currently working on curating and building this section.<br/>Check back in the next update!</p>
      </div>
    </motion.div>
  );
}
