import {Container} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import * as DOMPurify from "dompurify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {Link} from "react-router-dom";
import DeletePost from "./DeletePost";
import Post from "./Post";

import UserContext from "../UserContext";
import "../App.css";
export default function BlogPost(){
	
	const [blogPosts, setBlogPosts] = useState([]);

	function getPosts(){
		fetch(`${process.env.REACT_APP_API_URL}/blog/posts`)
			.then(res => res.json())
			.then(data => {
				data.result.reverse()
				let posts = data.result.map((post)=>{
					return (
						<Post data={post} key ={post._id} getPosts={getPosts}/>
						)
				})
				setBlogPosts(posts);	
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