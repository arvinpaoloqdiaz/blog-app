import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import { Extension, Mark, mergeAttributes } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faHighlighter,
  faCode,
  faListUl,
  faListOl,
  faQuoteLeft,
  faLink,
  faLinkSlash,
  faImage,
  faRotateLeft,
  faRotateRight,
  faMinus,
  faFont,
  faFileCode,
  faTable,
  faTableCells,
  faTableCellsLarge,
  faTrash,
  faTimes,
  faCheck,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faObjectGroup,
  faObjectUngroup,
  faGlobe,
  faImages,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./TipTapEditor.module.css";

// ── Custom Extensions ────────────────────────────────────────────────────────
const TabIndent = Extension.create({
  name: "tabIndent",
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.insertContent("\u00A0\u00A0\u00A0\u00A0"),
    };
  },
});

const Dropcap = Mark.create({
  name: "dropcap",
  parseHTML() {
    return [{ tag: "span.dropcap" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ class: "dropcap" }, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      toggleDropcap: () => ({ commands }) => commands.toggleMark(this.name),
    };
  },
});

const LineHeight = Extension.create({
  name: "lineHeight",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight) => ({ commands }) => {
        return commands.updateAttributes("paragraph", { lineHeight }) || commands.updateAttributes("heading", { lineHeight });
      },
      unsetLineHeight: () => ({ commands }) => {
        return commands.resetAttributes("paragraph", "lineHeight") || commands.resetAttributes("heading", "lineHeight");
      },
    };
  },
});

// ── Setup lowlight ──────────────────────────────────────────────────────────
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("css", css);
lowlight.register("html", html);

