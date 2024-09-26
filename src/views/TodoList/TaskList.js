import React from 'react'
import { FaArrowDown, FaArrowUp, FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { useTasks } from '../../hooks/useApiHooks';
import { DeleteConfirmationModal } from '../../components/Modal/DeleteConfirmationModal';

const TaskList = () => (
    const { tasks, isLoading, error, addTask, updateTask, deleteTask } = useTasks();

    <div>
        <h1 className="mb-4">Todo List</h1>
        <Button variant="primary" onClick={() => setIsAdding(true)} className="mb-3">
            <FaPlus /> Add New Task
        </Button>
        <ListGroup>
            {tasks.sort((a, b) => a.order - b.order).map((task, index) => (
                <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => updateTask({ ...task, completed: !task.completed })}
                            label={
                                <span
                                    className={task.completed ? 'text-muted text-decoration-line-through' : ''}
                                    onClick={() => setSelectedTaskId(task.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {task.title}
                                </span>
                            }
                            inline
                        />
                    </div>
                    <div>
                        <Button variant="light" size="sm" onClick={() => moveTask(index, -1)} disabled={index === 0} className="me-1">
                            <FaArrowUp />
                        </Button>
                        <Button variant="light" size="sm" onClick={() => moveTask(index, 1)} disabled={index === tasks.length - 1} className="me-1">
                            <FaArrowDown />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(task)}>
                            <FaTrash />
                        </Button>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
        <DeleteConfirmationModal />
    </div>
);

export default TaskList