import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
const apiUrl = process.env.REACT_APP_API_URL;

const NewTask = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'LOW',
    status: 'TODO',
    tags: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user == null) {
      navigate('/');
    } else {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser.user_id);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const cleanedTags = formData.tags
      .split(/[, ]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  
    const taskData = {
      ...formData,
      user_id: userId,
      tags: [] 
    };
  
    try {
      const response = await fetch(`${apiUrl}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
  
      const createdTask = await response.json();
  
      if (createdTask._id == null) {
        alert('failed to create task');
        return;
      }
  
      if (cleanedTags.length > 0) {
        await fetch(`${apiUrl}/tasks/${createdTask._id}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tags: cleanedTags.join(',') })
        });
      }
        navigate('/home');
    } catch (err) {
      console.error('error creating task:', err);
      alert('failed to create task');
    }
  };
  

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          width: '250px',
          marginTop: '10px',
              marginBottom: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
        }}
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          /><br /><br />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          /><br /><br />

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
          /><br /><br />

          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select><br /><br />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select><br /><br />

          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
          /><br /><br />

          <button type="submit">Create Task</button>
        </form>
      </div>
    </>
  );
};

export default NewTask;
