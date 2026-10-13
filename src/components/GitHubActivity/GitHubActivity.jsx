import { useEffect, useState } from "react";
import styles from "./GitHubActivity.module.css";

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;



function buildHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function shortSha(sha) {
  return sha ? sha.slice(0, 7) : "-------";
}

export default function GitHubActivity() {
  const [contributions, setContributions] = useState(null);
  const [recentCommits, setRecentCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!GITHUB_USERNAME) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch public push events — payload.commits is absent in public API,
        // so we grab the head SHA and fetch each commit message individually.
        const eventsRes = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
          { headers: buildHeaders() }
        );
        const events = await eventsRes.json();

        const pushEvents = Array.isArray(events)
          ? events.filter((e) => e.type === "PushEvent").slice(0, 3)
          : [];

        const commits = await Promise.all(
          pushEvents.map(async (event) => {
            const headSha = event.payload.head;
            let message = "(no message)";
            try {
              const cRes = await fetch(
                `https://api.github.com/repos/${event.repo.name}/commits/${headSha}`,
                { headers: buildHeaders() }
              );
              const cData = await cRes.json();
              message = cData.commit?.message?.split("\n")[0] || message;
            } catch (_) {/* swallow individual commit errors */}
            return {
              repo: event.repo.name,
              repoShort: event.repo.name.split("/")[1],
              message,
              sha: headSha,
              date: event.created_at,
              url: `https://github.com/${event.repo.name}/commit/${headSha}`,
            };
          })
        );
        setRecentCommits(commits);

        // Contribution heatmap (public API, no auth)
        const contribRes = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
        );
        const contribData = await contribRes.json();
        setContributions(contribData);
      } catch (e) {
        console.error("GitHub fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (!GITHUB_USERNAME) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            <svg className={styles.githubIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Code Activity
          </h2>
          <p className={styles.sectionSubtitle}>Fresh off the keyboard</p>
        </div>
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewAllLink}
        >
          GitHub →
        </a>
      </div>

      {loading ? (
        <div className={styles.skeleton}>
          <div className={styles.skeletonCommits} />
          <div className={styles.skeletonHeatmap} />
        </div>
      ) : (
        <>
          {/* Latest commits */}
          {recentCommits.length > 0 && (
            <div className={styles.commitList}>
              {recentCommits.map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.commitRow}
                >
                  <code className={styles.sha}>{shortSha(c.sha)}</code>
                  <span className={styles.commitMsg}>{c.message}</span>
                  <span className={styles.commitRight}>
                    <span className={styles.commitRepo}>{c.repoShort}</span>
                    <span className={styles.commitTime}>{timeAgo(c.date)}</span>
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Heatmap */}
          {contributions && (
            <HeatmapGrid contributions={contributions} setTooltip={setTooltip} />
          )}
        </>
      )}

      {tooltip && (
        <div className={styles.tooltip} style={{ top: tooltip.y, left: tooltip.x }}>
          {tooltip.text}
        </div>
      )}
    </section>
  );
}

function HeatmapGrid({ contributions, setTooltip }) {
  const today = new Date();

  const countMap = {};
  (contributions?.contributions || []).forEach((c) => {
    countMap[c.date] = c.count;
  });

  // Start from the 1st of the month 5 months ago (6 months total including current month), aligned to Sunday
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const startSunday = new Date(startMonth);
  startSunday.setDate(startMonth.getDate() - startMonth.getDay());

  // Current week's Sunday (the grid's last column)
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const numWeeks = Math.round((currentSunday - startSunday) / msPerWeek) + 1;

  // Helper to format Date as YYYY-MM-DD in local timezone (avoids UTC timezone shifts)
  function toLocalDateKey(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Build numWeeks × 7 days forward from startSunday
  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startSunday);
      date.setDate(startSunday.getDate() + w * 7 + d);
      // Mark as null if: in the future OR before our 6-month window
      if (date > today || date < startMonth) {
        week.push(null);
      } else {
        const key = toLocalDateKey(date);
        week.push({ date: key, count: countMap[key] || 0 });
      }
    }
    weeks.push(week);
  }

  // Month labels: percentage offset across the weeks for 100% responsive width
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstValidDay = week.find((d) => d !== null);
    if (!firstValidDay) return;
    const month = parseInt(firstValidDay.date.split("-")[1], 10) - 1;
    if (month !== lastMonth) {
      monthLabels.push({
        pct: (wi / numWeeks) * 100,
        label: MONTHS[month],
      });
      lastMonth = month;
    }
  });

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  function handleMouseEnter(e, day) {
    if (!day) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sectionEl = e.currentTarget.closest("section");
    if (!sectionEl) return;
    const sectionRect = sectionEl.getBoundingClientRect();
    setTooltip({
      x: rect.left - sectionRect.left + rect.width / 2,
      y: rect.top - sectionRect.top - 38,
      text: `${day.count} contribution${day.count !== 1 ? "s" : ""} · ${day.date}`,
    });
  }

  return (
    <div className={styles.heatmapWrapper}>
      {/* Month label row — percentage-positioned for full container width */}
      <div className={styles.monthRow}>
        {monthLabels.map(({ pct, label }) => (
          <span
            key={pct}
            className={styles.monthLabel}
            style={{ left: `${pct}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Fluid 100% width cell grid */}
      <div className={styles.grid}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.weekCol}>
            {week.map((day, di) => (
              <div
                key={di}
                className={`${styles.cell} ${
                  day !== null
                    ? styles[`level${getLevel(day.count)}`]
                    : styles.cellFuture
                }`}
                onMouseEnter={(e) => handleMouseEnter(e, day)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>

      <p className={styles.heatmapNote}>↳ past 6 months of contribution activity</p>
    </div>
  );
}
