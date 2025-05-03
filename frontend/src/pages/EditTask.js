// src/pages/EditTask.js
import React, {  useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
//const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = 'https://backend-439597190473.us-central1.run.app';

const EditTask = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [originalTask, setOriginalTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'LOW',
    status: 'TODO',
    tags: '',
  });
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      setError('');

      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${apiUrl}/tasks?user_id=${user.user_id}`);
      const tasks = await res.json();
  
      const task = tasks.find((t) => t.title.toLowerCase() === searchTitle.toLowerCase());
  
      if (!task) {
        setError('task with that title not found.');
        setOriginalTask(null);
        return;
      }
  
      let tags = [];
      try {
        const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
        const tagData = await tagRes.json();
        tags = tagData.tags || [];
      } catch (tagErr) {
        console.error('error fetching tags:', tagErr);
      }
  
      const taskWithTags = { ...task, tags };
  
      setOriginalTask(taskWithTags);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date?.slice(0, 10) || '',
        priority: task.priority || 'LOW',
        status: task.status || 'TODO',
        tags: tags.join(', ') || '',
      });
    } catch (err) {
      console.error('error searching for task:', err);
      setError('error searching for task');
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (originalTask == null) return;
  
    const updates = {};
    const originalTags = (originalTask.tags || []).map(t => t.trim().toLowerCase());
    const newTags = formData.tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  
    const tagsToAdd = newTags.filter(tag => !originalTags.includes(tag));
    const tagsToRemove = originalTags.filter(tag => !newTags.includes(tag));
  
    Object.keys(formData).forEach((key) => {
      if (key === 'tags') return;
  
      const originalValue =
        key === 'due_date'
          ? originalTask.due_date?.slice(0, 10)
          : originalTask[key];
  
      if (formData[key] !== originalValue) {
        updates[key] = formData[key];
      }
    });
  
    try {
      if (Object.keys(updates).length > 0) {
        const res = await fetch(`${apiUrl}/tasks/${originalTask._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
  
        const updated = await res.json();
        if (!updated._id) {
          alert('failed to update task');
          return;
        }
      }
  
      if (tagsToAdd.length > 0) {
        await fetch(`${apiUrl}/tasks/${originalTask._id}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: tagsToAdd.join(',') }),
        });
      }
  
      for (const tag of tagsToRemove) {
        await fetch(`${apiUrl}/tasks/${originalTask._id}/tags`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagName: tag }),
        });
      }
  
      navigate('/home');
    } catch (err) {
      console.error('update failed:', err);
      alert('update failed');
    }
  };
  
  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h2>Edit a Task</h2>

        <input
          type="text"
          placeholder="Enter task title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <button onClick={handleSearch} style={{ marginLeft: '10px' }}>Search</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {originalTask && (
          <form onSubmit={handleUpdate} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            width: '250px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            marginTop: '10px',
              marginBottom: '10px',
          }}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
            /><br /><br />

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            /><br /><br />

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
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

            {originalTask?.tags?.length > 0 && (
  <p style={{ fontSize: '12px', color: 'gray' }}>
    Previous tags: {originalTask.tags.join(', ')}
  </p>
)}

            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder={
                 'Tags (comma separated)'
              }
            /><br /><br />

            <button type="submit">Update Task</button>
          </form>
        )}
      </div>
    </>
  );
};

export default EditTask;
