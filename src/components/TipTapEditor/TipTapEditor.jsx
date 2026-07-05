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
import { useEffect, useCallback, useMemo } from "react";
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
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faImage,
  faRotateLeft,
  faRotateRight,
  faMinus,
  faFont,
  faFileCode,
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

// ── Main component ───────────────────────────────────────────────────────────
export default function TipTapEditor({ value, onChange, placeholder = "Write something..." }) {
  
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

  // ── Image helper ───────────────────────────────────────────────────────────
  const addImage = useCallback(() => {
    const url = window.prompt("Image URL");
    if (url) {
      const alt = window.prompt("Image Alt Text (optional)");
      editor.chain().focus().setImage({ src: url, alt: alt || "" }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const h = (level) =>
    editor.chain().focus().toggleHeading({ level }).run();

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

        {/* Link / Image / HR */}
        <ToolBtn icon={faLink} label="Add Link" active={editor.isActive("link")} onClick={setLink} />
        <ToolBtn icon={faLinkSlash} label="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} />
        <ToolBtn icon={faImage} label="Add Image" onClick={addImage} />
        <ToolBtn icon={faMinus} label="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </div>

      {/* ── Editor content ── */}
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
