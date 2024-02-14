import './App.css';
import AppNavbar from "./components/AppNavbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import SpecificPost from "./pages/SpecificPost";
import TagResults from "./pages/TagResults";

import { Container } from 'react-bootstrap';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserProvider } from './UserContext';


function App() {

  const [user,setUser] = useState({
    id: null,
    isAdmin:null,
    token:null
  });

  const unsetUser = () => {
    localStorage.clear();
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/users/get-detail`,{
      headers:{
        Authorization: `Bearer ${ localStorage.getItem('token') }`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (typeof data.user !== "undefined"){
        setUser({
          id:data.user._id,
          isAdmin:data.user.isAdmin,
          token:localStorage.getItem("token")
        });
      } else {
        setUser({
          id:null,
          isAdmin:null,
          token:localStorage.getItem("token")
        })
      }
    })
    console.log(user)
  },[]);
  return (
   <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
      <AppNavbar/>
        <Container fluid className="bg-main py-3 height">
            <Routes>
                <Route path="/login" exact="true" element={<Login/>}/>
                <Route path="/logout" exact="true" element={<Logout/>}/>
                <Route path="/register" exact="true" element={<Register/>}/>             
                <Route path="/create" exact="true" element={<CreatePost/>}/>             
                <Route path="/:postId/edit" element={<EditPost/>}/>                      
                <Route path="/:postId" element={<SpecificPost/>}/>                      
                <Route path="/" exact="true" element={<Home/>}/>    
                <Route path="/tags/:tag" element={<TagResults/>}/>         
            </Routes>
        </Container> 
      <Footer/>   
      </Router>
    </UserProvider>  
  );
}

export default App;
