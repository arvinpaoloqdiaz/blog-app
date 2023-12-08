import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Navigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import UserContext from '../UserContext';

export default function Login (){

	const {user,setUser} = useContext(UserContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isActive, setIsActive] = useState(false);

	function userLogin(e){
		e.preventDefault();
		fetch(`${process.env.REACT_APP_API_URL}/users/login`,{
			method:"POST",
			headers:{
				"Content-Type":"application/json"
			},
			body:JSON.stringify({
				email:email,
				password:password
			})
		})
		.then(res => res.json())
		.then(data => {
			console.log(data)
			if(typeof data.access !== "undefined"){
			localStorage.setItem("token", data.access);
			
			retrieveUserDetails(data.access);

			setUser({
				access:localStorage.getItem("token")
			})
			console.log(user)
			Swal.fire({
				title: "Login Succesful",
				icon: "success",
				text: "Welcome to iGlasses"
			});
		} else {
			Swal.fire({
				title: "Authentication failed",
				icon: "error",
				text: "Check your login details and try again."
			});

		}
		})
		setEmail("");
		setPassword("");
	}

	const retrieveUserDetails = (token) => {

		fetch(`${process.env.REACT_APP_API_URL}/users/get-detail`,{
			headers:{
				Authorization: `Bearer ${token}`
			}
		})
		.then(res => res.json())
		.then(data => {

			setUser({
				id:data.user_id,
				isAdmin:data.user.isAdmin
			})
		})
	}
	useEffect(() => {
		if(email !== '' && password !== ''){
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [email,password]);

	return(
		(user.id !== null)?
		<Navigate to="/"/>
		:
		<Container className="width-container px-5">
		<Form onSubmit ={(e) => userLogin(e)}>
			<h1 className="mt-5 text-center pt-3 poppins fw-bold text-accent">Login</h1>
			<Form.Group controlId="userEmail">
			<Form.Label>Email address</Form.Label>
			<Form.Control
				type="email"
				placeholder="Enter email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required				
			/>
			</Form.Group>
			<Form.Group controlId="userPassword">
			<Form.Label>Password</Form.Label>
			<Form.Control
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			</Form.Group>
			<div className="to-right mt-2">
			Dont have an account? <Link to="/register" className="text-contrast-link">Register here</Link>
			</div>
			{isActive ?
			<Button className="btn btn-accent my-4 " type="submit" id="submitBtn">Submit</Button>
			:
			<Button className="btn btn-secondary my-4" type="submit" id="submitBtn" disabled>Submit</Button>

			}
		</Form>
		</Container>
	)
}