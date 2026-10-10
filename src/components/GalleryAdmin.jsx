import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Table, Button, Form, Spinner, Alert, Row, Col, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faUpload, faLink, faCheck, faImage, faTimes,
  faSync, faEdit, faEye, faGripVertical, faSave, faListUl
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UserContext from '../UserContext';
import styles from './GalleryAdmin.module.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ZONES = [
  {
    id: 'hero',
    label: 'Hero',
    desc: '8 cols × 2 rows',
    tagline: 'Large feature image — perfect for a dramatic landscape or centrepiece shot.',
    cols: 8, rows: 2,
  },
  {
    id: 'tall',
    label: 'Tall',
    desc: '4 cols × 2 rows',
    tagline: 'Tall portrait cell — ideal for vertical photos and paired next to a hero.',
    cols: 4, rows: 2,
  },
  {
    id: 'wide',
    label: 'Wide',
    desc: '8 cols × 1 row',
    tagline: 'Wide horizontal strip — great for panoramas or cinematic crops.',
    cols: 8, rows: 1,
  },
  {
    id: 'square',
    label: 'Square',
    desc: '4 cols × 1 row',
    tagline: 'Standard square cell — versatile for any subject or aspect ratio.',
    cols: 4, rows: 1,
  },
  {
    id: 'small',
    label: 'Small',
    desc: '3 cols × 1 row',
    tagline: 'Compact accent cell — best for detail shots or filling row gaps.',
    cols: 3, rows: 1,
  },
  {
    id: 'half',
    label: 'Half',
    desc: '6 cols × 1 row',
    tagline: 'Exactly half width — ideal for side-by-side 50/50 splits.',
    cols: 6, rows: 1,
  },
  {
    id: 'half_tall',
    label: 'Half Tall',
    desc: '6 cols × 2 rows',
    tagline: 'Large portrait half — stunning for vertical split layouts.',
    cols: 6, rows: 2,
  },
  {
    id: 'full',
    label: 'Full',
    desc: '12 cols × 1 row',
    tagline: 'Full width landscape — creates a distinct horizontal break in the grid.',
    cols: 12, rows: 1,
  },
  {
    id: 'full_tall',
    label: 'Full Tall',
    desc: '12 cols × 2 rows',
    tagline: 'Massive full width banner — completely takes over the viewport.',
    cols: 12, rows: 2,
  }
];

const ZONE_COLS = { hero: 8, tall: 4, wide: 8, square: 4, small: 3, half: 6, half_tall: 6, full: 12, full_tall: 12 };

