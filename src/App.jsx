import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Callback from './pages/Callback'
import Apply from './pages/Apply'
import Status from './pages/Status'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <Router basename="/nacionmx-postulaciones">
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
