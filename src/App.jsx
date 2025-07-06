import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import './App.css'
import './index.css'

function App() {

  return (
    <div className='flex flex-col bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen text-gray-800'>
      <Navbar />
      <main className="flex-1 p-6">
        <div className="bg-white shadow-md p-6 rounded-xl">
          <h1 className="mb-4 font-bold text-2xl">Welcome to TaskMate</h1>
          <p>Plan. Track. Achieve your goals with ease.</p>
        </div>
      </main>

      {/* Optional Footer */}
      <footer className="py-4 text-gray-600 text-sm text-center">
        © 2025 TaskMate • Smart Productivity App
      </footer>
    </div>

  )
}

export default App
