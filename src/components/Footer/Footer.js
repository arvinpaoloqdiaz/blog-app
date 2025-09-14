import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faGithub, faCodepen } from "@fortawesome/free-brands-svg-icons";
import { faA } from "@fortawesome/free-solid-svg-icons";

import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { href: "https://apqdiaz.site/", icon: faA, label: "Portfolio", cls: "portfolio" },
    { href: "https://www.linkedin.com/in/arvin-paolo-diaz/", icon: faLinkedin, label: "LinkedIn", cls: "linkedin" },
    { href: "https://github.com/arvinpaoloqdiaz", icon: faGithub, label: "GitHub", cls: "github" },
    { href: "https://codepen.io/Arvin-Paolo-Diaz", icon: faCodepen, label: "CodePen", cls: "codepen" }
  ];

  return (
    <footer className={styles.footer}>
      <Container fluid className="pt-3 mt-auto">
        <Row>
          {/* Left column: About */}
          <Col xs={12} md={6} className="d-flex justify-content-center">
            <div className={styles.aboutWrapper}>
              <h5 className={styles.aboutSmall}>About Me</h5>
              <h2 className={styles.bigHeading}>
                Passionate Full-Stack Developer. <br />
                I build modern web apps. <br />
                Always learning & improving.
              </h2>
            </div>
          </Col>

          {/* Right column: Contact + Links */}
          <Col xs={12} md={6} className="d-flex justify-content-center">
            <div className={styles.contactWrapper}>
              <h3 className={styles.contactTitle}>Let’s Connect</h3>
              <p className={styles.contactLine}>📞 +63 927 322 2484</p>
              <p className={styles.contactLine}>
                📧 <a className={styles.mailLink} href="mailto:arvinpaoloq.diaz@gmail.com">
                  arvinpaoloq.diaz@gmail.com
                </a>
              </p>

              <h3 className={styles.linksTitle}>Find Me Online</h3>
              <div className={styles.socials}>
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`${styles.socialLink} ${styles[s.cls]}`}
                  >
                    <FontAwesomeIcon icon={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          </Col>

          {/* Bottom line */}
          <Col xs={12} className="text-center my-1">
            <span className={`d-none d-md-inline ${styles.bottomText}`}>Arvin Paolo Diaz</span>
            <span className={`d-none d-md-inline ${styles.separator}`}>|</span>
            <span className={styles.bottomText}>
              &copy; {year}
            </span>
            <span className={`${styles.separator} d-none d-md-inline`}>|</span>
            <span className={`d-none d-md-inline ${styles.bottomText}`} style={{ marginLeft: 6 }}>
              Full-Stack Web Developer
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
