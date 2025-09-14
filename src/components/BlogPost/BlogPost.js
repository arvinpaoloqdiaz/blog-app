import { Pagination } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SinglePost from "../SinglePost/SinglePost";
import styles from "./BlogPost.module.css";

export default function BlogPost() {
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
        `${process.env.REACT_APP_API_URL}/v1/blog/posts?page=${page}&limit=${postsPerPage}`
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

  return (
    <div className={styles.blogContainer}>
      {loading && <p>Loading posts...</p>}

      <AnimatePresence mode="wait">
        {!loading &&
          blogPosts.map((post) => (
            <motion.div
              key={post._id}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={postVariants}
              transition={{ duration: 0.4 }}
            >
              <SinglePost data={post} />
            </motion.div>
          ))}
      </AnimatePresence>

      <div className={styles.paginationContainer}>
        <Pagination>{paginationItems}</Pagination>
      </div>
    </div>
  );
}
