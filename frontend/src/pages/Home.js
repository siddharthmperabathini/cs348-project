import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = React.useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser == null) {
      navigate('/');
    } else {
      const { user_id } = JSON.parse(storedUser);
      fetchTasks(user_id);
    }
  }, [navigate]);


const fetchTasks = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const response = await fetch(`http://localhost:4000/tasks?user_id=${user.user_id}`);
      const data = await response.json();
      const tasksWithTags = await Promise.all(
        data.map(async (task) => {
          const tagRes = await fetch(`http://localhost:4000/tasks/${task._id}/tags`);
          const tagData = await tagRes.json();
          return { ...task, tags: tagData.tags || [] };
        })
      );
      setTasks(tasksWithTags);

      //setTasks(data);
    }
  } catch (error) {
    console.error('error fetching users tasks:', error);
  }}


  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId));
      } else {
        console.error('error deleting task:', response.statusText);
      }
    } catch (error) {
      console.error('error deleting task:', error);
    }
  }



  return (
    <div>
      <Navbar />
    <div>
      
      

      {tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        <ul style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          padding: 0,
          listStyle: 'none',
        }}>
          {tasks.map((task) => (
            <li key={task._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              paddingTop: '10px',
              marginTop: '10px',
              marginBottom: '10px',
              width: '250px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
            }}
            >
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <p>Due Date: {new Date(task.due_date).toLocaleDateString()}</p>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
              <p>Tags: {task.tags?.join(', ') || 'None'}</p>

              <button onClick={() => handleDelete(task._id)} style={{ color: 'white', backgroundColor: 'red', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
        Delete
      </button>
            </li>
          ))}
        </ul>
      )}
              

    </div>
    </div>
  );
};

export default Home;
