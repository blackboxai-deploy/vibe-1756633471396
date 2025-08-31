import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotesProvider } from './contexts/NotesContext';
import Login from './components/Login';
import Register from './components/Register';
import NotesList from './components/NotesList';
import NoteDetail from './components/NoteDetail';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <NotesList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes/:id"
                  element={
                    <ProtectedRoute>
                      <NoteDetail />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/notes" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </NotesProvider>
    </AuthProvider>
  );
}

export default App;