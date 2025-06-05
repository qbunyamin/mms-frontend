import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DocumentForm from './pages/DocumentForm';
import DocumentList from './pages/DocumentList';
import ProjectSummary from './pages/ProjectSummary';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/design/documents" element={<DocumentForm />} />
          <Route path="/design/list" element={<DocumentList />} />
          <Route path="/projects/summary" element={<ProjectSummary />} />
        </Routes>
      </Router>

    </>
  )
}

export default App
