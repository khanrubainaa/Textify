import React, { useState } from 'react';

export default function Login({ handleLogin, changePage }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email.trim().toLowerCase(), password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome Back!</h1>
        <p>Login to continue using Textify.</p>

        <form onSubmit={handleSubmit}>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="password-toggle">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          <p className="auth-switch">
            <button
              type="button"
              onClick={() => changePage('forgot')}
            >
              Forgot Password?
            </button>
          </p>

          <button type="submit" className="auth-btn">
            Login
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?
          <button onClick={() => changePage('register')}>
            Register
          </button>
        </p>

      </div>
    </div>
  );
}