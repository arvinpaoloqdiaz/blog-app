import { Link } from "react-router-dom";
import { useContext } from "react";
import Tags from "../Tags/Tags";
import styles from "./SinglePost.module.css";
import useFormattedDate from "../../hooks/useFormattedDate";
import UserContext from "../../UserContext";
import DeletePost from "../DeletePost/DeletePost"; // ✅ Import reusable DeletePost
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function SinglePost({ data, onDeleted }) {
  const publishDate = useFormattedDate(data.publishedOn);
  const editedDate = useFormattedDate(data.lastEdit);
  const { user } = useContext(UserContext);

  const isAuthorized =
    user?.isAdmin || (user?.id && user.id === data.authorId);

  return (
    <div className={styles.singlePostCard}>
      <div className="d-flex justify-content-between flex-column flex-md-row gap-2 gap-md-0 text-start">
        <div>
          <h2 className={styles.title}>
            <Link to={`/${data._id}`} className={styles.titleLink}>
              {data.title}
            </Link>
          </h2>
          <div className={styles.author}>by {data.author}</div>
        </div>

        <div className={`d-flex flex-column w-50 text-start text-md-end ${styles.dates}`}>
          <span>
            Published: {publishDate[0]} at {publishDate[1]}
          </span>
          {editedDate.join(" ") !== publishDate.join(" ") && (
            <span>
              Last Edit: {editedDate[0]} at {editedDate[1]}
            </span>
          )}
        </div>
      </div>

      <div className={styles.tagsWrapper}>
        <Tags data={data.tags} maxVisible={3} />
      </div>

      {isAuthorized && (
        <div className={styles.actions}>
          <Link to={`/${data._id}/edit`} className={styles.actionLink}>
            <FontAwesomeIcon icon={faPenToSquare} /> Edit
          </Link>
          <DeletePost postId={data._id} onDeleted={onDeleted} />
        </div>
      )}
    </div>
  );
}
