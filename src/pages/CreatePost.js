import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import UserContext from '../UserContext';

export default function CreatePost (){
	const navigate = useNavigate();
	const {user,setUser} = useContext(UserContext);
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [content, setContent] = useState("");
	const [unformattedTags, setUnformattedTags] = useState("");
	const [tags, setTags] = useState([]);
	const [isActive, setIsActive] = useState(false);

	const createPost = (e) => {
		e.preventDefault();				
		fetch(`${process.env.REACT_APP_API_URL}/blog/create`,{
			method:"POST",
			headers:{
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`
			},
			body: JSON.stringify({
				title,
				author,
				content,
				tags
			})
		})
		.then(res => res.json())
		.then(data => {
			if(data.message ==="Created"){
				Swal.fire({
				title: "Post Created!",
				icon: "success",
				text: "successfully posted!"
			});
				navigate("/");
			}else{
				Swal.fire({
				title: "Error",
				icon: "error",
				text: "something went wrong!"
			});
			}
		})
	}

	const retrieveUserDetails = () => {

		fetch(`${process.env.REACT_APP_API_URL}/users/get-detail`,{
			headers:{
				Authorization: `Bearer ${localStorage.getItem("token")}`
			}
		})
		.then(res => res.json())
		.then(data => {

			setAuthor(`${data.user.firstName} ${data.user.lastName}`);
		})
	}
	useEffect(()=>{
		if(title !== "" && content !== ""){
			setIsActive(true)
		}else{
			setIsActive(false)
		}
	},[title,content,tags])
	useEffect(()=>{
		retrieveUserDetails()
	},[])
	useEffect(() => {
    if (unformattedTags !== "") {
      setTags(unformattedTags.split(",").map((tag) => tag.trim()));
    }
  }, [unformattedTags]);
	return(
		(!user.isAdmin)?
		<Navigate to="/"/>
		:
		<Container className="width-container px-5">
		<Form onSubmit={(e)=>createPost(e)}>
			<h1 className="mt-5 text-center pt-3 poppins fw-bold text-accent">Create Post</h1>
			<Form.Group controlId="postTitle">
			<Form.Label>Title</Form.Label>
			<Form.Control
				type="text"
				placeholder="Enter Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				required				
			/>
			</Form.Group>
			<Form.Group controlId="postAuthor">
			<Form.Label>Author</Form.Label>
			<Form.Control
				type="text"
				placeholder="Author"
				value={author}
				onChange={(e) => setAuthor(e.target.value)}
				required
				readOnly
			/>
			</Form.Group>
			<Form.Group controlId="postContent">
			<Form.Label>Content</Form.Label>
			<Form.Control
				as="textarea"
				rows={5}
				placeholder="Content here  . . . "
				value={content}
				onChange={(e) => setContent(e.target.value)}
				required
			/>
			</Form.Group>
			<Form.Group controlId="postTags">
			<Form.Label>Tags:</Form.Label>
			<Form.Control
				type="text"
				placeholder="Separate Tags by comma (tag1, tag2)"
				value={unformattedTags}
				onChange={(e) => setUnformattedTags(e.target.value)}
			/>
			</Form.Group>
			{isActive ?
			<Button className="btn btn-accent my-4 " type="submit" id="submitBtn">Submit</Button>
			:
			<Button className="btn btn-secondary my-4" type="submit" id="submitBtn" disabled>Submit</Button>

			}
		</Form>
		</Container>
	)
}