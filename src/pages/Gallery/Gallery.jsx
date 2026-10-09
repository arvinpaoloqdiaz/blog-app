import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes, faCamera } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "react-bootstrap";
import styles from "./Gallery.module.css";
import UserContext from "../../UserContext";
import GalleryAdmin from "../../components/GalleryAdmin";

export default function Gallery() {
  const { user } = useContext(UserContext);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    // Only fetch public gallery if not admin, or fetch it anyway so non-admins see it
    if (!user?.isAdmin) {
      fetchGallery(1);
    }
  }, [user]);

  const fetchGallery = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/v1/gallery?public=true&page=${pageNum}&limit=12`);
      const data = await res.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setImages(data.data);
        } else {
          setImages(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Error fetching gallery", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Helper to transform cloudinary url for optimized bento grid (auto quality, width)
  const getOptimizedUrl = (url) => {
    if (!url || !url.includes('/upload/')) return url;
    if (url.includes('q_auto')) return url;
    return url.replace('/upload/', '/upload/q_auto,w_800/');
  };

  // Helper to get high-res url for lightbox
  const getHighResUrl = (url) => {
    if (!url || !url.includes('/upload/')) return url;
    if (url.includes('q_auto')) return url;
    return url.replace('/upload/', '/upload/q_auto,w_1600/');
  };

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Visual Journal</p>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faImage} style={{ marginRight: '12px', color: 'var(--accent1)' }} />
            Gallery
          </h1>
          <p className={styles.subtitle}>Moments, snapshots, and things I want to remember.</p>
        </div>
      </div>

      {user?.isAdmin ? (
        <GalleryAdmin />
      ) : (
        <>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" style={{ color: 'var(--accent1)' }} />
            </div>
          ) : images.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faCamera} className={styles.emptyIcon} />
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'var(--text-main)' }}>No Photos Yet</h2>
              <p style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>The gallery is currently empty.<br/>Check back later for new memories!</p>
            </div>
          ) : (
            <>
              <div className={styles.bentoGrid}>
                {images.map((img, index) => {
                  // Map layout_zone to CSS module class
                  const zoneClassMap = {
                    hero:      styles.zoneHero,
                    tall:      styles.zoneTall,
                    wide:      styles.zoneWide,
                    square:    styles.zoneSquare,
                    small:     styles.zoneSmall,
                    half:      styles.zoneHalf,
                    half_tall: styles.zoneHalfTall,
                    full:      styles.zoneFull,
                    full_tall: styles.zoneFullTall,
                  };
                  const zoneClass = zoneClassMap[img.layout_zone] ?? styles.zoneSquare;

                  return (
                    <motion.div
                      key={img._id}
                      className={`${styles.bentoItem} ${zoneClass}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setLightboxImage(img)}
                    >
                      <img
                        src={getOptimizedUrl(img.imageUrl)}
                        alt={img.altText || img.caption || 'Gallery Image'}
                        className={styles.bentoImg}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {page < totalPages && (
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => fetchGallery(page + 1)}
                  disabled={loadingMore}
                >
                  {loadingMore ? <Spinner size="sm" animation="border" /> : 'Load More'}
                </button>
              )}
            </>
          )}

          {/* Lightbox Modal */}
          <AnimatePresence>
            {lightboxImage && (
              <motion.div 
                className={styles.lightbox}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxImage(null)}
              >
                <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                  <button className={styles.lightboxClose} onClick={() => setLightboxImage(null)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <img
                    src={getHighResUrl(lightboxImage.imageUrl)}
                    alt={lightboxImage.altText || lightboxImage.caption || 'Expanded'}
                    className={styles.lightboxImg}
                  />
                  {lightboxImage.caption && (
                    <p className={styles.lightboxCaption}>{lightboxImage.caption}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
