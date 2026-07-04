import { useState, useEffect, useMemo, useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSortAmountDown,
  faTag,
  faPenToSquare,
  faXmark,
  faCalendarDays,
  faTableList,
  faListUl,
  faBarsStaggered,
  faSliders
} from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../UserContext";
import Tags from "../../components/Tags/Tags";
import styles from "./Writing.module.css";

function WritingSkeleton() {
  return (
    <div className={styles.skeletonList}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonDate} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonTags}>
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTag} style={{ width: '48px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Date helper ──────────────────────────────────────────────────
function fmtDate(iso) {
  const d = new Date(iso);
  return {
    month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    year: d.getFullYear(),
    short: d.toLocaleDateString("default", { year: "numeric", month: "short", day: "numeric" }),
  };
}

// ─── Stagger animation variants ───────────────────────────────────
const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.055 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

// ═══════════════════════════════════════════════════════════════════
// OPTION A — Editorial / Newspaper
// ═══════════════════════════════════════════════════════════════════
function PostRow({ post, isAdmin }) {
  const date = fmtDate(post.publishedOn);
  return (
    <div className={styles.postRow}>
      <div className={styles.dateBadge}>
        <span className={styles.dateBadgeMonth}>{date.month}</span>
        <span className={styles.dateBadgeDay}>{date.day}</span>
        <span className={styles.dateBadgeYear}>{date.year}</span>
      </div>
      <div className={styles.postRowContent}>
        <Link to={`/writing/${post._id}`} className={styles.postRowTitle}>{post.title}</Link>
        <div className={styles.postRowMeta}>
          <span className={styles.postRowAuthor}>by {post.author}</span>
          {post.tags?.length > 0 && <Tags data={post.tags} maxVisible={3} />}
        </div>
        {isAdmin && (
          <Link to={`/writing/${post._id}/edit`} className={styles.adminEdit}>
            <FontAwesomeIcon icon={faPenToSquare} /> Edit
          </Link>
        )}
      </div>
      {post.thumbnail && <img src={post.thumbnail} alt="" className={styles.postRowThumb} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OPTION B — Minimal Timeline
// ═══════════════════════════════════════════════════════════════════
function PostTimeline({ posts, isAdmin }) {
  const grouped = useMemo(() => {
    const g = {};
    posts.forEach((p) => {
      const yr = new Date(p.publishedOn).getFullYear();
      if (!g[yr]) g[yr] = [];
      g[yr].push(p);
    });
    return g;
  }, [posts]);

  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <div className={styles.timelineWrapper}>
      {years.map((year) => (
        <div key={year}>
          <div className={styles.timelineYear}>{year}</div>
          {grouped[year].map((post) => {
            const date = fmtDate(post.publishedOn);
            return (
              <div key={post._id} className={styles.timelineItem}>
                <div className={styles.timelineDotWrap}><div className={styles.timelineDot} /></div>
                <div className={styles.timelineBody}>
                  <Link to={`/writing/${post._id}`} className={styles.timelineTitle}>{post.title}</Link>
                  <div className={styles.timelineMeta}>
                    <span className={styles.timelineDate}>
                      <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: "0.3rem", opacity: 0.6 }} />
                      {date.month} {date.day}
                    </span>
                    <span className={styles.timelineAuthor}>by {post.author}</span>
                    {post.tags?.length > 0 && <Tags data={post.tags} maxVisible={2} />}
                    {isAdmin && (
                      <Link to={`/writing/${post._id}/edit`} className={styles.adminEdit}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Link>
                    )}
                  </div>
                </div>
                {post.thumbnail && <img src={post.thumbnail} alt="" className={styles.timelineThumb} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OPTION C — Compact Reading List
// ═══════════════════════════════════════════════════════════════════
function PostCompactRow({ post, isAdmin }) {
  const date = fmtDate(post.publishedOn);
  return (
    <div className={styles.compactRow}>
      <Link to={`/writing/${post._id}`} className={styles.compactTitle}>{post.title}</Link>
      <div className={styles.compactRight}>
        {post.tags?.slice(0, 2).map((tag) => (
          <Link key={tag} to={`/writing?tag=${encodeURIComponent(tag)}`} className={styles.compactTag}>
            {tag}
          </Link>
        ))}
        <span className={styles.compactDate}>{date.month} {date.day}, {date.year}</span>
        {isAdmin && (
          <Link to={`/writing/${post._id}/edit`} className={styles.adminEditIcon}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function Writing() {
  const { user } = useContext(UserContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(import.meta.env.VITE_WRITING_DEFAULT_SORT || "newest");

  // ─── CONFIGURATION (set via .env) ───
  // VITE_WRITING_CONTROL_STYLE: "inline" | "commandbar" | "drawer"
  const controlStyle = import.meta.env.VITE_WRITING_CONTROL_STYLE || "inline";

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read URL params
  // VITE_WRITING_DEFAULT_VIEW: "editorial" | "timeline" | "compact"
  const view = searchParams.get("view") || import.meta.env.VITE_WRITING_DEFAULT_VIEW || "editorial";
  const activeTag = searchParams.get("tag") || null;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  // VITE_WRITING_POSTS_PER_PAGE: number
  const postsPerPage = parseInt(import.meta.env.VITE_WRITING_POSTS_PER_PAGE || "5", 10);

  const setUrlParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined) newParams.delete(k);
      else newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/blog/posts?limit=200&page=1`);
        const data = await res.json();
        setAllPosts(data.data?.results || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    allPosts.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return [...s].sort();
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    let posts = [...allPosts];

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (p.author || "").toLowerCase().includes(q)
      );
    }

    if (activeTag) {
      posts = posts.filter((p) => (p.tags || []).includes(activeTag));
    }

    switch (sortBy) {
      case "oldest": posts.sort((a, b) => new Date(a.publishedOn) - new Date(b.publishedOn)); break;
      case "az":     posts.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "za":     posts.sort((a, b) => b.title.localeCompare(a.title)); break;
      default:       posts.sort((a, b) => new Date(b.publishedOn) - new Date(a.publishedOn));
    }

    return posts;
  }, [allPosts, search, sortBy, activeTag]);

  const isFiltering = !!(search || activeTag);
  const displayedPosts = isFiltering
    ? filteredPosts
    : filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  
  const totalPages = isFiltering ? 1 : Math.ceil(filteredPosts.length / postsPerPage);

  const isAdmin = user?.isAdmin || !!user?.id;

  // Render Helpers for Controls
  const renderSort = () => (
    <select className={styles.sortSelectClean} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="az">A → Z</option>
      <option value="za">Z → A</option>
    </select>
  );

  const renderViews = () => (
    <div className={styles.viewSelectorClean}>
      <button className={`${styles.viewBtnClean} ${view === "editorial" ? styles.viewBtnCleanActive : ""}`} onClick={() => setUrlParams({ view: "editorial" })} title="Editorial"><FontAwesomeIcon icon={faTableList} /></button>
      <button className={`${styles.viewBtnClean} ${view === "timeline" ? styles.viewBtnCleanActive : ""}`} onClick={() => setUrlParams({ view: "timeline" })} title="Timeline"><FontAwesomeIcon icon={faBarsStaggered} /></button>
      <button className={`${styles.viewBtnClean} ${view === "compact" ? styles.viewBtnCleanActive : ""}`} onClick={() => setUrlParams({ view: "compact" })} title="Compact"><FontAwesomeIcon icon={faListUl} /></button>
    </div>
  );

  const renderTags = () => (
    <div className={styles.tagPillsWrapper}>
      <div className={styles.tagPills}>
        <button className={`${styles.tagPill} ${activeTag === null ? styles.tagPillActive : ""}`} onClick={() => setUrlParams({ tag: null, page: 1 })}>All</button>
        {allTags.map((tag) => (
          <button key={tag} className={`${styles.tagPill} ${activeTag === tag ? styles.tagPillActive : ""}`} onClick={() => setUrlParams({ tag: activeTag === tag ? null : tag, page: 1 })}>{tag}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      
      {/* ── Option 1: Inline Minimalist ── */}
      {controlStyle === "inline" && (
        <div className={styles.inlineHeader}>
          <div>
            <p className={styles.eyebrow}>Writing</p>
            <h1 className={styles.title}>All Posts</h1>
          </div>
          <div className={styles.inlineControls}>
            <div className={styles.inlineSearchGroup}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.inlineSearchIcon}/>
              <input type="text" placeholder="Search..." className={styles.inlineSearchInput} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {renderSort()}
            {renderViews()}
          </div>
        </div>
      )}

      {/* ── Option 2: Command Bar ── */}
      {controlStyle === "commandbar" && (
        <div style={{marginBottom: '2rem'}}>
          <p className={styles.eyebrow}>Writing</p>
          <h1 className={styles.title}>All Posts</h1>
          <div className={styles.commandBar}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.commandIcon}/>
            <input type="text" placeholder="Search title, author, or type a tag..." className={styles.commandInput} value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className={styles.commandRight}>
              {renderSort()}
              <div className={styles.commandDivider} />
              {renderViews()}
            </div>
          </div>
        </div>
      )}

      {/* ── Option 3: Hidden Drawer ── */}
      {controlStyle === "drawer" && (
        <div style={{marginBottom: '2rem'}}>
          <div className={styles.drawerHeader}>
            <div>
              <p className={styles.eyebrow}>Writing</p>
              <h1 className={styles.title}>All Posts</h1>
            </div>
            <button className={styles.drawerToggle} onClick={() => setDrawerOpen(!drawerOpen)}>
              <FontAwesomeIcon icon={faSliders} /> {drawerOpen ? "Close Filters" : "Filter & View"}
            </button>
          </div>
          <AnimatePresence>
            {drawerOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                <div className={styles.drawerContent}>
                  <input type="text" placeholder="Search posts..." className={styles.drawerSearch} value={search} onChange={(e) => setSearch(e.target.value)} />
                  <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                    {renderSort()}
                    {renderViews()}
                  </div>
                  <div style={{marginTop: '1rem'}}>{renderTags()}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Only show tags row for inline style, since command bar wants to hide them, and drawer puts them inside */}
      {controlStyle === "inline" && allTags.length > 0 && (
        <div className={styles.tagFilterRowInline}>
          <FontAwesomeIcon icon={faTag} className={styles.controlIcon} style={{marginLeft: '0.2rem'}}/>
          {renderTags()}
        </div>
      )}

      {/* ── Result count ── */}
      {!loading && (search || activeTag) && (
        <p className={styles.resultCount}>
          {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"} found
        </p>
      )}

      {loading && <WritingSkeleton />}
      {!loading && displayedPosts.length === 0 && <p className={styles.empty}>No posts match your search.</p>}

      {/* ── Views ── */}
      {!loading && displayedPosts.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            className={styles.layoutSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {view === "editorial" && (
              <motion.div variants={listVariants} initial="hidden" animate="visible">
                {displayedPosts.map((post) => (
                  <motion.div key={post._id} variants={itemVariants}>
                    <PostRow post={post} isAdmin={isAdmin} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {view === "timeline" && <PostTimeline posts={displayedPosts} isAdmin={isAdmin} />}

            {view === "compact" && (
              <motion.div className={styles.compactContainer} variants={listVariants} initial="hidden" animate="visible">
                {displayedPosts.map((post) => (
                  <motion.div key={post._id} variants={itemVariants}>
                    <PostCompactRow post={post} isAdmin={isAdmin} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Minimalist Pagination ── */}
      {!loading && !isFiltering && totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setUrlParams({ page: currentPage - 1 })}
          >
            Prev
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                className={`${styles.pageNum} ${i + 1 === currentPage ? styles.pageNumActive : ""}`}
                onClick={() => setUrlParams({ page: i + 1 })}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setUrlParams({ page: currentPage + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
