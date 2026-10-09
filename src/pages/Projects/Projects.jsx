import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faTimes, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styles from "./Projects.module.css";
import { supabase } from "../../lib/supabase";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
  })
};

const SKELETON_COUNT = 3;

function ProjectSkeleton({ reverse }) {
  return (
    <div className={`${styles.splitItem} ${reverse ? styles.splitItemReverse : ""}`} style={{ pointerEvents: "none" }}>
      <div className={styles.splitImageWrapper}>
        <div className={styles.skeletonImg} />
      </div>
      <div className={styles.splitContent}>
        <div className={styles.splitHeader}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonLinks} />
        </div>
        <div className={styles.skeletonTags}>
          <div className={styles.skeletonTag} />
          <div className={styles.skeletonTag} style={{ width: "70px" }} />
          <div className={styles.skeletonTag} style={{ width: "55px" }} />
        </div>
        <div className={styles.skeletonDesc}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} style={{ width: "90%" }} />
          <div className={styles.skeletonLine} style={{ width: "75%" }} />
          <div className={styles.skeletonLine} style={{ width: "82%" }} />
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomedImg, setZoomedImg] = useState(null); // { src, alt }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_on_blog", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects((data ?? []).map((p) => ({ ...p, id: p.slug })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // Close modal on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setZoomedImg(null);
  }, []);
  useEffect(() => {
    if (zoomedImg) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [zoomedImg, handleKeyDown]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Personal Work</p>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faRocket} style={{ marginRight: '12px', color: 'var(--accent1)' }} />
            Projects
          </h1>
          <p className={styles.subtitle}>Things I've built for fun, learning, and because I had to.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.splitLayout}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProjectSkeleton key={i} reverse={i % 2 !== 0} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className={styles.muted}>No projects found.</p>
      ) : (
        <div className={styles.splitLayout}>
          {projects.map((p, i) => (
            <motion.div key={`split-${p.id}`} className={styles.splitItem} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              {p.image_link && (
                <div className={styles.splitImageWrapper}>
                  <img
                    src={p.image_link}
                    alt={p.title}
                    className={`${styles.splitImg} ${styles.zoomable}`}
                    onClick={() => setZoomedImg({ src: p.image_link, alt: p.title })}
                    title="Click to zoom"
                  />
                  <div className={styles.zoomHint}><FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '5px' }} />Click to zoom</div>
                </div>
              )}
              <div className={styles.splitContent}>
                <div className={styles.splitHeader}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <div className={styles.cardLinks}>
                    {p.button_link && <a href={p.button_link} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>Live ↗</a>}
                    {p.repo_link && <a href={p.repo_link} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>Repo ↗</a>}
                  </div>
                </div>

                {p.technologies?.length > 0 && (
                  <div className={styles.tags}>
                    {p.technologies.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                )}

                <div className={styles.descWrapper}>
                  <p className={styles.cardDesc}>{p.description}</p>
                  <div className={styles.fadeOverlay} />
                  <a href={`${import.meta.env.VITE_EXTERNAL_LINK}/project/${p.slug}`} target="_blank" rel="noopener noreferrer" className={styles.readMoreHover}>
                    Read more about this on my portfolio ↗
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImg && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setZoomedImg(null)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.modalClose}
                onClick={() => setZoomedImg(null)}
                aria-label="Close image preview"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <img src={zoomedImg.src} alt={zoomedImg.alt} className={styles.modalImg} />
              <p className={styles.modalCaption}>{zoomedImg.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
