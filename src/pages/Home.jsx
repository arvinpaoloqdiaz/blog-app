import { useEffect, useContext, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../UserContext";
import styles from "./Home.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faRocket, faImage, faBookmark, faHourglassHalf, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

const SECTIONS = [
  {
    to: "/writing",
    icon: faFileLines,
    title: "Writing",
    desc: "Every thought, essay, and tutorial — searchable and sorted.",
  },
  {
    to: "/projects",
    icon: faRocket,
    title: "Projects",
    desc: "Things I've built, broken, and shipped for fun.",
  },
  {
    to: "/gallery",
    icon: faImage,
    title: "Gallery",
    desc: "A visual feed of moments, snapshots, and creative work.",
  },
  {
    to: "/bookmarks",
    icon: faBookmark,
    title: "Bookmarks",
    desc: "Interesting links and articles I've saved across the web.",
  },
  {
    to: "/now",
    icon: faHourglassHalf,
    title: "Now",
    desc: "What I'm currently working on, reading, and learning.",
  },
  {
    to: "/uses",
    icon: faScrewdriverWrench,
    title: "Uses",
    desc: "The hardware, software, and tools I use every day.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Home() {
  const { setUser } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle Google OAuth token redirect
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      fetch(`${import.meta.env.VITE_API_URL}/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser({
            id: data.data?._id || null,
            isAdmin: data.data?.isAdmin || false,
            token,
          });
          navigate("/", { replace: true });
        })
        .catch(console.error);
    }
  }, [searchParams, setUser, navigate]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className={styles.heroLabel}>Hey, I'm Arvin</p>
        <h1 className={styles.heroTitle}>
          My <span className={styles.highlight}>Personal Corner</span> of the internet.
        </h1>
        <p className={styles.heroSubtitle}>
          Full-stack developer, aspiring DevOps/Platform Engineer, and perpetual learner.
          This is where I share ideas, projects, and things I find interesting.
        </p>
        <div className={styles.heroCta}>
          <Link to="/writing" className={styles.ctaPrimary}>Read the Blog</Link>
          <Link to="/now" className={styles.ctaSecondary}>What I'm Up To →</Link>
        </div>
      </motion.section>

      {/* Explore Section (Asymmetric / Masonry Layout) */}
      <section className={styles.sections}>
        <h2 className={styles.sectionTitle}>Explore</h2>
        <motion.div
          className={styles.masonryContainer}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {SECTIONS.map((s) => (
            <motion.div key={s.to} variants={itemVariants} className={styles.masonryItem}>
              <Link to={s.to} style={{ textDecoration: 'none' }}>
                <span className={styles.masonryIconBg}><FontAwesomeIcon icon={s.icon} /></span>
                <div className={styles.masonryContent}>
                  <span className={styles.masonryIcon}><FontAwesomeIcon icon={s.icon} /></span>
                  <h3 className={styles.masonryTitle}>{s.title}</h3>
                  <p className={styles.masonryDesc}>{s.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
