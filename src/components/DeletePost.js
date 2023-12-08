import {Container} from "react-bootstrap";
import {useEffect, useState ,useContext} from "react";
import {useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2";
import UserContext from "../UserContext";
import "../App.css";
export default function DeletePost({data, getPosts, navigateTo}){
	const navigate = useNavigate();
		function deletePost(){
			const swalWithBootstrapButtons = Swal.mixin({
			  customClass: {
			    confirmButton: "btn btn-success mx-2",
			    cancelButton: "btn btn-danger mx-2"
			  },
			  buttonsStyling: false
			});
			swalWithBootstrapButtons.fire({
			  title: "Are you sure?",
			  text: "You want to delete this post?",
			  icon: "warning",
			  showCancelButton: true,
			  confirmButtonText: "Yes!",
			  cancelButtonText: "No!",
			  reverseButtons: true
			}).then((result) => {
		  if (result.isConfirmed) {
		  	fetch(`${process.env.REACT_APP_API_URL}/blog/${data._id}/delete`,{
				method:"DELETE",
				headers:{
					Authorization: `Bearer ${localStorage.getItem("token")}`
				}
			})
			.then(res => res.json())
			.then(data => {
				if(data.message==="Success"){
		  			swalWithBootstrapButtons.fire({
		  			  title: "Deleted!",
		  			  text: "Your post has been deleted!",
		  			  icon: "success"
		  			});
		  			navigate("/")
		  		} else {
		  			swalWithBootstrapButtons.fire({
		  			  title: "Error",
		  			  text: "Error occured, please try again",
		  			  icon: "error"
		  			});
		  		}
		  	})		    
		  } else if (
		    result.dismiss === Swal.DismissReason.cancel
		  ) {
		    swalWithBootstrapButtons.fire({
		      title: "Cancelled",
		      text: "Post not deleted!",
		      icon: "error"
		    });
		  }
		});
		}
	return(
		
		<button className="delete-blog-post shadow-none" onClick={()=>{deletePost();}}><FontAwesomeIcon icon={faCircleXmark} /></button>
	

	)
}