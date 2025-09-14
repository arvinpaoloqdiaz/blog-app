import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";

import UserContext from "../../UserContext";
import styles from "./Navbar.module.css";

export default function AppNavbar() {
  const { user } = useContext(UserContext);

  return (
    <Navbar className={styles.navbar} variant="dark" expand="lg">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className={styles.logoContainer}>
          <div className={styles.logoText}>Blog</div>
          <div className={styles.logoText}>Blog</div>
          <div className={styles.logoText}>Blog</div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className={styles.navLinks} navbarScroll>
            {user.isAdmin && (
              <Nav.Link as={Link} to="/create">
                <FontAwesomeIcon icon={faSquarePlus} className={styles.addPostIcon} />
              </Nav.Link>
            )}

            {user.id ? (
              <Nav.Link as={Link} to="/logout" className={styles.navButton}>
                Logout
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login" className={styles.navButton}>
                u arvin?
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
