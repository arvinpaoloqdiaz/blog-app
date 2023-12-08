import {Container, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";
import '../App.css';
import {useContext} from "react";
import UserContext from "../UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';

function AppNavbar() {
  const{user} = useContext(UserContext);

  return (
    <Navbar className="custom-navbar py-3" variant="dark">
      <Container fluid>
        <Navbar.Brand className="logo-container" as={Link} to="/"><div className="custom-navbar-logo">Blog</div><div className="custom-navbar-logo">Blog</div><div className="custom-navbar-logo">Blog</div></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav 
            className="ms-auto my-2 my-lg-0 text-center"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            {
              (user.isAdmin)?
              <Nav.Link as={Link} to="/create" exact><FontAwesomeIcon icon={faSquarePlus} className="btn-add-post mx-3"/></Nav.Link>
              :<></>
            }
            {
              (user.id !== null)?
              <Nav.Link className="custom-navbar-button m-0 py-1 px-2" as={Link} to="/logout" exact>Logout</Nav.Link>
              :
              <Nav.Link className="custom-navbar-button m-0 py-1 px-2" as={Link} to="/login" exact>Login</Nav.Link>
            }
          </Nav>

          </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;