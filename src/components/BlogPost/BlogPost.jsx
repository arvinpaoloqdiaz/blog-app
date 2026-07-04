import { Pagination } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SinglePost from "../SinglePost/SinglePost";
import styles from "./BlogPost.module.css";

function PostListSkeleton() {
  return (
    <div className={styles.skeletonList}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonDate} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonTags}>
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTag} style={{ width: '48px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogPost({ searchQuery = "" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogPosts, setBlogPosts] = useState([]);
  const [paginationItems, setPaginationItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const postsPerPage = 5;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/v1/blog/posts?page=${page}&limit=${postsPerPage}`
      );
      const data = await res.json();
      if (!data.data || !data.data.results) return;

      setBlogPosts(data.data.results);
      setupPagination(Math.ceil(data.data.totalDocs / postsPerPage), page);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const setupPagination = (totalPages, page) => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => setSearchParams({ page: i })}
        >
          {i}
        </Pagination.Item>
      );
    }
    setPaginationItems(items);
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const postVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const filteredPosts = searchQuery
    ? blogPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : blogPosts;

  return (
    <div className={styles.blogContainer}>
      {loading && <PostListSkeleton />}

      <AnimatePresence mode="wait">
        {!loading &&
          filteredPosts.map((post) => (
            <motion.div
              key={post._id}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={postVariants}
              transition={{ duration: 0.4 }}
            >
              <Link to={`/writing/${post._id}`}>
                <SinglePost data={post} />
              </Link>
            </motion.div>
          ))}
      </AnimatePresence>

      <div className={styles.paginationContainer}>
        <Pagination>{paginationItems}</Pagination>
      </div>
    </div>
  );
}
