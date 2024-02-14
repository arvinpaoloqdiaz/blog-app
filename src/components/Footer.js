import {Container, Row, Col} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faCodepen} from '@fortawesome/free-brands-svg-icons';
import { faA } from '@fortawesome/free-solid-svg-icons';

import "../App.css"

export default function Footer(){
	return(
		<Container fluid className="d-grid custom-footer pt-3 mt-auto">
			<Row>
			<Col className="col-12 col-md-6 d-flex justify-content-center">
			<div>
				<h5 className="text-start text-transparent-white">About Me</h5>
				<h2>I'm a Web Developer. <br/>Enjoys Coding. <br/>Very Driven.</h2>
			</div>
			</Col>
			<Col className="col-12 col-md-6 text-end d-flex justify-content-center">
				<div>
					<h3>Contact Me</h3>
					<p>+63 927 322 2484</p>
					<p>arvinpaoloq.diaz@gmail.com</p>
					<h3>Links</h3>
					<a href="https://portfolio-arvinpaoloqdiaz.vercel.app/" target="_blank"><FontAwesomeIcon icon={faA} className="btn-socials portfolio me-3"/></a>
					<a href="https://www.linkedin.com/in/arvin-paolo-diaz/" target="_blank"><FontAwesomeIcon icon={faLinkedin} className="btn-socials linkedin me-3"/></a>
					<a href="https://github.com/arvinpaoloqdiaz" target="_blank"><FontAwesomeIcon icon={faGithub} className="btn-socials github me-3"/></a>
					<a href="https://codepen.io/Arvin-Paolo-Diaz" target="_blank"><FontAwesomeIcon icon={faCodepen} className="btn-socials codepen me-3"/></a>
				</div>
				
				
			</Col>
			<Col className="col-12 text-center my-1">
				<span className="mx-1">Arvin Paolo Diaz</span>
				<span className="mx-1">|</span>
				<span className="mx-1">&copy; All rights reserved</span>
				<span className="mx-1 d-none  d-md-inline">|</span>
				<span className="mx-1 d-none d-md-inline">full-stack web developer</span>
			</Col>
			</Row>
			
			
		</Container>
	)
}