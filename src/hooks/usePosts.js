import { useState, useEffect } from "react";

export default function usePosts(page = 1, limit = 5) {
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (pageNum = page) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/v1/blog/posts?page=${pageNum}&limit=${limit}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setPosts(data.data.results || []);
        const total = data.data.totalDocs || 0;
        setTotalPages(Math.ceil(total / limit));
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  return { posts, totalPages, fetchPosts, loading };
}
