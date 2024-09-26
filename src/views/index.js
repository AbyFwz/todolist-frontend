import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaTrash, FaEdit, FaArrowLeft, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {  TasksProvider, useTasks, useTask } from '../hooks/useApiHooks';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

const TodoListContent = () => {
    const { tasks, isLoading, error, addTask, updateTask, deleteTask } = useTasks();
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const moveTask = async (index, direction) => {
        if ((direction === -1 && index > 0) || (direction === 1 && index < tasks.length - 1)) {
            const newTasks = [...tasks];
            const [movedTask] = newTasks.splice(index, 1);
            newTasks.splice(index + direction, 0, movedTask);

            const updatedTasks = newTasks.map((task, i) => ({
                ...task,
                order: i
            }));

            for (const task of updatedTasks) {
                await updateTask(task);
            }
        }
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (taskToDelete) {
            await deleteTask(taskToDelete.id);
            setShowDeleteModal(false);
            setTaskToDelete(null);
        }
    };

    const DeleteConfirmationModal = () => (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the task "{taskToDelete?.title}"?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteConfirm}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );

    const TaskList = () => (
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

    const TaskDetail = () => {
        const { task, updateTask: updateSingleTask } = useTask(selectedTaskId);
        const [editMode, setEditMode] = useState(false);
        const [editedTitle, setEditedTitle] = useState(task ? task.title : '');
        const [editedDescription, setEditedDescription] = useState(task ? task.description : '');

        if (!task) return null;

        const handleSave = async () => {
            await updateSingleTask({ ...task, title: editedTitle, description: editedDescription });
            setEditMode(false);
        };

        return (
            <div>
                <Button variant="link" onClick={() => setSelectedTaskId(null)} className="mb-3">
                    <FaArrowLeft /> Back to List
                </Button>
                {editMode ? (
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" onClick={handleSave}>Save</Button>
                    </Form>
                ) : (
                    <div>
                        <h2>{task.title}</h2>
                        <p>{task.description}</p>
                        <Button variant="primary" onClick={() => {
                            setEditedTitle(task.title);
                            setEditedDescription(task.description);
                            setEditMode(true);
                        }} className="me-2">
                            <FaEdit /> Edit
                        </Button>
                        <Button
                            variant={task.completed ? "outline-success" : "success"}
                            onClick={() => updateSingleTask({ ...task, completed: !task.completed })}
                        >
                            <FaCheck /> {task.completed ? "Mark Incomplete" : "Mark Complete"}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const AddTask = () => {
        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (title.trim()) {
                await addTask({ title, description, completed: false, order: tasks.length });
                setIsAdding(false);
            }
        };

        return (
            <div>
                <Button variant="link" onClick={() => setIsAdding(false)} className="mb-3">
                    <FaArrowLeft /> Back to List
                </Button>
                <h2>Add New Task</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description"
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">Add Task</Button>
                </Form>
            </div>
        );
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container className="mt-5">
            <Row>
                <Col md={8} className="mx-auto">
                    {isAdding ? <AddTask /> : selectedTaskId ? <TaskDetail /> : <TaskList />}
                </Col>
            </Row>
        </Container>
    );
};

const TodoList = () => (
    <TasksProvider>
        <TodoListContent />
    </TasksProvider>
);

export default TodoList;