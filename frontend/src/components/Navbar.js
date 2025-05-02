import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        {user && (
          <>
          <li>
            Todo List of {user.email}
          </li>
            <li>
              <Link to="/new-task">Create Task</Link>
            </li>
             <li>
              <Link to="/edit-task">Edit Task</Link>
            </li>
            <li>
              <Link to="/reports">Reports</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
           
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;