import { useState, useEffect, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import UserContext from "../../UserContext";
import styles from "./AdminPosts.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faEye, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function AdminPosts() {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await api.get("/v1/blog/posts/admin", true);
      if (data.success && data.data.results) {
        setPosts(data.data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
      try {
        const data = await api.delete(`/v1/blog/posts/${id}`);
        if (data.success) {
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
          fetchPosts(); // refresh list
        }
      } catch (err) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  if (!user.isAdmin && !user.id) return <Navigate to="/" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Posts</h1>
          <p className={styles.subtitle}>View, edit, or publish your drafts and posts</p>
        </div>
        <Link to="/create" className={styles.createBtn}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
          New Post
        </Link>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p className={styles.loadingMsg}>Loading posts…</p>
        ) : posts.length === 0 ? (
          <p className={styles.emptyMsg}>No posts found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Portfolio</th>
                <th>Last Edited</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} className={post.isDraft ? styles.draftRow : ""}>
                  <td className={styles.titleCol}>
                    <Link to={`/writing/${post._id}/edit`} className={styles.postTitle}>
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    {post.isDraft ? (
                      <span className={styles.badgeDraft}>Draft</span>
                    ) : (
                      <span className={styles.badgePublished}>Published</span>
                    )}
                  </td>
                  <td>
                    {post.isPortfolio ? (
                      <span className={styles.badgePortfolio}>Portfolio</span>
                    ) : (
                      <span className={styles.badgeNone}>-</span>
                    )}
                  </td>
                  <td className={styles.dateCol}>
                    {new Date(post.lastEdit || post.publishedOn).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </td>
                  <td className={styles.actionsCol}>
                    <Link to={`/writing/${post._id}/edit`} className={styles.actionBtn} title="Edit">
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                    {!post.isDraft && (
                      <Link to={`/writing/${post._id}`} className={styles.actionBtn} title="View Live">
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                    )}
                    <button 
                      className={`${styles.actionBtn} ${styles.actionDel}`} 
                      onClick={() => deletePost(post._id)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
