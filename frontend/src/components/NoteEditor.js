import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NoteEditor = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags ? note.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (note) {
        response = await axios.put(`/api/notes/${note.id}`, noteData, config);
      } else {
        response = await axios.post('/api/notes/', noteData, config);
      }

      if (onSave) {
        onSave(response.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to save note');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {note ? 'Edit Note' : 'Create New Note'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter note title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            placeholder="Enter note content"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tags separated by commas"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas (e.g., work, planning, important)
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;