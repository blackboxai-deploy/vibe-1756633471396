import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import { Plus } from 'lucide-react';

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { user } = useAuth();

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/notes/', {
        withCredentials: true
      });
      setNotes(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to view your notes');
      } else {
        setError('Failed to fetch notes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const handleCreateNote = async (noteData) => {
    try {
      const response = await axios.post('http://localhost:8000/notes/', noteData, {
        withCredentials: true
      });
      setNotes([response.data, ...notes]);
      setShowForm(false);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to create note');
    }
  };

  const handleUpdateNote = async (id, noteData) => {
    try {
      const response = await axios.put(`http://localhost:8000/notes/${id}`, noteData, {
        withCredentials: true
      });
      setNotes(notes.map(note => note.id === id ? response.data : note));
      setEditingNote(null);
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/notes/${id}`, {
        withCredentials: true
      });
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please login to view your notes</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingNote && (
        <div className="mb-6">
          <NoteForm
            note={editingNote}
            onSubmit={(data) => handleUpdateNote(editingNote.id, data)}
            onCancel={() => setEditingNote(null)}
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => setEditingNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;