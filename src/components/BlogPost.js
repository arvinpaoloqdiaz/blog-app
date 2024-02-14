import {Container, Pagination} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import * as DOMPurify from "dompurify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {Link, useSearchParams, useNavigate} from "react-router-dom";
import DeletePost from "./DeletePost";
import SinglePost from "./SinglePost";

import UserContext from "../UserContext";
import "../App.css";
export default function BlogPost(){
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [blogPosts, setBlogPosts] = useState([]);
	const [activePage, setActivePage] = useState(1);
	const [items, setItems] = useState([]);
	function goToPage(num){
		navigate(`/?page=${num}`);
		setActivePage(num);
	}
	function paginate(pages, activePage){
		let active=activePage;
		let itemNumber = [];
		for (let number = 1; number <= pages; number++) {
		  itemNumber.push(
		    <Pagination.Item key={number} active={number === active} onClick={()=>{goToPage(number);}}>
		      {number}
		    </Pagination.Item>,
		  );
		}
		setItems(itemNumber);
	}
	function getPosts(){
		fetch(`${process.env.REACT_APP_API_URL}/blog/posts/?page=${activePage}`)
			.then(res => res.json())
			.then(data => {
				let posts = data.result.posts.map((post)=>{
					return (
						<SinglePost data={post} key ={post._id} getPosts={getPosts}/>
						)
				})
				setBlogPosts(posts);
				
				paginate(Math.ceil(data.result.totalPosts/5),activePage);	
			})
	}
	useEffect(()=>{
		getPosts();
		
	},[activePage])
	return(
		<>
		{blogPosts}
		<Container className="d-flex justify-content-center">
		<Pagination>{items}</Pagination>
		</Container>
		</>
	)
}