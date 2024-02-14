import {useParams, Link} from "react-router-dom";
import {useState, useEffect} from "react";
import SinglePost from "../components/SinglePost";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft } from '@fortawesome/free-solid-svg-icons';
export default function TagResults(){
	const {tag} = useParams();
	const [posts,setPosts] = useState([]);

	function pascalCase(input){
		if (['HTML','CSS'].includes(input.toUpperCase())){
			return input.toUpperCase();
		}
		return input.split("_").map(entry => entry.charAt(0).toUpperCase()+entry.slice(1)).join(" ");
	}
	function getResults(){
		fetch(`${process.env.REACT_APP_API_URL}/blog/tags/${tag}`)
			.then(res => res.json())
			.then(data => {
				let posts = data.map((post)=>{
					return (
						<SinglePost data={post} key ={post._id} getPosts={getResults}/>
						)
				})
				setPosts(posts);
			})
	}
	useEffect(() => {
		getResults()
	},[tag])
	return(
		<>
		<h1 className="text-center">Viewing posts with tag: <span className="text-accent2">{pascalCase(tag)}</span> </h1>
		<Link to={"/"} className="mx-3 px-lg-5 back__arrow"><FontAwesomeIcon icon={faArrowLeft}/><span className="ms-2 back__text">Back to Home</span></Link>
		{posts}
		</>
	)
}