import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import Swal from 'sweetalert2';

import UserContext from '../../UserContext';
import styles from './Login.module.css';

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Check if we were redirected from Google with token or error
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      retrieveUserDetails(token);

      Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Login Successful',
        icon: 'success',
        text: 'Welcome back!',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      navigate('/', { replace: true });
    } else if (error) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Google Login Failed',
        icon: 'error',
        text:
          error === 'unauthorized'
            ? 'This email is not authorized.'
            : 'Something went wrong. Please try again.',
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      navigate('/u-arvin', { replace: true });
    }
  }, [location, navigate]);

  // ✅ Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        retrieveUserDetails(data.data.token);

        Swal.fire({
          toast: true,
          position: 'top-end',
          title: 'Login Successful',
          icon: 'success',
          text: 'Welcome back!',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          toast: true,
          position: 'top-end',
          title: 'Authentication failed',
          icon: 'error',
          text: 'Check your login details and try again.',
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Error',
        icon: 'error',
        text: 'Something went wrong. Please try again.',
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
    setEmail('');
    setPassword('');
  };

  // ✅ Get user details after login
  const retrieveUserDetails = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      setUser({
        id: data.data?._id || null,
        isAdmin: data.data?.isAdmin || null,
        token
      });
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  // ✅ Trigger Google login flow
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/v1/auth/google`;
  };

  useEffect(() => {
    setIsActive(email !== '' && password !== '');
  }, [email, password]);

  return user.id ? (
    <Navigate to="/" />
  ) : (
    <Container className={styles.loginContainer}>
      <h1 className={styles.loginHeader}>Login</h1>
      {import.meta.env.VITE_APP_ENV !== 'production' && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Email</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
            />
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Password</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </Form.Group>

          <Button
            className={`${styles.submitBtn} ${
              isActive ? 'btn-danger' : 'btn-secondary'
            }`}
            type="submit"
            disabled={!isActive}
          >
            Submit
          </Button>
        </Form>
      )}

      {import.meta.env.VITE_APP_ENV === 'production' && (
        <p className={styles.productionNotice} style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Sign in with your authorized Google account to continue.
        </p>
      )}

      {/* Google Icon Button */}
      <Button
        type="button"
        className={styles.googleBtn}
        onClick={handleGoogleLogin}
      >
        <FontAwesomeIcon icon={faGoogle} className={styles.googleIcon} />
      </Button>
    </Container>
  );
}
