import React from 'react';
import NavBar from './components/Navbar';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';

function App() {
  return (
    <>
      <NavBar />
      <main className="p-4">
        <Dashboard />
      </main>
    </>
  );
}

export default App;
