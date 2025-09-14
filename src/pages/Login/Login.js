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
        title: 'Login Successful',
        icon: 'success',
        text: 'Welcome back!'
      });

      navigate('/', { replace: true });
    } else if (error) {
      Swal.fire({
        title: 'Google Login Failed',
        icon: 'error',
        text:
          error === 'unauthorized'
            ? 'This email is not authorized.'
            : 'Something went wrong. Please try again.'
      });

      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  // ✅ Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        retrieveUserDetails(data.data.token);

        Swal.fire({
          title: 'Login Successful',
          icon: 'success',
          text: 'Welcome back!'
        });
      } else {
        Swal.fire({
          title: 'Authentication failed',
          icon: 'error',
          text: 'Check your login details and try again.'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        icon: 'error',
        text: 'Something went wrong. Please try again.'
      });
    }
    setEmail('');
    setPassword('');
  };

  // ✅ Get user details after login
  const retrieveUserDetails = async (token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/v1/users/me`, {
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
    window.location.href = `${process.env.REACT_APP_API_URL}/v1/auth/google`;
  };

  useEffect(() => {
    setIsActive(email !== '' && password !== '');
  }, [email, password]);

  return user.id ? (
    <Navigate to="/" />
  ) : (
    <Container className={styles.loginContainer}>
      <Form onSubmit={handleSubmit}>
        <h1 className={styles.loginHeader}>Login</h1>

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

        {/* <div className={styles.toRight}>
          Don't have an account?{' '}
          <Link className={styles.loginLink} to="/register">
            Register here
          </Link>
        </div> */}

        <Button
          className={`${styles.submitBtn} ${
            isActive ? 'btn-danger' : 'btn-secondary'
          }`}
          type="submit"
          disabled={!isActive}
        >
          Submit
        </Button>

        {/* Google Icon Button */}
        <Button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
        >
          <FontAwesomeIcon icon={faGoogle} className={styles.googleIcon} />
         
        </Button>
      </Form>
    </Container>
  );
}
