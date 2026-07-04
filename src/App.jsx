import { useState, useEffect, useRef } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import NotFound from "./pages/NotFound/NotFound";

import Login from "./pages/Login/Login";
import Logout from "./pages/Logout/Logout";
import Home from "./pages/Home";
import Writing from "./pages/Writing/Writing";
import CreatePost from "./pages/CreatePost/CreatePost";
import EditPost from "./pages/EditPost/EditPost";
import SpecificPost from "./pages/SpecificPost/SpecificPost";
import Projects from "./pages/Projects/Projects";
import Gallery from "./pages/Gallery/Gallery";
import Bookmarks from "./pages/Bookmarks/Bookmarks";
import Now from "./pages/Now/Now";
import Uses from "./pages/Uses/Uses";

import AdminRoute from "./components/AdminRoute/AdminRoute";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { UserProvider } from "./UserContext";

// ---------------------------
// Page transition wrapper
// ---------------------------
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -16 },
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.35 };

function Animated({ children }) {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      {children}
    </motion.div>
  );
}

function TagRedirect() {
  const { tag } = useParams();
  return <Navigate to={`/writing?tag=${encodeURIComponent(tag)}`} replace />;
}

// ---------------------------
// Animated Routes Component
// ---------------------------
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        {/* Main pages */}
        <Route path="/" element={<Animated><Home /></Animated>} />
        <Route path="/writing" element={<Animated><Writing /></Animated>} />
        <Route path="/projects" element={<Animated><Projects /></Animated>} />
        <Route path="/gallery" element={<Animated><Gallery /></Animated>} />
        <Route path="/bookmarks" element={<Animated><Bookmarks /></Animated>} />
        <Route path="/now" element={<Animated><Now /></Animated>} />
        <Route path="/uses" element={<Animated><Uses /></Animated>} />

        {/* Auth */}
        <Route path="/u-arvin" element={<Animated><Login /></Animated>} />
        <Route path="/logout" element={<Animated><Logout /></Animated>} />

        {/* Admin-only */}
        <Route path="/create" element={<AdminRoute><Animated><CreatePost /></Animated></AdminRoute>} />
        <Route path="/writing/:postId/edit" element={<AdminRoute><Animated><EditPost /></Animated></AdminRoute>} />

        {/* Blog post routes */}
        <Route path="/tags/:tag" element={<TagRedirect />} />
        <Route path="/writing/:postId" element={<Animated><SpecificPost /></Animated>} />

        {/* 404 Not Found */}
        <Route path="*" element={<Animated><NotFound /></Animated>} />
      </Routes>
    </AnimatePresence>
  );
}

// ---------------------------
// API Wake Screen
// ---------------------------
const wakeMessages = [
  "Spinning up the server…",
  "Cold starts take a moment…",
  "Almost there, hang tight…",
  "Waking up the backend…",
];

function ApiWakeScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % wakeMessages.length);
    }, 2500);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div style={wakeStyles.page}>
      <div style={wakeStyles.card}>
        {/* Logo */}
        <div style={wakeStyles.logo}>
          <span style={wakeStyles.logoWord}>apqd</span>
          <span style={wakeStyles.logoDot}>.</span>
        </div>

        {/* Spinner ring */}
        <div style={wakeStyles.spinnerWrapper}>
          <svg viewBox="0 0 80 80" style={wakeStyles.svg}>
            <circle cx="40" cy="40" r="34" style={wakeStyles.trackCircle} />
            <circle cx="40" cy="40" r="34" style={wakeStyles.spinCircle} />
          </svg>
          <span style={wakeStyles.sparkle}>✦</span>
        </div>

        {/* Status message */}
        <p style={wakeStyles.message}>{wakeMessages[msgIdx]}{dots}</p>
        <p style={wakeStyles.sub}>The API is waking up from inactivity</p>
      </div>
    </div>
  );
}

const wakeStyles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#FAFAFA",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.2rem",
    padding: "3rem 2.5rem",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(120, 80, 160, 0.08)",
    border: "1px solid rgba(120, 80, 160, 0.08)",
    minWidth: "280px",
  },
  logo: {
    display: "flex",
    alignItems: "baseline",
    gap: "1px",
    marginBottom: "0.5rem",
  },
  logoWord: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: "1.6rem",
    color: "#1a1a2e",
    letterSpacing: "-0.02em",
  },
  logoDot: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: "1.6rem",
    background: "linear-gradient(135deg, #7850a0, #a370c8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  spinnerWrapper: {
    position: "relative",
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    width: "80px",
    height: "80px",
    position: "absolute",
    top: 0,
    left: 0,
    animation: "spin 1.8s linear infinite",
  },
  trackCircle: {
    fill: "none",
    stroke: "rgba(120, 80, 160, 0.1)",
    strokeWidth: 5,
  },
  spinCircle: {
    fill: "none",
    stroke: "url(#wakeGrad)",
    strokeWidth: 5,
    strokeLinecap: "round",
    strokeDasharray: "60 155",
    transformOrigin: "center",
  },
  sparkle: {
    fontSize: "1.4rem",
    background: "linear-gradient(135deg, #7850a0, #a370c8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    position: "relative",
    zIndex: 1,
  },
  message: {
    color: "#1a1a2e",
    fontWeight: 600,
    fontSize: "0.95rem",
    margin: 0,
    textAlign: "center",
    transition: "all 0.4s ease",
    minHeight: "1.4em",
  },
  sub: {
    color: "#8a8a9a",
    fontSize: "0.78rem",
    margin: 0,
    textAlign: "center",
  },
};

// ---------------------------
// Main App Component
// ---------------------------
function App() {
  const [checkingApi, setCheckingApi] = useState(true);

  useEffect(() => {
    const wakeApi = async () => {
      try {
        await fetch(import.meta.env.VITE_API_URL + "/health", { method: "GET" });
      } catch (err) {
        console.warn("API not responding yet, continuing...");
      } finally {
        setCheckingApi(false);
      }
    };
    wakeApi();
  }, []);

  if (checkingApi)
    return <ApiWakeScreen />;

  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <div className="app-wrapper bg-main">
          <Navbar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
