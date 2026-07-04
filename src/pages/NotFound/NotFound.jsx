import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGhost } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={styles.container}>
        <FontAwesomeIcon icon={faGhost} className={styles.icon} />
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.desc}>
          Whoops! It looks like this link is broken or the page has been moved.
        </p>
        <Link to="/" className={styles.homeBtn}>
          Go back home
        </Link>
      </div>
    </motion.div>
  );
}
