import {Container} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import * as DOMPurify from "dompurify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {Link, useParams} from "react-router-dom";
import DeletePost from "../components/DeletePost";

import UserContext from "../UserContext";
import "../App.css";
export default function Post({data,getPosts}){
	const {user} = useContext(UserContext);
	const [publishDate, setPublishDate] = useState([]);
	const [editedDate, setEditedDate] = useState([]);
	const [tagArray , setTagArray] = useState([]);
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
		let tagArr = data.tags.map(tag => {
			return (
				<span className="tag mx-2 mb-2">{tag}</span>
			)
		})
		setTagArray(tagArr);
	},[])
	return(
		
		<Container className="bg-main card position-relative my-3 px-5 py-3">
		<div className="d-flex">
			<h1><Link to={`/${data._id}`} className="text-contrast-link">{data.title}</Link></h1>
			{(user.isAdmin)?
				<Link to={`/${data._id}/edit`} className="ms-auto btn-accent">Edit</Link>
				:
				<></>}
		</div>
		<h5>by: {data.author}</h5>
		<div>
		<span>{publishDate[0]} at {publishDate[1]}</span>
		<span className="float-end">Last Edit: {editedDate[0]} at {editedDate[1]}</span>
		</div>
		<hr/>
		<p className="content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(data.content)}}/>
		<div className="mt-auto">
		<hr/>
		<div className="d-flex flex-wrap">Tags: {tagArray}</div>
		</div>
		{
			(user.isAdmin)
			?<DeletePost getPosts={getPosts} data={data}/>
			:<></>
		}
		
		</Container>
		
	

	)
}