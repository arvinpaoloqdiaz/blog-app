import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "./BackButton.module.css";

export default function BackButton({ fallback = "/" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if a 'from' query param exists to go back to a specific page
    const params = new URLSearchParams(location.search);
    const from = params.get("from");

    if (from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button className={styles.backBtn} onClick={handleBack}>
      <FontAwesomeIcon icon={faArrowLeft} /> Back
    </button>
  );
}
