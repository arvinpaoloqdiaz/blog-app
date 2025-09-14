import React from "react";
import { Link } from "react-router-dom";
import styles from "./Tags.module.css";

/**
 * Tags Component
 * @param {Array<string>} data - Array of tags
 * @param {number} maxVisible - Maximum tags to show before summarizing
 */
export default function Tags({ data = [], maxVisible = 5 }) {
  if (!data.length) return null;

  const visibleTags = data.slice(0, maxVisible);
  const remainingCount = data.length - maxVisible;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Tags:</span>
      {visibleTags.map((tag, index) => {
        const tagLink = tag.toLowerCase().replace(" ", "_");
        return (
          <Link key={index} to={`/tags/${tagLink}`} className={styles.tag}>
            {tag}
          </Link>
        );
      })}
      {remainingCount > 0 && (
        <span className={styles.more}>+{remainingCount}</span>
      )}
    </div>
  );
}
