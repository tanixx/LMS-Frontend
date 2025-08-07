import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("Please fill in both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      const token = response.data.token;
      localStorage.setItem("token", token);

      const userResponse = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const roles = userResponse.data.roles;
      localStorage.setItem("roles", JSON.stringify(roles));

      if (roles.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else if (roles.includes("ROLE_MEMBER")) {
        navigate("/member/dashboard");
      } else {
        alert("Unknown role.");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Inline styles
  const containerStyle = {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f2f2f2',
  };

  const formStyle = {
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    width: '300px',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: loading ? '#aaa' : '#4CAF50',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
  };

  const headingStyle = {
    marginBottom: '20px',
  };

  return (
  <div style={containerStyle}>
    <h1 style={{ 
      position: 'absolute',
      top: '50px',
      textAlign: 'center',
      width: '100%',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333'
    }}>
      Welcome to Digital Library Portal
    </h1>

    <form style={formStyle} onSubmit={handleLogin}>
      <h2 style={headingStyle}>Login</h2>
      <input
        autoFocus
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
        required
        style={inputStyle}
      />
      <input
        value={password}
        type="password"
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
        style={inputStyle}
      />
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  </div>
);

}

export default LoginForm;