const BREAKPOINTS = { desktop: 1200, tablet: 768, mobile: 390 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes == null) return 'N/A';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getTransformedUrl(url) {
  if (!url || !url.includes('/upload/')) return url;
  if (url.includes('q_auto,w_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto,w_auto/');
}

function computeRowBudgets(images, gridCols = 12) {
  const rows = [];
  let current = [];
  let used = 0;
  for (const img of images) {
    const cols = ZONE_COLS[img.layout_zone] ?? 4;
    if (used + cols > gridCols && current.length > 0) {
      rows.push({ items: current, used });
      current = [];
      used = 0;
    }
    current.push(img);
    used += cols;
  }
  if (current.length > 0) rows.push({ items: current, used });
  return rows;
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
            <span className={styles.miniMeterPct} style={{ color: danger ? '#e74c3c' : warn ? '#d68910' : 'var(--text-muted)' }}>
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

// Renders a mini 12-column grid diagram showing where the zone would sit
function ZoneGridDiagram({ cols, rows }) {
  const totalCols = 12;
  const cells = Array.from({ length: totalCols });
  return (
    <div className={styles.zoneGridDiagram}>
      {/* Top row showing the zone span */}
      <div className={styles.zoneGridRow}>
        {cells.map((_, i) => (
          <div
            key={i}
            className={`${styles.zoneGridCell} ${i < cols ? styles.zoneGridCellActive : ''}`}
            style={i < cols && rows === 2 ? { gridRow: 'span 2' } : {}}
          />
        ))}
      </div>
      {/* Second row if zone spans 2 rows */}
      {rows === 2 && (
        <div className={styles.zoneGridRow}>
          {cells.map((_, i) => (
            <div
              key={i}
              className={`${styles.zoneGridCell} ${i < cols ? styles.zoneGridCellActive : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ZoneCard({ zone, selected, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={`${styles.zoneCard} ${selected ? styles.zoneCardActive : ''} ${compact ? styles.zoneCardCompact : ''}`}
      onClick={() => onClick(zone.id)}
    >
      <ZoneGridDiagram cols={zone.cols} rows={zone.rows} />
      <div className={styles.zoneCardMeta}>
        <span className={styles.zoneCardLabel}>{zone.label}</span>
        <span className={styles.zoneCardDesc}>{zone.desc}</span>
        {!compact && <span className={styles.zoneCardTagline}>{zone.tagline}</span>}
      </div>
    </button>
  );
}

function ZonePicker({ value, onChange }) {
  return (
    <div className={styles.zonePicker}>
      {ZONES.map(zone => (
        <ZoneCard key={zone.id} zone={zone} selected={value === zone.id} onClick={onChange} />
      ))}
    </div>
  );
}

function SortableBentoItem({ img, onZoneChange, onMove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img._id });
  const [zonePickerOpen, setZonePickerOpen] = useState(false);
  const [changingZone, setChangingZone] = useState(false);
  const pickerRef = useRef(null);

  const zoneClass = {
    hero: styles.previewZoneHero, tall: styles.previewZoneTall,
    wide: styles.previewZoneWide, square: styles.previewZoneSquare,
    small: styles.previewZoneSmall, half: styles.previewZoneHalf,
    half_tall: styles.previewZoneHalfTall, full: styles.previewZoneFull,
    full_tall: styles.previewZoneFullTall,
  }[img.layout_zone] ?? styles.previewZoneSquare;

  // Close picker when clicking outside
  useEffect(() => {
    if (!zonePickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setZonePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [zonePickerOpen]);

  const handleZoneSelect = async (newZone) => {
    if (newZone === img.layout_zone) { setZonePickerOpen(false); return; }
    setZonePickerOpen(false);
    setChangingZone(true);
    await onZoneChange(img._id, newZone);
    setChangingZone(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setZonePickerOpen(true);
  };

  return (
    <div
      ref={setNodeRef}
      onContextMenu={handleContextMenu}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      className={`${styles.previewBentoItem} ${zoneClass}`}
    >
      <img src={getTransformedUrl(img.imageUrl)} alt={img.altText || ''} className={styles.previewBentoImg} draggable={false} />

      {/* Manual Move Arrows */}
      <div className={styles.previewManualMove}>
        <button className={styles.previewManualBtn} onClick={(e) => { e.stopPropagation(); onMove(img._id, -1); }} title="Move Left">
          ‹
        </button>
        <button className={styles.previewManualBtn} onClick={(e) => { e.stopPropagation(); onMove(img._id, 1); }} title="Move Right">
          ›
        </button>
      </div>

      {/* Drag handle — top-left */}
      <div className={styles.previewDragHandle} {...attributes} {...listeners}>
        <FontAwesomeIcon icon={faGripVertical} />
      </div>

      {/* Zone badge — bottom-right, clickable to open zone picker */}
      <div className={styles.previewZoneBadgeWrap} ref={pickerRef}>
        <button
          className={`${styles.previewZoneBadge} ${styles.previewZoneBadgeBtn}`}
          onClick={(e) => { e.stopPropagation(); setZonePickerOpen(v => !v); }}
          title="Click to change zone"
          disabled={changingZone}
        >
          {changingZone
            ? <span style={{ opacity: 0.7 }}>…</span>
            : <>{img.layout_zone || 'square'} ▾</>}
        </button>

        {/* Mini zone picker popover */}
        {zonePickerOpen && (
          <div className={styles.previewZonePicker}>
            <p className={styles.previewZonePickerTitle}>Change Zone</p>
            {ZONES.map(z => (
              <button
                key={z.id}
                className={`${styles.previewZonePickerOption} ${z.id === img.layout_zone ? styles.previewZonePickerOptionActive : ''}`}
                onClick={() => handleZoneSelect(z.id)}
              >
                <span className={styles.previewZonePickerDot} />
                <span className={styles.previewZonePickerOptionLabel}>{z.label}</span>
                <span className={styles.previewZonePickerOptionDesc}>{z.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryPreviewPanel({ images, onReorder, user }) {
  const [breakpoint, setBreakpoint] = useState('desktop');
  const [localImages, setLocalImages] = useState(images);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(300);

  useEffect(() => { if (!isDirty) setLocalImages(images); }, [images, isDirty]);

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current || !innerRef.current) return;
      const w = wrapRef.current.offsetWidth;
      const s = Math.min(1, w / BREAKPOINTS[breakpoint]);
      setScale(s);
      setScaledHeight(innerRef.current.scrollHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [breakpoint, localImages]);

  // Immediately PATCH zone on the server and update local state
  const handleZoneChange = async (imgId, newZone) => {
    try {
      const res = await fetch(`${API}/v1/gallery/${imgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ layout_zone: newZone }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalImages(prev => prev.map(i => i._id === imgId ? { ...i, layout_zone: newZone } : i));
        // Propagate zone change up so the Manage table also reflects it
        onReorder(localImages.map(i => i._id === imgId ? { ...i, layout_zone: newZone } : i));
      }
    } catch { /* silently fail */ }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setLocalImages(prev => {
      const oi = prev.findIndex(i => i._id === active.id);
      const ni = prev.findIndex(i => i._id === over.id);
      return arrayMove(prev, oi, ni);
    });
    setIsDirty(true);
  };

  const handleManualMove = (id, direction) => {
    setLocalImages(prev => {
      const oi = prev.findIndex(i => i._id === id);
      if (oi < 0) return prev;
      const ni = oi + direction;
      if (ni < 0 || ni >= prev.length) return prev;
      return arrayMove(prev, oi, ni);
    });
    setIsDirty(true);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const updates = localImages.map((img, idx) => ({ id: img._id, sort_order: idx }));
      const res = await fetch(`${API}/v1/gallery/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) { onReorder(localImages); setIsDirty(false); }
    } finally { setSaving(false); }
  };

  const galleryImages = localImages.filter(i => i.is_on_gallery);
  const rowBudgets = computeRowBudgets(galleryImages);
  const activeImg = localImages.find(i => i._id === activeId);
  const simW = BREAKPOINTS[breakpoint];

  const gridClass = {
    desktop: styles.previewGridDesktop,
    tablet:  styles.previewGridTablet,
    mobile:  styles.previewGridMobile,
  }[breakpoint];

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewToolbar}>
        <div className={styles.previewBpGroup}>
          {Object.keys(BREAKPOINTS).map(bp => (
            <button key={bp} className={`${styles.previewBpBtn} ${breakpoint === bp ? styles.previewBpActive : ''}`} onClick={() => setBreakpoint(bp)}>
              {bp.charAt(0).toUpperCase() + bp.slice(1)}
              <span className={styles.previewBpPx}>{BREAKPOINTS[bp]}px</span>
            </button>
          ))}
        </div>
        <div className={styles.previewRight}>
          {isDirty && <span className={styles.previewDirtyBadge}>Unsaved changes</span>}
          <button
            className={`${styles.previewSaveBtn} ${!isDirty ? styles.previewSaveBtnDisabled : ''}`}
            onClick={handleSaveOrder} disabled={!isDirty || saving}
          >
            {saving ? <Spinner size="sm" animation="border" /> : <><FontAwesomeIcon icon={faSave} style={{ marginRight: 6 }} />Save Order</>}
          </button>
        </div>
      </div>

      {galleryImages.length > 0 && (
        <div className={styles.rowBudgetBar}>
          {rowBudgets.map((row, i) => (
            <div key={i} className={`${styles.rowBudgetItem} ${row.used === 12 ? styles.rowBudgetFull : styles.rowBudgetPartial}`}>
              <span className={styles.rowBudgetLabel}>Row {i + 1}</span>
              <span className={styles.rowBudgetCols}>{row.used}/12</span>
              {row.used < 12 && <span className={styles.rowBudgetWarn}>⚠</span>}
            </div>
          ))}
        </div>
      )}

      <div className={styles.previewViewport} ref={wrapRef} style={{ height: scaledHeight }}>
        <div
          ref={innerRef}
          style={{ width: simW, transformOrigin: 'top left', transform: `scale(${scale})`, position: 'absolute', top: 0, left: 0 }}
        >
          {galleryImages.length === 0 ? (
            <div className={styles.previewEmpty}>
              <FontAwesomeIcon icon={faImage} style={{ fontSize: '2.5rem', opacity: 0.25, marginBottom: '0.75rem', display: 'block' }} />
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No gallery-visible images yet.<br />Upload images and mark them visible to preview the layout.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id)} onDragEnd={handleDragEnd}>
              <SortableContext items={galleryImages.map(i => i._id)} strategy={rectSortingStrategy}>
                <div className={`${styles.previewBentoGrid} ${gridClass}`}>
                  {galleryImages.map(img => (
                    <SortableBentoItem 
                      key={img._id} 
                      img={img} 
                      onZoneChange={handleZoneChange} 
                      onMove={handleManualMove} 
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeImg && (
                  <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    <img src={getTransformedUrl(activeImg.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      <p className={styles.previewHint}>
        Drag images to reorder &mdash; then click <strong>Save Order</strong> to publish the sequence.
        Only <em>gallery-visible</em> images appear here.
      </p>
    </div>
  );
}

// ── Main GalleryAdmin component ───────────────────────────────────────────────

export default function GalleryAdmin() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('upload');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editIsOnGallery, setEditIsOnGallery] = useState(false);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editZone, setEditZone] = useState('square');
  const [savingEdit, setSavingEdit] = useState(false);

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [isOnGallery, setIsOnGallery] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [zone, setZone] = useState('square');

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/v1/gallery`);
      const data = await res.json();
      if (data.success) setImages(data.data);
      else setError(data.message || 'Failed to fetch images');
    } catch { setError('An error occurred while fetching images.'); }
    finally { setLoading(false); }
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      setUsageLoading(true); setUsageError(null);
      const res = await fetch(`${API}/v1/gallery/usage`, { headers: { 'Authorization': `Bearer ${user.token}` } });
      const data = await res.json();
      if (data.success) setUsage(data.data);
      else setUsageError(data.message || 'Failed to load usage');
    } catch { setUsageError('Could not connect to usage API.'); }
    finally { setUsageLoading(false); }
  }, [user.token]);

  useEffect(() => { fetchImages(); fetchUsage(); }, [fetchImages, fetchUsage]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      setUploading(true); setError(null);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      formData.append('altText', altText);
      formData.append('is_on_gallery', isOnGallery);
      formData.append('isFeatured', isFeatured);
      formData.append('layout_zone', zone);
      const res = await fetch(`${API}/v1/gallery`, { method: 'POST', headers: { 'Authorization': `Bearer ${user.token}` }, body: formData });
      const data = await res.json();
      if (data.success) {
        setFile(null); setCaption(''); setAltText(''); setIsOnGallery(false); setIsFeatured(false); setZone('square');
        const fi = document.getElementById('imageFile');
        if (fi) fi.value = '';
        fetchImages();
      } else setError(data.message || 'Upload failed');
    } catch { setError('An error occurred during upload.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`${API}/v1/gallery/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
      const data = await res.json();
      if (data.success) setImages(prev => prev.filter(img => img._id !== id));
      else alert(data.message || 'Failed to delete');
    } catch { alert('Error deleting image'); }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (img) => {
    setEditingImage(img); setEditCaption(img.caption || ''); setEditAltText(img.altText || '');
    setEditIsOnGallery(Boolean(img.is_on_gallery)); setEditIsFeatured(Boolean(img.isFeatured)); setEditZone(img.layout_zone || 'square');
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingImage) return;
    try {
      setSavingEdit(true);
      const res = await fetch(`${API}/v1/gallery/${editingImage._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ caption: editCaption, altText: editAltText, is_on_gallery: editIsOnGallery, isFeatured: editIsFeatured, layout_zone: editZone }),
      });
      const data = await res.json();
      if (data.success) {
        setImages(prev => prev.map(img => img._id === editingImage._id ? data.data : img));
        setShowEditModal(false);
      } else alert(data.message || 'Failed to update image');
    } catch { alert('Error updating image'); }
    finally { setSavingEdit(false); }
  };

  const handleReorder = (reorderedImages) => {
    const reorderedIds = new Set(reorderedImages.map(i => i._id));
    const nonGallery = images.filter(i => !reorderedIds.has(i._id));
    setImages([...reorderedImages, ...nonGallery]);
  };

  const TABS = [
    { id: 'upload',  label: 'Upload',        icon: faUpload },
    { id: 'preview', label: 'Preview',       icon: faEye },
    { id: 'manage',  label: 'Manage Images', icon: faListUl },
  ];

  return (
    <div style={{ marginTop: '2rem', textAlign: 'left' }}>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ── Cloudinary Usage Dashboard — always visible ── */}
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
            <div className={styles.miniStatRow}>
              <div className={styles.miniStat}><span className={styles.miniStatValue}>{usage.db.totalImages}</span><span className={styles.miniStatLabel}>Total</span></div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}><span className={`${styles.miniStatValue} ${styles.green}`}>{usage.db.visibleImages}</span><span className={styles.miniStatLabel}>Visible</span></div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}><span className={styles.miniStatValue}>{usage.db.hiddenImages}</span><span className={styles.miniStatLabel}>Hidden</span></div>
              <div className={styles.miniStatDivider} />
              <div className={styles.miniStat}><span className={styles.miniStatValue}>{usage.cloudinaryResources ?? '—'}</span><span className={styles.miniStatLabel}>Cloud Assets</span></div>
              {usage.db.newestUpload && (
                <><div className={styles.miniStatDivider} /><div className={styles.miniStat}><span className={styles.miniStatValue} style={{ fontSize: '0.95rem' }}>{new Date(usage.db.newestUpload).toLocaleDateString()}</span><span className={styles.miniStatLabel}>Last Upload</span></div></>
              )}
            </div>
            <div className={styles.miniMeters}>
              <MiniMeter label="Storage" usedPercent={usage.storage.usedPercent} usedLabel={formatBytes(usage.storage.usedBytes)} limitLabel={usage.storage.limitBytes ? formatBytes(usage.storage.limitBytes) : null} />
              <MiniMeter label="Bandwidth" usedPercent={usage.bandwidth.usedPercent} usedLabel={formatBytes(usage.bandwidth.usedBytes)} limitLabel={usage.bandwidth.limitBytes ? formatBytes(usage.bandwidth.limitBytes) : null} />
              <MiniMeter label="Transformations" usedPercent={usage.transformations.usedPercent} usedLabel={(usage.transformations.used ?? 0).toLocaleString()} limitLabel={usage.transformations.limit ? usage.transformations.limit.toLocaleString() : null} />
            </div>
          </>
        ) : null}
      </div>

      {/* ── Tab bar ── */}
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab.id} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab(tab.id)}>
            <FontAwesomeIcon icon={tab.icon} className={styles.tabBtnIcon} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── UPLOAD TAB ── */}
        {activeTab === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className={styles.uploadSectionOption1}>
            <h4 className={styles.uploadTitle}>
              <FontAwesomeIcon icon={faUpload} className={styles.uploadTitleIcon} />
              Upload New Image
            </h4>
            <Form onSubmit={handleUpload}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className={styles.formLabel}>Image File</Form.Label>
                    <label htmlFor="imageFile" className={styles.filePicker}>
                      <div className={styles.filePickerInner}>
                        <FontAwesomeIcon icon={faUpload} className={styles.filePickerIcon} />
                        <span className={styles.filePickerText}>{file ? file.name : 'Click to browse or drag & drop'}</span>
                        <span className={styles.filePickerSub}>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'PNG, JPG, WEBP supported'}</span>
                      </div>
                      <input type="file" id="imageFile" required onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
                    </label>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className={styles.formLabel}>Caption <span className={styles.optionalTag}>(optional)</span></Form.Label>
                    <Form.Control type="text" placeholder="E.g., Sunset in Kyoto" value={caption} onChange={e => setCaption(e.target.value)} className={styles.formControl} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className={styles.formLabel}>Alt Text <span className={styles.optionalTag}>(optional)</span></Form.Label>
                    <Form.Control type="text" placeholder="For SEO & Accessibility" value={altText} onChange={e => setAltText(e.target.value)} className={styles.formControl} />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className={styles.formLabel}>Layout Zone</Form.Label>
                <ZonePicker value={zone} onChange={setZone} />
              </Form.Group>

              <div className={styles.bottomRow}>
                <div className={styles.galleryToggleWrapper} style={{ paddingBottom: 0 }}>
                  <button type="button" className={`${styles.galleryPillToggle} ${isOnGallery ? styles.galleryPillActive : ''}`} onClick={() => setIsOnGallery(v => !v)}>
                    <span className={styles.galleryPillDot} />
                    <span className={styles.galleryPillLabel}>{isOnGallery ? 'Visible in Gallery' : 'Hidden from Gallery'}</span>
                  </button>
                  <button type="button" className={`${styles.galleryPillToggle} ${isFeatured ? styles.galleryPillActive : ''}`} onClick={() => setIsFeatured(v => !v)}>
                    <span className={styles.galleryPillDot} />
                    <span className={styles.galleryPillLabel}>{isFeatured ? 'Featured on Home' : 'Not Featured'}</span>
                  </button>
                </div>
                <Button type="submit" disabled={uploading || !file} className={styles.submitBtn}>
                  {uploading ? <Spinner size="sm" animation="border" /> : <><FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />Upload Image</>}
                </Button>
              </div>
            </Form>
          </motion.div>
        )}

        {/* ── PREVIEW TAB ── */}
        {activeTab === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
            {loading
              ? <div className="text-center my-5"><Spinner animation="border" style={{ color: 'var(--accent1)' }} /></div>
              : <GalleryPreviewPanel images={images} onReorder={handleReorder} user={user} />
            }
          </motion.div>
        )}

        {/* ── MANAGE TAB ── */}
        {activeTab === 'manage' && (
          <motion.div key="manage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
            <h4 className={styles.uploadTitle} style={{ marginTop: '0.5rem' }}>
              <FontAwesomeIcon icon={faImage} className={styles.uploadTitleIcon} />
              Uploaded Images
            </h4>
            {loading ? (
              <div className="text-center my-5"><Spinner animation="border" style={{ color: 'var(--accent1)' }} /></div>
            ) : images.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No images uploaded yet.</p>
            ) : (
              <div className={styles.tableContainer}>
                <Table hover className={`${styles.table} align-middle m-0`}>
                  <thead>
                    <tr><th>Preview</th><th>Details</th><th>Config</th><th style={{ width: 150 }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {images.map(img => (
                      <tr key={img._id}>
                        <td>
                          <div className={styles.imagePreviewWrapper} onClick={() => { setSelectedImage(img); setShowModal(true); }} title="Click to view full image">
                            <img src={getTransformedUrl(img.imageUrl)} alt={img.altText || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                            {img.caption || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>No caption</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alt: {img.altText || '-'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(img.uploadedAt).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <div>
                            {img.is_on_gallery
                              ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>In Gallery</span>
                              : <span className={`${styles.badge} ${styles.badgeSecondary}`}>Hidden</span>}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Zone: <strong>{img.layout_zone || 'square'}</strong></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order: #{img.sort_order ?? '—'}</div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className={styles.actionBtn} onClick={() => copyToClipboard(getTransformedUrl(img.imageUrl), img._id)} title="Copy direct link">
                              <FontAwesomeIcon icon={copiedId === img._id ? faCheck : faLink} color={copiedId === img._id ? 'green' : 'inherit'} />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionEdit}`} onClick={() => openEditModal(img)} title="Edit details">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionDel}`} onClick={() => handleDelete(img._id)} title="Delete image">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Image Preview Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="bg-transparent border-0">
        <Modal.Body style={{ position: 'relative', textAlign: 'center', padding: 0 }}>
          <Button variant="link" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 15, right: 15, zIndex: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          {selectedImage && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={getTransformedUrl(selectedImage.imageUrl)} alt={selectedImage.altText || selectedImage.caption || 'Preview'} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
              {selectedImage.caption && (
                <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px 24px', borderRadius: 30, backdropFilter: 'blur(8px)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {selectedImage.caption}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* ── Edit Details Modal ── */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>Edit Image Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className={styles.formLabel}>Caption</Form.Label>
                  <Form.Control type="text" placeholder="Image caption" value={editCaption} onChange={e => setEditCaption(e.target.value)} className={styles.inputField} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className={styles.formLabel}>Alt Text</Form.Label>
                  <Form.Control type="text" placeholder="Accessibility description" value={editAltText} onChange={e => setEditAltText(e.target.value)} className={styles.inputField} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Layout Zone</Form.Label>
              <ZonePicker value={editZone} onChange={setEditZone} />
            </Form.Group>
            <div className={styles.galleryToggleWrapper} style={{ paddingBottom: 0, marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className={`${styles.galleryPillToggle} ${editIsOnGallery ? styles.galleryPillActive : ''}`} onClick={() => setEditIsOnGallery(v => !v)}>
                <span className={styles.galleryPillDot} />
                <span className={styles.galleryPillLabel}>{editIsOnGallery ? 'Visible in Gallery' : 'Hidden from Gallery'}</span>
              </button>
              <button type="button" className={`${styles.galleryPillToggle} ${editIsFeatured ? styles.galleryPillActive : ''}`} onClick={() => setEditIsFeatured(v => !v)}>
                <span className={styles.galleryPillDot} />
                <span className={styles.galleryPillLabel}>{editIsFeatured ? 'Featured on Home' : 'Not Featured'}</span>
              </button>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowEditModal(false)} disabled={savingEdit}>Cancel</Button>
          <Button className={styles.submitBtn} onClick={handleEditSave} disabled={savingEdit}>
            {savingEdit ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
