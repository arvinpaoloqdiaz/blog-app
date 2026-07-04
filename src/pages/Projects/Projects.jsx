import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import styles from "./Projects.module.css";

const JSON_URL = "https://raw.githubusercontent.com/arvinpaoloqdiaz/files/json/ProjectList.json";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
  })
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    fetch(JSON_URL)
      .then((r) => r.json())
      .then((data) => {
        const blogProjects = (data.ProjectList || [])
          .filter((p) => p.is_on_blog)
          .map((p) => ({
            ...p,
            id: p.slug,
            image_link: p.image_link?.replace("../images/", `${import.meta.env.VITE_EXTERNAL_LINK}/images/`)
          }));
        setProjects(blogProjects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

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
        <p className={styles.muted}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className={styles.muted}>No projects found.</p>
      ) : (
        <div className={styles.splitLayout}>
          {projects.map((p, i) => (
            <motion.div key={`split-${p.id}`} className={styles.splitItem} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              {p.image_link && (
                <div className={styles.splitImageWrapper}>
                  <img src={p.image_link} alt={p.title} className={styles.splitImg} />
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
    </div>
  );
}
