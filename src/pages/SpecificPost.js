import {Container} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import * as DOMPurify from "dompurify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {Link ,useParams, useNavigate} from "react-router-dom";
import DeletePost from "../components/DeletePost";
import Post from "../components/Post";

import UserContext from "../UserContext";
import "../App.css";
export default function SpecificPost(){
	const navigate = useNavigate();
	const {postId} = useParams();
	const [blogPosts, setBlogPosts] = useState([]);

	function getPosts(){
		fetch(`${process.env.REACT_APP_API_URL}/blog/${postId}`)
			.then(res => res.json())
			.then(data => {
				setBlogPosts(<Post data={data.result} key ={data.result._id} getPosts={getPosts}/>);	
			})
	}
	useEffect(()=>{
		getPosts()
	},[])
	return(
		<>
		{blogPosts}
		</>
	)
}