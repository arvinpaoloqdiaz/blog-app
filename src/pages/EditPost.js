import {Container, Form, Button} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import {useParams ,useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import UserContext from "../UserContext";
import "../App.css";
export default function EditPost({data, getPosts}){
		const {postId} = useParams();
		const navigate = useNavigate();
		const [title, setTitle] = useState("");
		const [author, setAuthor] = useState("");
		const [content, setContent] = useState("");
		const [unformattedTags, setUnformattedTags] = useState("");
		const [tags, setTags] = useState([]);

		

		const editPost = (e) => {
			e.preventDefault();				
			fetch(`${process.env.REACT_APP_API_URL}/blog/${postId}/edit`,{
				method:"PUT",
				headers:{
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`
				},
				body: JSON.stringify({
					title,
					author,
					content,
					tags,
					lastEdit:new Date()
				})
			})
			.then(res => res.json())
			.then(data => {
				if(data.message ==="Success"){
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

		const retrievePost = (postId) => {

			fetch(`${process.env.REACT_APP_API_URL}/blog/${postId}`)
			.then(res => res.json())
			.then(data => {
				setTitle(data.result.title);
				setAuthor(data.result.author);
				setContent(data.result.content);
				setUnformattedTags(data.result.tags.toString());
			})
		}
		useEffect(()=>{
			retrievePost(postId)
		},[])
		useEffect(() => {
	    if (unformattedTags !== "") {
	      setTags(unformattedTags.split(",").map((tag) => tag.trim()));
	    }
	  }, [unformattedTags]);
		return(

			<Container className="width-container px-5">
			<Form onSubmit={(e)=>editPost(e)}>
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
				<Button className="btn btn-accent my-4 " type="submit" id="submitBtn">Submit</Button>
			</Form>
			</Container>
		)
}