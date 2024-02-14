import {Container} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import * as DOMPurify from "dompurify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {Link, useParams} from "react-router-dom";
import DeletePost from "../components/DeletePost";
import Tags from "../components/Tags";

import UserContext from "../UserContext";
import "../App.css";
export default function SinglePost({data,getPosts}){
	const {user} = useContext(UserContext);
	const [publishDate, setPublishDate] = useState([]);
	const [editedDate, setEditedDate] = useState([]);
	function changeFormat(datetime){
		const newDate = new Date(datetime);
		const options = {
		  timeZone: "Asia/Manila",
		  year: 'numeric',
		  month: 'long',
		  day: 'numeric',
		  hour: 'numeric',
		  minute: 'numeric',
		  second: 'numeric'
		};

		const formatted = new Intl.DateTimeFormat('en-US', options).format(newDate).split(" at ");
		return formatted;
	}
	useEffect(()=>{
		setPublishDate(changeFormat(data.publishedOn));
		setEditedDate(changeFormat(data.lastEdit));
	},[])
	return(
		
		<Container className="bg-main card__home position-relative my-3 px-5 py-3">
		<div className="d-flex">
			<h1><Link to={`/${data._id}`} className="text-contrast-link">{data.title}</Link></h1>
			
		</div>
		<h5>by: {data.author}</h5>
		<div>
		<span>{publishDate[0]} at {publishDate[1]}</span>
		<span className="float-end">Last Edit: {editedDate[0]} at {editedDate[1]}</span>
		</div>
		<hr/>
		<div className="mt-auto">
		<Tags data={data.tags}/>
		</div>
		</Container>
		
	

	)
}