import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
export default function Tags({data}){
	const [tagArray, setTagArray] = useState([]);
	useEffect(()=>{
		let tagArray = data.map(tag => {
			let tagLink = tag.toLowerCase().replace(" ","_");
			return (
					<Link to={`/tags/${tagLink}`} className="tag mx-2 mb-2"><span className="">{tag}</span></Link>
				)
		}) 
		setTagArray(tagArray);
	},[])
	return(
		<div className="d-flex flex-wrap">Tags: {tagArray}</div>
	)
}