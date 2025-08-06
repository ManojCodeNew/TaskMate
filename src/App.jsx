import React from 'react';
import NavBar from './components/Navbar';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';
import Menu from './components/Menu.jsx';
import { Routes, Route } from 'react-router-dom';
import AddTask from './Pages/AddTask/AddTask.jsx';

function App() {
  return (
    <>
      <NavBar />
      <Menu />

      {/* Routes */}
      <div className="ml-64 p-4">
        <Routes>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path='/add-task' element={<AddTask />} />
          {/* <Route path='/drawing-tool' element={<DrawingTool/>}/> */}
          {/* <Route path='/ai-assistant' element={<AIAssistant/>}/> */}
          {/* <Route path="/timer" element={<Timer />} /> */}
          {/* <Route path="/voice-notes" element={<VoiceNotes />} /> */}
          {/* <Route path="*" element={<NotFoundPage>} /> */}





        </Routes>
      </div>
      {/* <main className="p-4 ml-64 mt-16"> */}
      <Dashboard />
      {/* </main> */}
    </>
  );
}


export default App;
