import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AuthCallback from './pages/AuthCallback';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import EditEventPage from './pages/EditEventPage';
import LogsPage from './pages/LogsPage';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/success" element={<AuthCallback />} />
              <Route path="/auth/error" element={<AuthCallback />} />
              <Route path="/create" element={<CreateEventPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/my-events" element={<MyEventsPage />} />
              <Route path="/edit-event/:id" element={<EditEventPage />} />
              <Route path="/logs" element={<LogsPage />} />
              {/* Más rutas se agregarán aquí */}
            </Routes>
          </main>

          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;