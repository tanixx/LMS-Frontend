import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import BookRequestForm from './components/BookRequestForm';
import LoginForm from './components/LoginForm';
import MemberDashboard from './components/MemberDashboard';

function App() {
  const [username, setUsername] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm onLogin={setUsername} />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/admin/Dashboard" element={<AdminDashboard />} />
        <Route path="/request" element={<BookRequestForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
