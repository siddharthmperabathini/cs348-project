import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = 'https://backend-439597190473.us-central1.run.app';


const Login = () => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [signUpemail, setSignUpEmail] = useState('');
  const [signUpuser, setSignUpUser] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email && user) {
      try {
        console.log('API URL:', apiUrl);

        const response = await fetch(`${apiUrl}/users?email=` + email);
        
        const data = await response.json();
        console.log(data)
        if (data.user_id !== 0) {
          localStorage.setItem('user', JSON.stringify({ user_id: data.user_id, name: data.name, email }));
          navigate('/home');
        } else {
          alert('user not found');
        }
      }catch (err) {
        console.error('error fetching user:', err);
        alert('error fetching user');
      }
    } else {
      alert('invalid credentials');
    }
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (signUpemail && signUpuser) {
      try {
        const response = await fetch(`${apiUrl}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: signUpuser, email: signUpemail }),
        });
  
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('user', JSON.stringify({
            user_id: data._id,
            email: signUpemail,
            name: signUpuser,
          }));
          alert('User created successfully, Please log in');
          navigate('/');
        } else if (response.status === 500) {
          alert('This email already exists. Please log in instead.');
        } else {
          alert('Error creating user.');
        }
      } catch (err) {
        console.error('error creating user:', err);
        alert('Network or server error while creating user.');
      }
    } else {
      alert('Please enter valid credentials');
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-center">To Do List</h2>
      <form onSubmit={handleLogin} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2"
        >
          Login
        </button>
      </form>
  
      <h3 className="text-2xl font-semibold text-center"> Sign up</h3>
      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={signUpuser}
          onChange={(e) => setSignUpUser(e.target.value)}
          className="w-full px-4 py-2 border"
        />
        <input
          type="email"
          placeholder="Email"
          value={signUpemail}
          onChange={(e) => setSignUpEmail(e.target.value)}
          className="w-full px-4 py-2 border"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Login;
