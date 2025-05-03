import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

function Reports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [completionPercentageByDate, setCompletionPercentageByDate] = useState(0);
  const [totalTasksToComplete, setTotalTasksToComplete] = useState(0);
const [averageDaysUntilDue, setAverageDaysUntilDue] = useState(0);
const [userTags, setUserTags] = useState([]);
const [selectedTag, setSelectedTag] = useState(''); // ✅ this holds selected tag
const apiUrl = process.env.REACT_APP_API_URL;


const handleReportChange = (event) => {
  const reportType = event.target.value;
  setSelectedReport(reportType);

  if (reportType === "summary") {
    fetchCompletedTasks();
    fetchIncompleteTasks();
    fetchOverdueTasks();
  } 
  else if (reportType === "tags") {
    setSelectedTag(''); // reset selected tag
    fetchAllTagsForUser();
    fetchAverageTasksPerTag(); // ✅ NEW
    fetchMostUsedTag();        // ✅ NEW
  }
};

const handleSelectTag = (e) => {
  const selected = e.target.value;
  setSelectedTag(selected);

  if (selected) {
    fetchTagRank(selected);
    fetchAveragePriorityForTag(selected);
    fetchTasksBySelectedTag(selected); // ✅ NEW LINE: fetch tasks for this tag
  } else {
    setTasksBySelectedTag([]); // 🧹 Clear if no tag is selected
  }
};





  const handleSubmitDateRange = async () => {
    setCompletedTasks([]);
    setIncompleteTasks([]);
    setCompletionPercentageByDate(0);
    setTotalTasksToComplete(0);
    setAverageDaysUntilDue(0);
  
    await fetchCompletedTasksByDate();
    await fetchIncompleteTasksByDate();
    await fetchCompletionPercentageByDate();
    await fetchTotalTasksToComplete();
    await fetchAverageDaysUntilDue();
    await fetchAllTagsForUser();
  };
  
  
  
  const fetchCompletedTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const response = await fetch(`${apiUrl}/tasks/completed?user_id=${user.user_id}`);
        const data = await response.json();
        const tasksWithTags = await Promise.all(
          data.map(async (task) => {
            const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
            const tagData = await tagRes.json();
            return { ...task, tags: tagData.tags || [] };
          })
        );
        setCompletedTasks(tasksWithTags);
      }
    } catch (error) {
      console.error('error fetching completed tasks:', error);
    }
  };

  const fetchIncompleteTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const response = await fetch(`${apiUrl}/tasks/incomplete?user_id=${user.user_id}`);
        const data = await response.json();
        const tasksWithTags = await Promise.all(
          data.map(async (task) => {
            const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
            const tagData = await tagRes.json();
            return { ...task, tags: tagData.tags || [] };
          })
        );
        setIncompleteTasks(tasksWithTags);
      }
    } catch (error) {
      console.error('error fetching incomplete tasks:', error);
    }
  };


  const fetchOverdueTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const response = await fetch(`${apiUrl}/tasks/overdue?user_id=${user.user_id}`);
        const data = await response.json();
        const tasksWithTags = await Promise.all(
          data.map(async (task) => {
            const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
            const tagData = await tagRes.json();
            return { ...task, tags: tagData.tags || [] };
          })
        );
        setOverdueTasks(tasksWithTags);
      }
    } catch (error) {
      console.error('error fetching overdue tasks:', error);
    }
  };
   

  const calculateAverageOverdueDays = () => {
    if (overdueTasks.length === 0) return 0;
  
    const today = new Date();
    const totalOverdueDays = overdueTasks.reduce((sum, task) => {
      const dueDate = new Date(task.due_date);
      const diffTime = today - dueDate; // in milliseconds
      const diffDays = diffTime / (1000 * 60 * 60 * 24); // convert to days
      return sum + diffDays;
    }, 0);
  
    const average = totalOverdueDays / overdueTasks.length;
    return Math.round(average);
  };
  const fetchCompletedTasksByDate = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && startDate && endDate) {
        const response = await fetch(`${apiUrl}/tasks/completedByDate?user_id=${user.user_id}&startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        const tasksWithTags = await Promise.all(
          data.map(async (task) => {
            const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
            const tagData = await tagRes.json();
            return { ...task, tags: tagData.tags || [] };
          })
        );
        setCompletedTasks(tasksWithTags);
      }
    } catch (error) {
      console.error('error fetching completed tasks by date:', error);
    }
  };
  const fetchIncompleteTasksByDate = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && startDate && endDate) {
        const response = await fetch(`${apiUrl}/tasks/incompleteByDate?user_id=${user.user_id}&startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        const tasksWithTags = await Promise.all(
          data.map(async (task) => {
            const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
            const tagData = await tagRes.json();
            return { ...task, tags: tagData.tags || [] };
          })
        );
        setIncompleteTasks(tasksWithTags);
      }
    } catch (error) {
      console.error('error fetching incomplete tasks by date:', error);
    }
  };
  const fetchCompletionPercentageByDate = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && startDate && endDate) {
        const response = await fetch(`${apiUrl}/tasks/completionPercentageByDate?user_id=${user.user_id}&startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        setCompletionPercentageByDate(Math.round(data.completionPercentage));
      }
    } catch (error) {
      console.error('error fetching completion percentage by date:', error);
    }
  };

  
  const fetchTotalTasksToComplete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && endDate) {
        const response = await fetch(`${apiUrl}/tasks/countUntilDueDate?user_id=${user.user_id}&endDate=${endDate}`);
        const data = await response.json();
        setTotalTasksToComplete(data.totalTasksToComplete || 0);
      }
    } catch (error) {
      console.error('Error fetching total tasks to complete:', error);
    }
  };
  
  const fetchAverageDaysUntilDue = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && endDate) {
        const response = await fetch(`${apiUrl}/tasks/averageDaysUntilDue?user_id=${user.user_id}&endDate=${endDate}`);
        const data = await response.json();
        setAverageDaysUntilDue(Math.round(data.averageDaysUntilDue || 0));
      }
    } catch (error) {
      console.error('Error fetching average days until due:', error);
    }
  };
  const fetchAllTagsForUser = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        console.error('No user found');
        return;
      }
  
      // Step 1: Fetch all tasks for the user
      const tasksRes = await fetch(`${apiUrl}/tasks?user_id=${user.user_id}`);
      const tasksData = await tasksRes.json();
  
      // Step 2: Fetch all tags for each task
      const allTagsSet = new Set();
  
      await Promise.all(
        tasksData.map(async (task) => {
          const tagRes = await fetch(`${apiUrl}/tasks/${task._id}/tags`);
          const tagData = await tagRes.json();
          if (tagData.tags && tagData.tags.length > 0) {
            tagData.tags.forEach(tag => allTagsSet.add(tag));
          }
        })
      );
  
      // Step 3: Save unique tags into state
      const allTagsArray = Array.from(allTagsSet);
      setUserTags(allTagsArray);
  
      // 📋 Console log the final array
      //console.log('All User Tags:', allTagsArray);
  
    } catch (error) {
      console.error('Error fetching all tags for user:', error);
    }
  };
  
  const [averageTasksPerTag, setAverageTasksPerTag] = useState(0);
  const [mostUsedTag, setMostUsedTag] = useState('');
  

  const fetchAverageTasksPerTag = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        console.error('No user found');
        return;
      }
  
      const response = await fetch(`${apiUrl}/tasks/averageTasksPerTag?user_id=${user.user_id}`);
      const data = await response.json();
      setAverageTasksPerTag(data.averageTasksPerTag || 0);
    } catch (error) {
      console.error('Error fetching average tasks per tag:', error);
    }
  };
  
  const fetchMostUsedTag = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        console.error('No user found');
        return;
      }
  
      const response = await fetch(`${apiUrl}/tasks/mostUsedTag?user_id=${user.user_id}`);
      const data = await response.json();
      setMostUsedTag(data.tagName || "None");
    } catch (error) {
      console.error('Error fetching most used tag:', error);
    }
  };
  
  const [tagRank, setTagRank] = useState(null);
  const [averagePriorityForTag, setAveragePriorityForTag] = useState(null);
  
  const fetchTagRank = async (tagName) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !tagName) {
        console.error('No user or tag selected');
        return;
      }
  
      const response = await fetch(`${apiUrl}/tasks/tagRank?user_id=${user.user_id}&tagName=${encodeURIComponent(tagName)}`);
      const data = await response.json();
      setTagRank(data.rank);
    } catch (error) {
      console.error('Error fetching tag rank:', error);
    }
  };
  const fetchAveragePriorityForTag = async (tagName) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !tagName) {
        console.error('No user or tag selected');
        return;
      }
  
      const response = await fetch(`${apiUrl}/tasks/averagePriorityByTag?user_id=${user.user_id}&tagName=${encodeURIComponent(tagName)}`);
      const data = await response.json();
      setAveragePriorityForTag(data.averagePriority);
    } catch (error) {
      console.error('Error fetching average priority for tag:', error);
    }
  };
  const [tasksBySelectedTag, setTasksBySelectedTag] = useState([]);



  const fetchTasksBySelectedTag = async (tagName) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !tagName) {
        console.error('No user or tag selected');
        return;
      }
  
      const response = await fetch(`${apiUrl}/tasks/byTag?user_id=${user.user_id}&tagName=${encodeURIComponent(tagName)}`);
      const data = await response.json();
      setTasksBySelectedTag(data);
    } catch (error) {
      console.error('Error fetching tasks by tag:', error);
    }
  };  












  return (
    <>
      <Navbar />
      <div className="p-6">
        {/* Dropdown */}
        <div className="mb-6">
          <label className="block mb-2 text-lg font-semibold">Select Report Type:</label>
          <select
            value={selectedReport}
            onChange={handleReportChange}
            className="border rounded p-2 w-64"
          >
            <option value="">-- Select a Report --</option>
            <option value="summary">Overall Summary of Tasks</option>
            <option value="dueDate">Tasks by Due Date Range</option>
            <option value="tags">Tasks by Tags</option>
          </select>
        </div>

        {/* Show different content based on selected report */}
        <div className="mt-6">
          
          {/* Show different content based on selected report */}
<div className="mt-6">
{selectedReport === "summary" && (
  <div>
    <h2 className="text-2xl font-bold mb-4">Overall Summary of Tasks</h2>

    {/* Completion Percentage */}
    <h3 className="text-xl font-bold mb-2">Completion Percentage</h3>
    <p className="text-lg mb-6">
      {completedTasks.length + incompleteTasks.length === 0
        ? "No tasks to calculate."
        : `${Math.round((completedTasks.length / (completedTasks.length + incompleteTasks.length)) * 100)}% completed`}
    </p>

    {/* Completed Tasks */}
    <h3 className="text-xl font-bold mb-2">Completed Tasks</h3>
    {completedTasks.length === 0 ? (
      <p>No completed tasks available.</p>
    ) : (
      <ul style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: 0,
        listStyle: 'none',
      }}>
        {completedTasks.map((task) => (
          <li key={task._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
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
          </li>
        ))}
      </ul>
    )}

    {/* Incomplete Tasks */}
    <h3 className="text-xl font-bold mt-8 mb-2">Incomplete Tasks</h3>
    {incompleteTasks.length === 0 ? (
      <p>No incomplete tasks available.</p>
    ) : (
      <ul style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: 0,
        listStyle: 'none',
      }}>
        {incompleteTasks.map((task) => (
          <li key={task._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
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
          </li>
        ))}
      </ul>
    )}

    {/* Overdue Tasks */}
    <h3 className="text-xl font-bold mt-8 mb-2">Overdue Tasks</h3>
    {overdueTasks.length === 0 ? (
      <p>No overdue tasks available.</p>
    ) : (
      <ul style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: 0,
        listStyle: 'none',
      }}>
        {overdueTasks.map((task) => (
          <li key={task._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
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
          </li>
        ))}
      </ul>
    )}

    {/* Average Days Overdue */}
<h3 className="text-xl font-bold mb-2 mt-8">Average Days Overdue</h3>
<p className="text-lg mb-6">
  {overdueTasks.length === 0
    ? "No overdue tasks to calculate."
    : `${calculateAverageOverdueDays()} days overdue on average`}
</p>

  </div>
)}

</div>

{selectedReport === "dueDate" && (
  <div>
    <h2 className="text-2xl font-bold mb-4">Tasks by Due Date Range</h2>

    {/* Start Date */}
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Start Date:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border rounded p-2"
      />
    </div>

    {/* End Date */}
    <div className="mb-4">
      <label className="block mb-2 font-semibold">End Date:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border rounded p-2"
      />
    </div>

    {/* Submit Button */}
    <button
      onClick={handleSubmitDateRange}
      className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
    >
      Submit
    </button>

    {/* Show Results After Submit */}
    {completedTasks.length > 0 || incompleteTasks.length > 0 ? (
      <div className="mt-10">

        {/* Completed Tasks */}
        <h3 className="text-xl font-bold mb-4">Completed Tasks</h3>
        {completedTasks.length === 0 ? (
          <p>No completed tasks in this range.</p>
        ) : (
          <ul style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            padding: 0,
            listStyle: 'none',
          }}>
            {completedTasks.map((task) => (
              <li key={task._id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
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
              </li>
            ))}
          </ul>
        )}

        {/* Incomplete Tasks */}
        <h3 className="text-xl font-bold mt-10 mb-4">Incomplete Tasks</h3>
        {incompleteTasks.length === 0 ? (
          <p>No incomplete tasks in this range.</p>
        ) : (
          <ul style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            padding: 0,
            listStyle: 'none',
          }}>
            {incompleteTasks.map((task) => (
              <li key={task._id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
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
              </li>
            ))}
          </ul>
        )}

        {/* Completion Percentage */}
        <h3 className="text-xl font-bold mt-10 mb-2">Completion Percentage:</h3>
        <p className="text-lg mb-6">
          {completionPercentageByDate}% completed
        </p>

        {/* Summary Numbers after date range search */}
<div className="mt-10">

{/* Total Tasks to Complete */}
<h3 className="text-xl font-bold mb-2">Total Tasks To Complete Until End Date:</h3>
<p className="text-lg mb-6">{totalTasksToComplete} task{totalTasksToComplete !== 1 ? "s" : ""} to finish</p>

{/* Average Days Until Due */}
<h3 className="text-xl font-bold mb-2">Average Days Until Due:</h3>
<p className="text-lg mb-6">
  {averageDaysUntilDue === 0 
    ? "No tasks due or already overdue" 
    : `${averageDaysUntilDue} day${averageDaysUntilDue !== 1 ? "s" : ""} until due`}
</p>

</div>

      </div>
    ) : (
      <div className="mt-6">
        <p>Select a date range and submit to see tasks.</p>
      </div>
    )}
  </div>
)}

{selectedReport === "tags" && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Tasks by Tags</h2>

    {/* Total number of tags */}
    <p className="mb-6">
      You have <strong>{userTags.length}</strong> unique tag{userTags.length !== 1 ? "s" : ""}.
    </p>

    {/* List of all tags */}
    {userTags.length > 0 && (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">All Your Tags:</h3>
        <ul className="list-disc list-inside ml-4">
          {userTags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>

        {/* Average Tasks Per Tag */}
        <h3 className="text-xl font-bold mb-2 mt-6">Average Tasks Per Tag:</h3>
        <p className="text-lg mb-6">
          {averageTasksPerTag ? `${averageTasksPerTag} tasks/tag` : "No tags found."}
        </p>

        {/* Most Used Tag */}
        <h3 className="text-xl font-bold mb-2">Most Used Tag:</h3>
        <p className="text-lg mb-6">
          {mostUsedTag ? mostUsedTag : "No tag used yet."}
        </p>
      </div>
    )}

    {/* Dropdown to select a tag */}
    <div className="mb-8">
      <label className="block mb-2 font-semibold">Select a Tag:</label>
      <select
        value={selectedTag}
        onChange={handleSelectTag} 
        className="border rounded p-2 w-64"
      >
        <option value="">-- Select a Tag --</option>
        {userTags.map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>

    {/* Show info about selected tag */}
    {selectedTag && (
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">Selected Tag Info:</h3>

        {/* Selected tag name */}
        <p className="text-lg mb-4"><strong>Tag:</strong> {selectedTag}</p>

        {/* Tag Rank */}
        <p className="text-lg mb-4">
          <strong>Tag Rank:</strong>{" "}
          {tagRank ? `#${tagRank} most used` : "Rank not available."}
        </p>

        {/* Average Priority */}
        <p className="text-lg mb-8">
          <strong>Average Priority:</strong>{" "}
          {averagePriorityForTag !== null 
            ? `${averagePriorityForTag} (1=LOW, 2=MEDIUM, 3=HIGH)` 
            : "Average priority not available."}
        </p>

        {/* Tasks linked to this tag */}
        <h3 className="text-xl font-bold mb-4">Tasks with Selected Tag:</h3>

        {tasksBySelectedTag.length === 0 ? (
          <p className="text-gray-500">No tasks with this tag.</p>
        ) : (
          <ul style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            padding: 0,
            listStyle: 'none',
          }}>
            {tasksBySelectedTag.map((task) => (
              <li key={task.task_id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  width: '250px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                }}
              >
                <h4 className="text-lg font-semibold">{task.title}</h4>
                <p>{task.description}</p>
                <p><strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
                <p><strong>Priority:</strong> {task.priority}</p>
                <p><strong>Status:</strong> {task.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
)}







        </div>
      </div>
    </>
  );
}

export default Reports;
