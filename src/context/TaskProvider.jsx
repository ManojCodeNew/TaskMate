import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getToken } = useAuth();

    const getUserToken = async () => {
        const token = await getToken({ template: 'supabase' });
        return token;
    };

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getUserToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch tasks');

            const data = await response.json();
            console.log("Fetched tasks:", data);
            
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Add new task
    const addTask = async (taskData) => {
        try {
            const token = await getUserToken();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) throw new Error('Failed to add task');

            const newTask = await response.json();
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Update task
    const updateTask = async (taskId, updateData) => {
        try {
            const token = await getUserToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...updateData,
                    updated_at: new Date().toISOString()
                }),
            });

            // Log the response status and body for debugging
            console.log('Update response status:', response.status);
            const responseData = await response.json();
            console.log('Update response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update task');
            }

            setTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, ...responseData } : task
            ));
            return responseData;
        } catch (err) {
            console.error('Detailed update error:', {
                message: err.message,
                stack: err.stack,
                taskId,
                updateData
            });
            setError(err.message);
            throw err;
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        try {
            const token = await getUserToken();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete task');

            setTasks(prev => prev.filter(task => task.id !== taskId));
            return true;
        } catch (err) {
            console.error('Error deleting task:', err);
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            error,
            fetchTasks,
            addTask,
            updateTask,
            deleteTask
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};