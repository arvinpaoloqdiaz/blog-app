import { useEffect, useContext } from "react";
import {Container} from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import BlogPost from "../components/BlogPost/BlogPost";

export default function Home() {
  const { setUser } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Save token
      localStorage.setItem("token", token);

      // Fetch user details from API
      fetch(`${process.env.REACT_APP_API_URL}/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser({
            id: data.data?._id || null,
            isAdmin: data.data?.isAdmin || false,
            token,
          });
          // Remove token from URL
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.error("Failed to fetch user details:", err);
        });
    }
  }, [searchParams, setUser, navigate]);

  return <Container>
  <h1 className="mt-4">Plog Bosts</h1>
  <BlogPost />
  </Container>;
}
