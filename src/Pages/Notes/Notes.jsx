import React from 'react'
import NotesCard from './NotesCard'

function Notes() {
    return (
        <div className="space-y-6 p-6">
            <section className="flex justify-center items-center bg-gray-50 p-2 rounded-2xl">
                <div className="px-2 text-center">
                    <h1 className="bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 font-extrabold text-transparent text-3xl sm:text-4xl">
                        Notes
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base">
                        Capture your thoughts, ideas, and reminders
                    </p>
                </div>
            </section>
            <div >
                <NotesCard />
            </div>

        </div>
    )
}

export default Notes
