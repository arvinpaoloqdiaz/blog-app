import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import UserContext from '../../UserContext';
import styles from './Register.module.css';

export default function Register() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isActive, setIsActive] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    setIsActive(
      firstName && lastName && email && password && confirmPassword && password === confirmPassword
    );
  }, [formData]);

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: 'Register Successful',
          icon: 'success',
          text: 'User Successfully Registered!'
        });
        navigate('/login');
      } else {
        Swal.fire({
          title: 'Registration Failed',
          icon: 'error',
          text: data.message || 'Email is already in use!'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        icon: 'error',
        text: 'Something went wrong!'
      });
    }

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return user.id ? (
    <Navigate to="/" />
  ) : (
    <Container className={styles.registerContainer}>
      <Form onSubmit={registerUser}>
        <h1 className={styles.registerHeader}>Register</h1>

        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>First Name</Form.Label>
          <Form.Control
            className={styles.formControl}
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter First Name"
            required
          />
        </Form.Group>

        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Last Name</Form.Label>
          <Form.Control
            className={styles.formControl}
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter Last Name"
            required
          />
        </Form.Group>

        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Email</Form.Label>
          <Form.Control
            className={styles.formControl}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            required
          />
        </Form.Group>

        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Password</Form.Label>
          <Form.Control
            className={styles.formControl}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Password"
            required
          />
        </Form.Group>

        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>Confirm Password</Form.Label>
          <Form.Control
            className={styles.formControl}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
        </Form.Group>

        <div className={styles.toRight}>
          Already have an account? <Link className={styles.loginLink} to="/login">Login here</Link>
        </div>

        <Button
          className={`${styles.submitBtn} ${isActive ? 'btn-accent' : 'btn-secondary'}`}
          type="submit"
          disabled={!isActive}
        >
          Submit
        </Button>

        {/* Google Login Button */}
        <a
          href={`${process.env.REACT_APP_API_URL}/v1/auth/google`}
          className="btn btn-outline-light w-100 mt-2"
        >
          Login with Google
        </a>
      </Form>
    </Container>
  );
}
