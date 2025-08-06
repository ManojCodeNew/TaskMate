import React from 'react';
import NavBar from './components/Navbar';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';
import Menu from './components/Menu.jsx';

function App() {
  return (
    <>
      <NavBar />
      <Menu />
      {/* <main className="p-4 ml-64 mt-16"> */}
        <Dashboard />
      {/* </main> */}
    </>
  );
}


export default App;
