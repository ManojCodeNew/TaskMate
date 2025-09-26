import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import TaskMateLoading from '../Loading/TaskMateLoading';

const DrawingsList = () => {
    const [drawings, setDrawings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDrawings();
    }, []);

    const fetchDrawings = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://localhost:3000/api/drawings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDrawings(data);
            }
        } catch (error) {
            console.error('Error fetching drawings:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteDrawing = async (id) => {
        if (!confirm('Are you sure you want to delete this drawing?')) return;

        try {
            const token = await getToken();
            const response = await fetch(`http://localhost:3000/api/drawings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                setDrawings(drawings.filter(d => d.id !== id));
            }
        } catch (error) {
            console.error('Error deleting drawing:', error);
        }
    };

    // if (loading) {
    //     return <div className="flex justify-center items-center h-64">Loading...</div>;
    // }

    return (
        <>
            {loading ? (
                <TaskMateLoading />
            ) : (
                <div className="p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="font-bold text-2xl">My Drawings</h1>
                        <button
                            onClick={() => navigate('/drawing-board')}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
                        >
                            <FaPlus /> New Drawing
                        </button>
                    </div>

                    {drawings.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="mb-4 text-gray-500">No drawings yet</p>
                            <button
                                onClick={() => navigate('/drawing-board')}
                                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white"
                            >
                                Create Your First Drawing
                            </button>
                        </div>
                    ) : (
                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {drawings.map((drawing) => (
                                <div key={drawing.id} className="bg-white shadow-md p-4 border rounded-lg">
                                    <h3 className="mb-2 font-semibold text-lg">{drawing.title}</h3>
                                    <p className="mb-4 text-gray-500 text-sm">
                                        {new Date(drawing.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/drawing-board/${drawing.id}`)}
                                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-sm"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => deleteDrawing(drawing.id)}
                                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default DrawingsList;