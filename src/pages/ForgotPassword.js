import React, { useState } from 'react';

export default function ForgotPassword({ handleForgotPassword, changePage }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    handleForgotPassword(
      email.trim().toLowerCase(),
      password
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Reset Password</h1>
        <p>Enter your email and create a new password.</p>

        <form onSubmit={handleSubmit}>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button type="submit" className="auth-btn">
            Reset Password
          </button>

        </form>

        <p className="auth-switch">
          Remember your password?
          <button onClick={() => changePage('login')}>
            Login
          </button>
        </p>

      </div>
    </div>
  );
}