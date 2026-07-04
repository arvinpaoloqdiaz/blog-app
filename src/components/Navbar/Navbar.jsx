import { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquarePlus,
  faHouse,
  faFileLines,
  faRocket,
  faImage,
  faBookmark,
  faHourglassHalf,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import UserContext from "../../UserContext";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/writing", label: "Writing" },
  { to: "/projects", label: "Projects" },
  { to: "/gallery", label: "Gallery" },
  { to: "/bookmarks", label: "Bookmarks" },
  { to: "/now", label: "Now" },
  { to: "/uses", label: "Uses" },
];

const BOTTOM_NAV = [
  { to: "/", label: "Home", icon: faHouse },
  { to: "/writing", label: "Writing", icon: faFileLines },
  { to: "/projects", label: "Projects", icon: faRocket },
  { to: "/gallery", label: "Gallery", icon: faImage },
  { to: "/bookmarks", label: "Links", icon: faBookmark },
  { to: "/now", label: "Now", icon: faHourglassHalf },
  { to: "/uses", label: "Uses", icon: faScrewdriverWrench },
];

export default function AppNavbar() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Easter Egg State
  const [clickCount, setClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const clickTimeout = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = (e) => {
    // Only intercept if we're hunting the easter egg.
    setClickCount((prev) => prev + 1);
    
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    
    clickTimeout.current = setTimeout(() => {
      setClickCount(0); // reset if too far apart
    }, 500); // 500ms window between clicks
  };

  useEffect(() => {
    if (clickCount === 3) {
      setShowAdminLogin(true);
      setClickCount(0);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    }
  }, [clickCount]);

  return (
    <>
      {/* Top Navbar */}
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logoContainer} onClick={handleLogoClick}>
            <span className={styles.logoWord}>apqd</span>
            <span className={styles.logoDot}>.</span>
          </Link>

          {/* Desktop Nav — centered */}
          <nav className={styles.desktopNav}>
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} currentPath={location.pathname} />
            ))}
          </nav>

          {/* Right: Admin + Auth */}
          <div className={styles.navActions}>
            {(user.isAdmin || user.id) && (
              <Link to="/create" className={styles.adminIcon} title="New Post">
                <FontAwesomeIcon icon={faSquarePlus} />
              </Link>
            )}
            {user.id ? (
              <Link to="/logout" className={styles.authButton}>Logout</Link>
            ) : showAdminLogin ? (
              <Link to="/u-arvin" className={styles.authButton}>u arvin?</Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.bottomNav}>
        {BOTTOM_NAV.map((link) => {
          const isActive = location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to));
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ""}`}
            >
              {isActive && (
                <motion.span
                  className={styles.bottomNavIndicator}
                  layoutId="bottomIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <FontAwesomeIcon icon={link.icon} className={styles.bottomNavIcon} />
              <span className={styles.bottomNavLabel}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavLink({ to, label, currentPath }) {
  const isActive = currentPath === to || (to !== "/" && currentPath.startsWith(to));
  return (
    <Link to={to} className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
      {label}
      {isActive && (
        <motion.span
          className={styles.activeUnderline}
          layoutId="underline"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}
