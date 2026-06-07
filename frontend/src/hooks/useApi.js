import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/projects`);
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (data) => {
    const res = await axios.post(`${API_URL}/api/projects`, data);
    setProjects(prev => [res.data, ...prev]);
    return res.data;
  };

  const updateProject = async (id, data) => {
    const res = await axios.put(`${API_URL}/api/projects/${id}`, data);
    setProjects(prev => prev.map(p => p._id === id ? res.data : p));
    return res.data;
  };

  const deleteProject = async (id) => {
    await axios.delete(`${API_URL}/api/projects/${id}`);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject };
};

export const useTasks = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/tasks?project=${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (data) => {
    const res = await axios.post(`${API_URL}/api/tasks`, { ...data, project: projectId });
    setTasks(prev => [...prev, res.data]);
    return res.data;
  };

  const updateTask = async (id, data) => {
    const res = await axios.put(`${API_URL}/api/tasks/${id}`, data);
    setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    return res.data;
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/api/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask };
};