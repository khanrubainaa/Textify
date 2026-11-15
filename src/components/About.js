import './App.css';
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Alert from './components/Alert';

import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import AboutPage from './pages/AboutPage';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [mode, setMode] = useState('dark');
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState('home');

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('textifyCurrentUser')) || null;
  });

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.title = `Textify - ${newMode} Mode`;
    showAlert(`${newMode} mode enabled`);
  };

  const changePage = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegister = (newUser) => {
    const users = JSON.parse(localStorage.getItem('textifyUsers')) || [];

    const existingUser = users.find(
      user => user.email === newUser.email
    );

    if (existingUser) {
      showAlert('Email already registered!', 'error');
      return;
    }

    users.push(newUser);
    localStorage.setItem('textifyUsers', JSON.stringify(users));

    showAlert('Registration successful! Please login.');
    changePage('login');
  };

  const handleLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem('textifyUsers')) || [];

    const user = users.find(
      user => user.email === email && user.password === password
    );

    if (user) {
      const loggedInUser = {
        name: user.name,
        email: user.email
      };

      setCurrentUser(loggedInUser);

      localStorage.setItem(
        'textifyCurrentUser',
        JSON.stringify(loggedInUser)
      );

      showAlert(`Welcome back, ${user.name}!`);
      changePage('home');
    } else {
      showAlert('Invalid email or password!', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('textifyCurrentUser');
    showAlert('Logged out successfully!');
    changePage('home');
  };

  return (
    <div className={`app ${mode}-mode`}>
      <Navbar
        mode={mode}
        toggleMode={toggleMode}
        changePage={changePage}
        currentUser={currentUser}
        handleLogout={handleLogout}
      />

      <Alert alert={alert} />

      {page === 'home' && (
        <Home showAlert={showAlert} changePage={changePage} />
      )}

      {page === 'features' && <Features />}
      {page === 'how' && <HowItWorks />}
      {page === 'about' && <AboutPage />}

      {page === 'login' && (
        <Login
          handleLogin={handleLogin}
          changePage={changePage}
        />
      )}

      {page === 'register' && (
        <Register
          handleRegister={handleRegister}
          changePage={changePage}
        />
      )}

      <footer className="footer">
        <h3>Textify</h3>
        <p>Make every word count.</p>
        <p>© 2026 Textify. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;