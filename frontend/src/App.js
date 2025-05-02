import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import Home from './pages/Home'
import NewTask from './pages/NewTask';
import EditTask from './pages/EditTask';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path ="/" element = {<Login />} />
      <Route path ="/home" element = {<Home />} />
      <Route path="/new-task" element={<NewTask />} />
      <Route path="/edit-task/" element={<EditTask />} />
      <Route path ="/reports" element = {<Reports />} />


    </Routes>
  )
}