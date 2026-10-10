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

  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [popularTags, setPopularTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/blog/posts`);
        const json = await res.json();
        if (json.success) {
          const allPosts = Array.isArray(json.data) ? json.data : (json.data?.results || []);
          const publicPosts = allPosts.filter(p => !p.isDraft);
          setFeaturedPosts(publicPosts.filter(p => p.isPortfolio).slice(0, 3));
          setLatestPosts(publicPosts.slice(0, 4));
          
          // Extract unique tags
          const tagsArray = publicPosts.flatMap(p => p.tags || []);
          const uniqueTags = [...new Set(tagsArray)].filter(Boolean).slice(0, 12);
          setPopularTags(uniqueTags);
        }
      } catch(e) { console.error(e); }
    };
    
    const fetchImages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/gallery?featured=true`);
        const json = await res.json();
        if (json.success) {
          setFeaturedImages(json.data || []);
        }
      } catch(e) { console.error(e); }
    };

    fetchPosts();
    fetchImages();
  }, []);

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

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className={styles.homeSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Posts</h2>
          </div>
          <div className={styles.featuredPostsGrid}>
            {featuredPosts.map(post => {
              const hasImage = post.coverPhoto || post.thumbnail;
              return (
                <Link to={`/writing/${post._id}`} key={post._id} className={`${styles.featuredPostCard} ${!hasImage ? styles.featuredPostCardNoImage : ''}`}>
                  {hasImage && (
                    <div className={styles.featuredPostImageWrapper}>
                      <img src={post.coverPhoto || post.thumbnail} alt={post.title} className={styles.featuredPostImage} />
                    </div>
                  )}
                  <div className={styles.featuredPostContent}>
                    <h3 className={styles.featuredPostTitle}>{post.title}</h3>
                    {!hasImage && post.content && (
                      <p className={styles.featuredPostExcerpt}>
                        {new DOMParser().parseFromString(post.content, 'text/html').body.textContent.substring(0, 120)}...
                      </p>
                    )}
                    <div className={styles.featuredPostTags}>
                      {(post.tags || []).slice(0,3).map(tag => (
                        <span key={tag} className={styles.postTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className={styles.homeSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Latest Thoughts</h2>
            <Link to="/writing" className={styles.viewAllLink}>View All &rarr;</Link>
          </div>
          <div className={styles.latestPostsList}>
            {latestPosts.map(post => (
              <Link to={`/writing/${post._id}`} key={post._id} className={styles.latestPostRow}>
                <span className={styles.latestPostDate}>
                  {new Date(post.publishedOn).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}
                </span>
                <span className={styles.latestPostTitle}>{post.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Topics / Tags */}
      {popularTags.length > 0 && (
        <section className={styles.homeSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Topics</h2>
          </div>
          <div className={styles.tagsCloudGrid}>
            {popularTags.map(tag => (
              <Link to={`/writing?tag=${tag}`} key={tag} className={styles.cloudTag}>
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Visuals Marquee */}
      {featuredImages.length > 0 && (
        <section className={`${styles.homeSection} ${styles.marqueeSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Visuals</h2>
            <Link to="/gallery" className={styles.viewAllLink}>View Gallery &rarr;</Link>
          </div>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              {[...featuredImages, ...featuredImages, ...featuredImages].map((img, i) => (
                <div key={`${img._id}-${i}`} className={styles.marqueeItem}>
                  <img src={img.imageUrl} alt={img.caption || 'Gallery Image'} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
