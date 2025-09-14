import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SinglePost from "../../components/SinglePost/SinglePost";
import BackButton from "../../components/BackButton/BackButton";
import styles from "./TagResults.module.css";

export default function TagResults() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);

  const pascalCase = (input) => {
    if (["HTML", "CSS"].includes(input.toUpperCase())) {
      return input.toUpperCase();
    }
    return input
      .split("_")
      .map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1))
      .join(" ");
  };

const getResults = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/v1/blog/posts/tags/${tag}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      setPosts(data.data);
    } else {
      setPosts([]); // fallback if no posts
    }
  } catch (err) {
    console.error("Error fetching tag results:", err);
    setPosts([]);
  }
};


  useEffect(() => {
    getResults();
  }, [tag]);

  return (
    <div className={styles.resultsContainer}>
      <h1 className={styles.title}>
        Viewing posts with tag:{" "}
        <span className={styles.tag}>{pascalCase(tag)}</span>
      </h1>

      <BackButton fallback="/" />

      <div className={styles.postsWrapper}>
        {posts.length === 0 ? (
          <p className={styles.noPosts}>No posts found for this tag.</p>
        ) : (
          posts.map((post) => (
            <SinglePost data={post} key={post._id} getPosts={getResults} />
          ))
        )}
      </div>
    </div>
  );
}
