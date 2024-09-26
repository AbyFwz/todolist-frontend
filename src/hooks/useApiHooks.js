import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
            setError(null);
        } catch (e) {
            setError('Failed to fetch tasks');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (task) => {
        try {
            const response = await api.post('/tasks', task);
            setTasks(prevTasks => [...prevTasks, response.data]);
            console.log("Responses: ",response.data)
            return response.data;
        } catch (e) {
            setError('Failed to add task');
            console.error(e);
            throw e;
        }
    };

    const updateTask = async (task) => {
        try {
            const response = await api.put(`/tasks/${task.id}`, task);
            setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? response.data : t));
            return response.data;
        } catch (e) {
            setError('Failed to update task');
            console.error(e);
            throw e;
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
        } catch (e) {
            setError('Failed to delete task');
            console.error(e);
            throw e;
        }
    };

    return (
        <TasksContext.Provider value={{ tasks, isLoading, error, addTask, updateTask, deleteTask, refetch: fetchTasks }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};

export const useTask = (id) => {
    const { tasks, updateTask } = useTasks();
    const task = tasks.find(t => t.id === id);

    return {
        task,
        updateTask: async (updatedTask) => {
            await updateTask(updatedTask);
        }
    };
};