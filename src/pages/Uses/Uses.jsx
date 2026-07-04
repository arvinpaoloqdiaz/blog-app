import { motion } from "framer-motion";
import styles from "./Uses.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptopCode,
  faCode,
  faPalette,
  faRocket,
  faMobileScreenButton,
  faWandMagicSparkles,
  faBookOpen,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import usesData from "../../data/uses.json";

// Map icon string keys from JSON → actual FA icon objects
const ICON_MAP = {
  faLaptopCode,
  faCode,
  faPalette,
  faRocket,
  faMobileScreenButton,
  faWandMagicSparkles,
  faBookOpen,
  faScrewdriverWrench,
};

export default function Uses() {
  return (
    <div className={styles.page}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className={styles.eyebrow}>My Setup</p>
        <h1 className={styles.title}>
          <FontAwesomeIcon icon={faScrewdriverWrench} style={{ marginRight: '12px', color: 'var(--accent1)' }} />
          Uses
        </h1>
        <p className={styles.subtitle}>
          Hardware, software, and tools that power my day-to-day work.
        </p>

        <div className={styles.sections}>
          {usesData.map((section, si) => (
            <motion.div
              key={section.title}
              className={styles.section}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1, duration: 0.4 }}
            >
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={ICON_MAP[section.icon] || faScrewdriverWrench} style={{ marginRight: '0.6rem' }} />
                {section.title}
              </h2>
              <div className={styles.items}>
                {section.items.map((item, ii) => (
                  <div key={ii} className={styles.item}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemDesc}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
