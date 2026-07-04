import { useState } from "react";
import { motion } from "framer-motion";
import BlogPost from "../../components/BlogPost/BlogPost";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styles from "./Archive.module.css";

export default function Archive() {
  const [search, setSearch] = useState("");

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className={styles.eyebrow}>Writing</p>
        <h1 className={styles.title}>Archive</h1>
        <p className={styles.subtitle}>Every post, from first draft to latest thought.</p>

        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <BlogPost searchQuery={search} />
    </div>
  );
}
