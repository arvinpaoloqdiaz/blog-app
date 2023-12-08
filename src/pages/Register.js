import { useState, useEffect, useContext, } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Navigate,Link, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import Swal from "sweetalert2";

export default function Register() {

	const {user} = useContext(UserContext);
	const navigate= useNavigate();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	
	const [isActive, setIsActive] = useState(false);

	function registerUser(e) {

			// Prevents page redirection via form submission
			e.preventDefault();

			fetch(`${process.env.REACT_APP_API_URL}/users/register`,{

			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({

				firstName: firstName,
				lastName: lastName,
				email: email,
				password: password

			})
			})
			.then(res => res.json())
			.then(data => {
				console.log(data)
			if(data){

				Swal.fire({
					title: "Register Succesful",
					icon: "success",
					text: "User Successfully Registered!"
				});
				navigate("/login")
			} else {
				
				Swal.fire({
					title: "Authentication failed",
					icon: "error",
					text: "Email is Already in use!"
				});
			}
				setFirstName('');
				setLastName('');
				setEmail('');
				setPassword('');
				setConfirmPassword('');
			})
			
		}

	useEffect(() => {
		if((firstName !== "" && lastName !== "" && email !== "" && password !== "" && confirmPassword !== "") && (password === confirmPassword)){

			setIsActive(true)

		} else {

			setIsActive(false)
		}
	},[firstName,lastName,email,password,confirmPassword])

	return (
		(user.id !== null)?
		<Navigate to="/"/>
		:
		<Container className="width-container pt-3 pb-4 px-5">
		<Form onSubmit= {(e) => registerUser(e)}>
		<h1 className="text-center poppins fw-bold text-accent">Register</h1>
			<Form.Group>
				<Form.Label>First Name:</Form.Label>
				<Form.Control 
				type="text" 
				placeholder="Enter First Name" 
				required
				value={firstName}
				onChange={e => {setFirstName(e.target.value)}}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Last Name:</Form.Label>
				<Form.Control 
				type="text" 
				placeholder="Enter Last Name" 
				required
				value={lastName}
				onChange={e => {setLastName(e.target.value)}}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Email:</Form.Label>
				<Form.Control 
				type="email" 
				placeholder="Enter Email" 
				required
				value={email}
				onChange={e => {setEmail(e.target.value)}}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Password:</Form.Label>
				<Form.Control 
				type="password" 
				placeholder="Enter Password" 
				required
				value={password}
				onChange={e => {setPassword(e.target.value)}}
				/>
			</Form.Group>
			<Form.Group>
				<Form.Label>Confirm Password:</Form.Label>
				<Form.Control 
				type="password" 
				placeholder="Confirm Password" 
				required
				value={confirmPassword}
				onChange={e => {setConfirmPassword(e.target.value)}}
				/>
			</Form.Group>
			<div className="to-right mt-2">
			Already have an account? <Link to="/login" className="text-contrast-link">Login here</Link>
			</div>
			{
				isActive

				? <Button className="mt-3 btn-accent" type="submit">Submit</Button>

				: <Button className="mt-3 btn-secondary" disabled>Submit</Button>

			}
		</Form>
		</Container>
	)
}
