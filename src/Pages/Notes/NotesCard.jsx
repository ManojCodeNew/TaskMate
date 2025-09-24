import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import AddNotes from './AddNotes';
import { useContext } from 'react';
import { NotesContext } from '../../context/NotesProvider';
import { useNavigate } from 'react-router-dom';
function NotesCard() {
    const [showAddNote, setShowAddNote] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchNotes, notes: fetchedNotes, deleteNote } = useContext(NotesContext);

    //Fetch at once
    useEffect(() => {
        const loadNotes = async () => {
            setLoading(true);
            await fetchNotes();
            setLoading(false);
        };
        loadNotes();
    }, [])

    return (
        <div className="bg-white shadow-lg hover:shadow-xl p-5 border border-gray-100 rounded-2xl transition">
            {/* Add Notes Btn calls */}
            {
                showAddNote ? (
                    <AddNotes />
                ) : (
                    <>
                        {/* Header */}
                        < div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
                            <h2 className="bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700 font-bold text-transparent text-xl sm:text-2xl">
                                Notes
                            </h2>

                            <button className="flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-500 shadow-md px-4 py-2 rounded-xl font-medium text-white transition cursor-pointer"
                                onClick={() => {
                                    showAddNote ? setShowAddNote(false) : setShowAddNote(true);
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Note
                            </button>
                        </div>

                        {/* Divider */}
                        <hr className="my-4 border-gray-200" />

                        {/* Notes Card */}
                        {!isLoading && (
                            <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
                                {fetchedNotes?.map((note, index) => {
                                    const createdAt = new Date(note.created_at).toLocaleString();
                                    const updatedAt = new Date(note.updated_at).toLocaleString();

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white shadow-md hover:shadow-lg p-4 border border-gray-100 rounded-xl transition"
                                        >
                                            {/* Title */}
                                            <h3 className="mb-2 font-semibold text-gray-800 text-lg">
                                                {note.title}
                                            </h3>

                                            {/* Content Preview */}
                                            <div
                                                className="text-gray-600 hover:text-gray-800 text-sm leading-relaxed transition cursor-pointer"
                                                onClick={() => navigate(`/notes/edit/${note.note_id}`)}
                                            >
                                                <div dangerouslySetInnerHTML={{
                                                    __html: note.content.length > 100
                                                        ? note.content.substring(0, 100) + '...'
                                                        : note.content
                                                }} />
                                            </div>

                                            {/* Footer */}
                                            <div className="flex justify-between items-center mt-4 text-gray-400 text-xs">
                                                {/* Left side → Date */}
                                                <span>
                                                    Created: {createdAt} <br />
                                                    Updated: {updatedAt}
                                                </span>

                                                {/* Right side → Buttons */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => navigate(`/notes/edit/${note.note_id}`)}
                                                        className="hover:bg-gray-200 p-2 rounded text-teal-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteNote(note.note_id)}
                                                        className="hover:bg-gray-200 p-2 rounded text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!isLoading && fetchedNotes?.length === 0 && (
                            <div className="py-10 text-center">
                                <p className="text-gray-500 text-sm sm:text-base">
                                    No notes yet. Click <span className="font-medium text-teal-600">Add Note</span> to create one.
                                </p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="py-10 text-center">
                                <p className="text-gray-500">Loading notes...</p>
                            </div>
                        )}
                    </>
                )
            }
        </div >


    )
}

export default NotesCard
