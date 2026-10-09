import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Spinner, Alert, Row, Col, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUpload, faLink, faCheck, faImage, faTimes, faQuestionCircle, faSync, faEdit } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import UserContext from '../UserContext';
import styles from './GalleryAdmin.module.css';

// --- Helpers ---
function formatBytes(bytes) {
  if (bytes == null) return 'N/A';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function MiniMeter({ label, usedPercent, usedLabel, limitLabel }) {
  const pct = Math.min(usedPercent ?? 0, 100);
  const danger = pct >= 85;
  const warn   = pct >= 60;
  const barColor = danger ? '#e74c3c' : warn ? '#d68910' : 'var(--accent1)';
  return (
    <div className={styles.miniMeter}>
      <div className={styles.miniMeterTop}>
        <span className={styles.miniMeterLabel}>{label}</span>
        <span className={styles.miniMeterValues}>
          <span style={{ color: danger ? '#e74c3c' : warn ? '#d68910' : 'var(--text-main)', fontWeight: 600 }}>{usedLabel}</span>
          {limitLabel && <span className={styles.miniMeterLimit}> / {limitLabel}</span>}
          {usedPercent != null && (
            <span
              className={styles.miniMeterPct}
              style={{ color: danger ? '#e74c3c' : warn ? '#d68910' : 'var(--text-muted)' }}
            >
              {pct}%
            </span>
          )}
        </span>
      </div>
      <div className={styles.miniTrack}>
        <div className={styles.miniBar} style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}

export default function GalleryAdmin() {
  const { user } = useContext(UserContext);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Usage dashboard state
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editIsOnGallery, setEditIsOnGallery] = useState(false);
  const [editRows, setEditRows] = useState(1);
  const [editCols, setEditCols] = useState(1);
  const [savingEdit, setSavingEdit] = useState(false);

  // Cloudinary transform helper
  const getTransformedUrl = (url) => {
    if (!url || !url.includes('/upload/')) return url;
    if (url.includes('q_auto,w_auto')) return url;
    return url.replace('/upload/', '/upload/q_auto,w_auto/');
  };

  // Form states
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [isOnGallery, setIsOnGallery] = useState(false);
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(1);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/v1/gallery`);
      const data = await res.json();
      if (data.success) {
        setImages(data.data);
      } else {
        setError(data.message || 'Failed to fetch images');
      }
    } catch (err) {
      setError('An error occurred while fetching images.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      setUsageLoading(true);
      setUsageError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/v1/gallery/usage`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsage(data.data);
      } else {
        setUsageError(data.message || 'Failed to load usage');
      }
    } catch {
      setUsageError('Could not connect to usage API.');
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchUsage();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      formData.append('altText', altText);
      formData.append('is_on_gallery', isOnGallery);
      formData.append('rows_and_columns', JSON.stringify([parseInt(rows), parseInt(cols)]));

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/v1/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setFile(null);
        setCaption('');
        setAltText('');
        setIsOnGallery(false);
        setRows(1);
        setCols(1);
        
        const fileInput = document.getElementById('imageFile');
        if (fileInput) fileInput.value = '';
        
        fetchImages();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/v1/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setImages(images.filter(img => img._id !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting image');
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (img) => {
    setEditingImage(img);
    setEditCaption(img.caption || '');
    setEditAltText(img.altText || '');
    setEditIsOnGallery(Boolean(img.is_on_gallery));
    setEditRows(img.rows_and_columns?.[0] || 1);
    setEditCols(img.rows_and_columns?.[1] || 1);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingImage) return;
    try {
      setSavingEdit(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/v1/gallery/${editingImage._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          caption: editCaption,
          altText: editAltText,
          is_on_gallery: editIsOnGallery,
          rows_and_columns: [parseInt(editRows), parseInt(editCols)]
        })
      });
      const data = await res.json();
      if (data.success) {
        setImages(images.map(img => img._id === editingImage._id ? data.data : img));
        setShowEditModal(false);
      } else {
        alert(data.message || 'Failed to update image');
      }
    } catch (err) {
      alert('Error updating image');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', textAlign: 'left' }}>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ── Cloudinary Usage Dashboard ── */}
      <div className={styles.usageSection}>
        <div className={styles.usageSectionHeader}>
          <div className={styles.usageTitleGroup}>
            <span className={styles.usageTitleText}>Storage &amp; Usage</span>
            {usage?.plan && <span className={styles.planBadge}>{usage.plan}</span>}
          </div>
          <button className={styles.refreshBtn} onClick={fetchUsage} disabled={usageLoading} title="Refresh">
            <FontAwesomeIcon icon={faSync} spin={usageLoading} />
          </button>
        </div>

        {usageError && <p className={styles.usageError}>{usageError}</p>}

        {usageLoading && !usage ? (
          <div style={{ padding: '1rem 0' }}><Spinner animation="border" size="sm" style={{ color: 'var(--accent1)' }} /></div>
        ) : usage ? (
          <>
            {/* Compact inline counts */}
            <div className={styles.miniStatRow}>
              <div className={styles.miniStat}>
                <span className={styles.miniStatValue}>{usage.db.totalImages}</span>
                <span className={styles.miniStatLabel}>Total</span>
              </div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}>
                <span className={`${styles.miniStatValue} ${styles.green}`}>{usage.db.visibleImages}</span>
                <span className={styles.miniStatLabel}>Visible</span>
              </div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}>
                <span className={styles.miniStatValue}>{usage.db.hiddenImages}</span>
                <span className={styles.miniStatLabel}>Hidden</span>
              </div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}>
                <span className={styles.miniStatValue}>{usage.cloudinaryResources ?? '—'}</span>
                <span className={styles.miniStatLabel}>Cloud Assets</span>
              </div>
              {usage.db.newestUpload && (
                <>
                  <div className={styles.miniStatDivider} />
                  <div className={styles.miniStat}>
                    <span className={styles.miniStatValue} style={{ fontSize: '0.95rem' }}>
                      {new Date(usage.db.newestUpload).toLocaleDateString()}
                    </span>
                    <span className={styles.miniStatLabel}>Last Upload</span>
                  </div>
                </>
              )}
            </div>

            {/* Slim usage meters */}
            <div className={styles.miniMeters}>
              <MiniMeter
                label="Storage"
                usedPercent={usage.storage.usedPercent}
                usedLabel={formatBytes(usage.storage.usedBytes)}
                limitLabel={usage.storage.limitBytes ? formatBytes(usage.storage.limitBytes) : null}
              />
              <MiniMeter
                label="Bandwidth"
                usedPercent={usage.bandwidth.usedPercent}
                usedLabel={formatBytes(usage.bandwidth.usedBytes)}
                limitLabel={usage.bandwidth.limitBytes ? formatBytes(usage.bandwidth.limitBytes) : null}
              />
              <MiniMeter
                label="Transformations"
                usedPercent={usage.transformations.usedPercent}
                usedLabel={(usage.transformations.used ?? 0).toLocaleString()}
                limitLabel={usage.transformations.limit ? usage.transformations.limit.toLocaleString() : null}
              />
            </div>
          </>
        ) : null}
      </div>


      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.uploadSectionOption1}
      >
        <h4 className={styles.uploadTitle}>
          <FontAwesomeIcon icon={faUpload} className={styles.uploadTitleIcon} />
          Upload New Image
        </h4>
        <Form onSubmit={handleUpload}>
          {/* Row 1: File picker + Caption */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.formLabel}>Image File</Form.Label>
                <label htmlFor="imageFile" className={styles.filePicker}>
                  <div className={styles.filePickerInner}>
                    <FontAwesomeIcon icon={faUpload} className={styles.filePickerIcon} />
                    <span className={styles.filePickerText}>
                      {file ? file.name : 'Click to browse or drag & drop'}
                    </span>
                    <span className={styles.filePickerSub}>
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PNG, JPG, WEBP supported'}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    id="imageFile"
                    required 
                    onChange={e => setFile(e.target.files[0])} 
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </label>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.formLabel}>Caption <span className={styles.optionalTag}>(optional)</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="E.g., Sunset in Kyoto" 
                  value={caption} 
                  onChange={e => setCaption(e.target.value)}
                  className={styles.formControl}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={styles.formLabel}>Alt Text <span className={styles.optionalTag}>(optional)</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="For SEO & Accessibility" 
                  value={altText} 
                  onChange={e => setAltText(e.target.value)}
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Row 2: Bento Grid Span + Show in Gallery toggle */}
          <div className={styles.bottomRow}>
            <Form.Group className={styles.gridSpanGroup}>
              <Form.Label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Bento Grid Span
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="tooltip-grid">
                      Rows and columns control how much space this image occupies in the public gallery bento grid. A 2×2 image takes up 4 cells and appears much larger.
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: 'var(--accent1)', cursor: 'help' }} />
                </OverlayTrigger>
              </Form.Label>
              <div className={styles.gridInputs}>
                <div className={styles.squareInputWrapper}>
                  <Form.Control 
                    type="number" 
                    min="1"
                    max="12"
                    value={rows} 
                    onChange={e => setRows(e.target.value)}
                    className={`${styles.formControl} ${styles.squareInput}`}
                  />
                  <span className={styles.squareInputLabel}>Rows</span>
                </div>
                <div className={styles.gridSeparator}>×</div>
                <div className={styles.squareInputWrapper}>
                  <Form.Control 
                    type="number" 
                    min="1"
                    max="4"
                    value={cols} 
                    onChange={e => setCols(e.target.value)}
                    className={`${styles.formControl} ${styles.squareInput}`}
                  />
                  <span className={styles.squareInputLabel}>Cols</span>
                </div>
              </div>
            </Form.Group>

            <div className={styles.galleryToggleWrapper}>
              <button
                type="button"
                className={`${styles.galleryPillToggle} ${isOnGallery ? styles.galleryPillActive : ''}`}
                onClick={() => setIsOnGallery(v => !v)}
              >
                <span className={styles.galleryPillDot} />
                <span className={styles.galleryPillLabel}>{isOnGallery ? 'Visible in Gallery' : 'Hidden from Gallery'}</span>
              </button>
            </div>

            <div className="d-flex align-items-end">
              <Button type="submit" disabled={uploading || !file} className={styles.submitBtn}>
                {uploading ? <Spinner size="sm" animation="border" /> : <><FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />Upload Image</>}
              </Button>
            </div>
          </div>
        </Form>
      </motion.div>

      <h4 className={styles.uploadTitle} style={{ marginTop: '4rem' }}>
        <FontAwesomeIcon icon={faImage} className={styles.uploadTitleIcon} />
        Uploaded Images
      </h4>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: 'var(--accent1)' }} />
        </div>
      ) : images.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No images uploaded yet.</p>
      ) : (
        <div className={styles.tableContainer}>
          <Table hover className={`${styles.table} align-middle m-0`}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Details</th>
                <th>Config</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map(img => (
                <tr key={img._id}>
                  <td>
                    <div 
                      className={styles.imagePreviewWrapper}
                      onClick={() => { setSelectedImage(img); setShowModal(true); }}
                      title="Click to view full image"
                    >
                      <img src={getTransformedUrl(img.imageUrl)} alt={img.altText || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {img.caption || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>No caption</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alt: {img.altText || '-'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(img.uploadedAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div>
                      {img.is_on_gallery ? (
                         <span className={`${styles.badge} ${styles.badgeSuccess}`}>In Gallery</span>
                      ) : (
                         <span className={`${styles.badge} ${styles.badgeSecondary}`}>Hidden</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Grid: {img.rows_and_columns?.[0] || 1}x{img.rows_and_columns?.[1] || 1}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className={styles.actionBtn}
                        onClick={() => copyToClipboard(getTransformedUrl(img.imageUrl), img._id)}
                        title="Copy direct link"
                      >
                        <FontAwesomeIcon icon={copiedId === img._id ? faCheck : faLink} color={copiedId === img._id ? 'green' : 'inherit'} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionEdit}`}
                        onClick={() => openEditModal(img)}
                        title="Edit details"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionDel}`}
                        onClick={() => handleDelete(img._id)}
                        title="Delete image"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="bg-transparent border-0">
        <Modal.Body style={{ position: 'relative', textAlign: 'center', padding: 0 }}>
          <Button 
            variant="link" 
            onClick={() => setShowModal(false)}
            style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          {selectedImage && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={getTransformedUrl(selectedImage.imageUrl)} 
                alt={selectedImage.altText || selectedImage.caption || 'Preview'} 
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
              />
              {selectedImage.caption && (
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px 24px', borderRadius: '30px', backdropFilter: 'blur(8px)', fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                  {selectedImage.caption}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Details Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
            Edit Image Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Caption</Form.Label>
              <Form.Control
                type="text"
                placeholder="Image caption"
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                className={styles.inputField}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Alt Text</Form.Label>
              <Form.Control
                type="text"
                placeholder="Accessibility description"
                value={editAltText}
                onChange={e => setEditAltText(e.target.value)}
                className={styles.inputField}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col xs={12}>
                <Form.Label className={styles.formLabel}>
                  Grid Span (Bento Size)
                </Form.Label>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel} style={{ fontSize: '0.75rem', opacity: 0.8 }}>Rows</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="12"
                    value={editRows}
                    onChange={e => setEditRows(e.target.value)}
                    className={`${styles.inputField} ${styles.squareInput}`}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className={styles.formLabel} style={{ fontSize: '0.75rem', opacity: 0.8 }}>Columns</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="12"
                    value={editCols}
                    onChange={e => setEditCols(e.target.value)}
                    className={`${styles.inputField} ${styles.squareInput}`}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className={styles.galleryToggleWrapper} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                className={`${styles.galleryPillToggle} ${editIsOnGallery ? styles.galleryPillActive : ''}`}
                onClick={() => setEditIsOnGallery(v => !v)}
              >
                <span className={styles.galleryPillDot} />
                <span className={styles.galleryPillLabel}>{editIsOnGallery ? 'Visible in Gallery' : 'Hidden from Gallery'}</span>
              </button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowEditModal(false)} disabled={savingEdit}>
            Cancel
          </Button>
          <Button className={styles.submitBtn} onClick={handleEditSave} disabled={savingEdit}>
            {savingEdit ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

