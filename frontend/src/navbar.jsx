import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("token")
);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setIsLoggedIn(false);

  alert("Logout Successfully!");

  navigate("/login");
};
{isLoggedIn ? (
  <button
    className="btn btn-danger rounded-pill px-4"
    onClick={handleLogout}
  >
    Logout
  </button>
) : (
  <>
    <button
      className="btn btn-outline-light me-2"
      onClick={() => navigate("/login")}
    >
      Login
    </button>

    <button
      className="btn btn-primary rounded-pill"
      onClick={() => navigate("/register")}
    >
      Create Account
    </button>
  </>
)}