import React from 'react'

function NotesCard() {
    return (
        <div className="bg-white shadow-md p-4 rounded-lg">
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
                {/* Title */}
                <h2 className="bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700 font-bold text-transparent text-xl sm:text-2xl">
                    Notes Card
                </h2>
                <div className="float-right bg-teal-600 hover:bg-teal-500 p-2 rounded-lg w-32 font-semibold text-white text-right cursor-pointer">
                    Add New Note
                </div>
            </div>
            <hr className='mt-4 text-gray-200' />
            <div>
                <div>
                    <p className="mt-4 px-1.5 text-gray-600">No notes available. Click "Add New Note" to create one.</p>
                </div>
                <div></div>
            </div>
        </div>

    )
}

export default NotesCard
