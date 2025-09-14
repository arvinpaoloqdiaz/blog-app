import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Login from "./pages/Login/Login";
import Logout from "./pages/Logout/Logout";
import Register from "./pages/Register/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost/CreatePost";
import EditPost from "./pages/EditPost/EditPost";
import SpecificPost from "./pages/SpecificPost/SpecificPost";
import TagResults from "./pages/TagResults/TagResults";

import AdminRoute from "./components/AdminRoute/AdminRoute";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { UserProvider } from "./UserContext";

// ---------------------------
// Animated Routes Component
// ---------------------------
function AnimatedRoutes() {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route
          path="/login"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Login />
            </motion.div>
          }
        />
        <Route
          path="/logout"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Logout />
            </motion.div>
          }
        />
        {/* <Route
          path="/register"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Register />
            </motion.div>
          }
        /> */}
        <Route
          path="/create"
          element={
            <AdminRoute>
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <CreatePost />
              </motion.div>
            </AdminRoute>
          }
        />
        <Route
          path="/:postId/edit"
          element={
            <AdminRoute>
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <EditPost />
              </motion.div>
            </AdminRoute>
          }
        />
        <Route
          path="/:postId"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <SpecificPost />
            </motion.div>
          }
        />
        <Route
          path="/tags/:tag"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <TagResults />
            </motion.div>
          }
        />
        <Route
          path="/"
          element={
            <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <Home />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// ---------------------------
// Main App Component
// ---------------------------
function App() {
  const [apiAwake, setApiAwake] = useState(false);
  const [checkingApi, setCheckingApi] = useState(true);

  // Wake API on app load
  useEffect(() => {
    const wakeApi = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API_URL + "/health", { method: "GET" });

        if (res.ok) {
          setApiAwake(true); // API is awake
        } else {
          console.warn("API ping failed, continuing anyway...");
          setApiAwake(true);
        }
      } catch (err) {
        console.warn("API not responding yet, continuing...");
        setApiAwake(true);
      } finally {
        setCheckingApi(false);
      }
    };

    wakeApi();
  }, []);

  if (checkingApi)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h2>Waking up API...</h2>
      </div>
    );

  return (
    <UserProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />

          <Container fluid className="bg-main py-3 main-content">
            <AnimatedRoutes />
          </Container>

          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