// ── Toolbar button ───────────────────────────────────────────────────────────
function ToolBtn({ icon, label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.toolBtn} ${active ? styles.active : ""} ${disabled ? styles.toolBtnDisabled : ""}`}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <span className={styles.divider} />;
}

// ── Table Insert Modal ───────────────────────────────────────────────────────
const BORDER_COLOR_OPTIONS = [
  { label: "Transparent (no border)", value: "transparent" },
  { label: "Light grey", value: "#d0d0d0" },
  { label: "Dark grey", value: "#555555" },
  { label: "Black", value: "#000000" },
  { label: "Accent purple", value: "#7850a0" },
  { label: "Blue", value: "#2563eb" },
  { label: "Red", value: "#dc2626" },
];

function TableModal({ onClose, onInsert }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [borderColor, setBorderColor] = useState("#d0d0d0");
  const [withHeader, setWithHeader] = useState(true);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleInsert = () => {
    onInsert({
      rows: Math.max(1, Math.min(20, rows)),
      cols: Math.max(1, Math.min(20, cols)),
      borderColor,
      withHeaderRow: withHeader,
    });
  };

  return (
    <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            <FontAwesomeIcon icon={faTable} style={{ marginRight: 8 }} />
            Insert Table
          </span>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalRow}>
            <label className={styles.modalLabel}>Rows</label>
            <input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className={styles.modalInput}
            />
          </div>
          <div className={styles.modalRow}>
            <label className={styles.modalLabel}>Columns</label>
            <input
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              className={styles.modalInput}
            />
          </div>
          <div className={styles.modalRow}>
            <label className={styles.modalLabel}>Border Color</label>
            <select
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className={styles.modalSelect}
            >
              {BORDER_COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {borderColor !== "transparent" && (
              <span
                className={styles.colorSwatch}
                style={{ background: borderColor }}
              />
            )}
          </div>
          <div className={styles.modalRow}>
            <label className={styles.modalLabel}>Header Row</label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={withHeader}
                onChange={(e) => setWithHeader(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          {/* Preview grid */}
          <div className={styles.tablePreview}>
            {Array.from({ length: Math.min(rows, 5) }).map((_, r) => (
              <div key={r} className={styles.tablePreviewRow}>
                {Array.from({ length: Math.min(cols, 6) }).map((_, c) => (
                  <div
                    key={c}
                    className={`${styles.tablePreviewCell} ${r === 0 && withHeader ? styles.tablePreviewHeader : ""}`}
                    style={{
                      borderColor: borderColor === "transparent" ? "transparent" : borderColor,
                    }}
                  />
                ))}
              </div>
            ))}
            {(rows > 5 || cols > 6) && (
              <div className={styles.tablePreviewMore}>
                {rows}×{cols} table
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalBtnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.modalBtnPrimary} onClick={handleInsert}>
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image Modal ──────────────────────────────────────────────────────────────
function ImageModal({ onClose, onInsert }) {
  const [tab, setTab] = useState("url"); // "url" | "gallery"
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Fetch gallery when tab switches to "gallery"
  useEffect(() => {
    if (tab !== "gallery") return;
    const load = async () => {
      setGalleryLoading(true);
      setGalleryError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/v1/gallery`
        );
        const data = await res.json();
        if (data.success) {
          setGalleryImages(data.data);
        } else {
          setGalleryError("Failed to load gallery.");
        }
      } catch {
        setGalleryError("Network error loading gallery.");
      } finally {
        setGalleryLoading(false);
      }
    };
    load();
  }, [tab]);

  const handleInsertUrl = () => {
    if (!url.trim()) return;
    onInsert({ src: url.trim(), alt: altText.trim() });
  };

  const handleInsertGallery = () => {
    if (!selectedImage) return;
    onInsert({
      src: selectedImage.imageUrl,
      alt: selectedImage.altText || selectedImage.caption || "",
    });
  };

  // Small transform helper (same as GalleryAdmin)
  const thumb = (url) => {
    if (!url || !url.includes("/upload/")) return url;
    return url.replace("/upload/", "/upload/w_120,h_120,c_fill,q_auto/");
  };

  return (
    <div className={styles.modalOverlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={`${styles.modalBox} ${styles.imageModalBox}`}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            <FontAwesomeIcon icon={faImage} style={{ marginRight: 8 }} />
            Add Image
          </span>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "url" ? styles.tabActive : ""}`}
            onClick={() => setTab("url")}
          >
            <FontAwesomeIcon icon={faGlobe} style={{ marginRight: 6 }} />
            Direct URL
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "gallery" ? styles.tabActive : ""}`}
            onClick={() => setTab("gallery")}
          >
            <FontAwesomeIcon icon={faImages} style={{ marginRight: 6 }} />
            Gallery
          </button>
        </div>

        <div className={styles.modalBody}>
          {tab === "url" && (
            <div>
              <div className={styles.modalRow}>
                <label className={styles.modalLabel}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={styles.modalInput}
                  autoFocus
                />
              </div>
              <div className={styles.modalRow}>
                <label className={styles.modalLabel}>Alt Text</label>
                <input
                  type="text"
                  placeholder="Describe the image (optional)"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className={styles.modalInput}
                />
              </div>
              {url && (
                <div className={styles.urlPreviewWrap}>
                  <img
                    src={url}
                    alt="preview"
                    className={styles.urlPreview}
                    onError={(e) => (e.target.style.display = "none")}
                    onLoad={(e) => (e.target.style.display = "block")}
                  />
                </div>
              )}
            </div>
          )}

          {tab === "gallery" && (
            <div>
              {galleryLoading && (
                <div className={styles.galleryLoading}>Loading images…</div>
              )}
              {galleryError && (
                <div className={styles.galleryError}>{galleryError}</div>
              )}
              {!galleryLoading && !galleryError && galleryImages.length === 0 && (
                <div className={styles.galleryEmpty}>No images in gallery yet.</div>
              )}
              <div className={styles.galleryGrid}>
                {galleryImages.map((img) => (
                  <button
                    key={img._id}
                    type="button"
                    className={`${styles.galleryThumbBtn} ${
                      selectedImage?._id === img._id ? styles.galleryThumbSelected : ""
                    }`}
                    onClick={() => setSelectedImage(img)}
                    title={img.caption || img.altText || img.imageUrl}
                  >
                    <img
                      src={thumb(img.imageUrl)}
                      alt={img.altText || img.caption || "gallery image"}
                      className={styles.galleryThumbImg}
                    />
                    {selectedImage?._id === img._id && (
                      <div className={styles.galleryThumbCheck}>
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                    {img.caption && (
                      <div className={styles.galleryThumbCaption}>
                        {img.caption}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedImage && (
                <div className={styles.gallerySelectedInfo}>
                  <strong>Selected:</strong> {selectedImage.caption || selectedImage.altText || "Untitled"}{" "}
                  {selectedImage.altText && <span className={styles.gallerySelectedAlt}>· alt: {selectedImage.altText}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalBtnSecondary} onClick={onClose}>
            Cancel
          </button>
          {tab === "url" ? (
            <button
              type="button"
              className={styles.modalBtnPrimary}
              onClick={handleInsertUrl}
              disabled={!url.trim()}
            >
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
              Insert Image
            </button>
          ) : (
            <button
              type="button"
              className={styles.modalBtnPrimary}
              onClick={handleInsertGallery}
              disabled={!selectedImage}
            >
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
              Use Selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Table context toolbar ────────────────────────────────────────────────────
function TableContextToolbar({ editor }) {
  const inTable = editor.isActive("table");
  if (!inTable) return null;

  const canMerge = editor.can().mergeCells();
  const canSplit = editor.can().splitCell();

  return (
    <div className={styles.tableContextBar}>
      <span className={styles.tableContextLabel}>Table:</span>
      <ToolBtn icon={faArrowUp} label="Add Row Before" onClick={() => editor.chain().focus().addRowBefore().run()} />
      <ToolBtn icon={faArrowDown} label="Add Row After" onClick={() => editor.chain().focus().addRowAfter().run()} />
      <ToolBtn icon={faArrowLeft} label="Add Column Before" onClick={() => editor.chain().focus().addColumnBefore().run()} />
      <ToolBtn icon={faArrowRight} label="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()} />
      <Divider />
      <ToolBtn icon={faObjectGroup} label="Merge Cells" disabled={!canMerge} onClick={() => editor.chain().focus().mergeCells().run()} />
      <ToolBtn icon={faObjectUngroup} label="Split Cell" disabled={!canSplit} onClick={() => editor.chain().focus().splitCell().run()} />
      <Divider />
      <ToolBtn icon={faTableCells} label="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} />
      <ToolBtn icon={faTableCellsLarge} label="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()} />
      <ToolBtn icon={faTrash} label="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function TipTapEditor({ value, onChange, placeholder = "Write something..." }) {
  const [showTableModal, setShowTableModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Memoize extensions to prevent TipTap duplicate extension warnings during HMR/re-renders
  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight
    }),
    Underline,
    Highlight.configure({ multicolor: false }),
    Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
    Image.configure({ inline: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder }),
    CodeBlockLowlight.configure({ lowlight }),
    TextStyle,
    Color,
    TabIndent,
    Dropcap,
    LineHeight,
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when EditPost loads post data)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  // ── Link helper ────────────────────────────────────────────────────────────
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // ── Image insert handler ───────────────────────────────────────────────────
  const handleImageInsert = useCallback(
    ({ src, alt }) => {
      editor.chain().focus().setImage({ src, alt: alt || "" }).run();
      setShowImageModal(false);
    },
    [editor]
  );

  // ── Table insert handler ───────────────────────────────────────────────────
  const handleTableInsert = useCallback(
    ({ rows, cols, borderColor, withHeaderRow }) => {
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow })
        .run();

      // Apply border color via a DOM mutation right after insert
      // We use a brief timeout to let Tiptap render the table first
      setTimeout(() => {
        const editorEl = editor.view.dom;
        const tables = editorEl.querySelectorAll("table");
        if (tables.length > 0) {
          const lastTable = tables[tables.length - 1];
          lastTable.style.setProperty("--tbl-border-color", borderColor);
          if (borderColor === "transparent") {
            lastTable.setAttribute("data-border", "transparent");
          } else {
            lastTable.removeAttribute("data-border");
          }
        }
      }, 50);

      setShowTableModal(false);
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className={styles.editorWrapper}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        {/* History */}
        <ToolBtn icon={faRotateLeft} label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <ToolBtn icon={faRotateRight} label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        <Divider />

        {/* Font styling */}
        <input
          type="color"
          title="Text Color"
          className={styles.colorPicker}
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
          value={editor.getAttributes("textStyle").color || "#1A1A24"}
        />
        <select
          className={styles.toolSelect}
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setLineHeight(e.target.value).run();
            } else {
              editor.chain().focus().unsetLineHeight().run();
            }
          }}
          value={editor.getAttributes("paragraph").lineHeight || ""}
          title="Line Spacing"
        >
          <option value="">Default Spacing</option>
          <option value="1">1.0 (Tight)</option>
          <option value="1.5">1.5 (Relaxed)</option>
          <option value="2">2.0 (Double)</option>
        </select>
        <ToolBtn icon={faFont} label="Drop Cap (Highlight first letter)" active={editor.isActive("dropcap")} onClick={() => editor.chain().focus().toggleDropcap().run()} />
        <Divider />

        {/* Headings */}
        <select
          className={styles.toolSelect}
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" :
            "0"
          }
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: val }).run();
          }}
          title="Format"
        >
          <option value="0">Normal Text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        <Divider />

        {/* Inline marks */}
        <ToolBtn icon={faBold} label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolBtn icon={faItalic} label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolBtn icon={faUnderline} label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolBtn icon={faStrikethrough} label="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolBtn icon={faHighlighter} label="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} />
        <ToolBtn icon={faCode} label="Inline Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
        <ToolBtn icon={faFileCode} label="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <Divider />

        {/* Lists */}
        <ToolBtn icon={faListUl} label="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolBtn icon={faListOl} label="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolBtn icon={faQuoteLeft} label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Divider />

        {/* Alignment */}
        <select
          className={styles.toolSelect}
          value={
            editor.isActive({ textAlign: "center" }) ? "center" :
            editor.isActive({ textAlign: "right" }) ? "right" :
            editor.isActive({ textAlign: "justify" }) ? "justify" :
            "left"
          }
          onChange={(e) => editor.chain().focus().setTextAlign(e.target.value).run()}
          title="Alignment"
        >
          <option value="left">Left Align</option>
          <option value="center">Center Align</option>
          <option value="right">Right Align</option>
          <option value="justify">Justify</option>
        </select>
        <Divider />

        {/* Link / Image / HR / Table */}
        <ToolBtn icon={faLink} label="Add Link" active={editor.isActive("link")} onClick={setLink} />
        <ToolBtn icon={faLinkSlash} label="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} />
        <ToolBtn icon={faImage} label="Add Image" active={showImageModal} onClick={() => setShowImageModal(true)} />
        <ToolBtn icon={faTable} label="Insert Table" active={showTableModal} onClick={() => setShowTableModal(true)} />
        <ToolBtn icon={faMinus} label="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </div>

      {/* ── Table context toolbar (appears when inside a table) ── */}
      <TableContextToolbar editor={editor} />

      {/* ── Editor content ── */}
      <EditorContent editor={editor} className={styles.editorContent} />

      {/* ── Modals ── */}
      {showTableModal && (
        <TableModal
          onClose={() => setShowTableModal(false)}
          onInsert={handleTableInsert}
        />
      )}
      {showImageModal && (
        <ImageModal
          onClose={() => setShowImageModal(false)}
          onInsert={handleImageInsert}
        />
      )}
    </div>
  );
}
