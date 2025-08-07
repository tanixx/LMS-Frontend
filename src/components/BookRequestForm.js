// components/BookRequestForm.js
import { useState } from 'react';
import api from '../services/api';

function BookRequestForm() {
  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    isbn: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/book-request/request", form);
      alert("Request submitted!");
    } catch (err) {
      alert("Failed to submit request");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} required />
      <input placeholder="Author" onChange={e => setForm({ ...form, author: e.target.value })} required />
      <input placeholder="Category" onChange={e => setForm({ ...form, category: e.target.value })} required />
      <input placeholder="ISBN" onChange={e => setForm({ ...form, isbn: e.target.value })} required />
      <button type="submit">Request Book</button>
    </form>
  );
}
export default BookRequestForm;
