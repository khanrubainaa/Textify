
import './App.css';
import React, { useState } from 'react';

import Navbar from './components/Navbar';
import Alert from './components/Alert';
import BackToTop from './components/BackToTop';

import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import AboutPage from './pages/AboutPage';
import Profile from './pages/Profile';
import TextDiffChecker from './pages/TextDiffChecker';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

function App() {
  const [mode, setMode] = useState('dark');
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const adminEmail = 'abc@mail.com';
  const adminPassword = '654321';

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';

    setMode(newMode);
    document.title = `Textify - ${newMode} Mode`;

    showAlert(`${newMode} mode enabled`);
  };

  const changePage = (newPage) => {
    if (newPage === 'home-editor') {
      setPage('home');

      setTimeout(() => {
        document.getElementById('text-editor')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } else {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRegister = (newUser) => {
    const users =
      JSON.parse(localStorage.getItem('textifyUsers')) || [];

    const existingUser = users.find(
      (user) => user.email?.toLowerCase() === newUser.email.toLowerCase()
    );

    if (existingUser) {
      showAlert('Email already registered!', 'danger');
      return;
    }

    users.push(newUser);

    localStorage.setItem('textifyUsers', JSON.stringify(users));

    showAlert('Registration successful! Please login.');
    setPage('login');
  };

  const handleLogin = (email, password) => {
    if (
      email.trim().toLowerCase() === adminEmail &&
      password === adminPassword
    ) {
      const adminUser = {
        name: 'Rubaina',
        email: adminEmail,
        password: adminPassword
      };

      const users =
        JSON.parse(localStorage.getItem('textifyUsers')) || [];

      const adminExists = users.some(
        (user) => user.email?.toLowerCase() === adminEmail
      );

      if (!adminExists) {
        users.push(adminUser);
        localStorage.setItem('textifyUsers', JSON.stringify(users));
      }

      const loginActivity =
        JSON.parse(localStorage.getItem('textifyLoginActivity')) || [];

      loginActivity.unshift({
        id: Date.now(),
        name: 'Rubaina',
        email: adminEmail,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });

      localStorage.setItem(
        'textifyLoginActivity',
        JSON.stringify(loginActivity)
      );

      setLoggedIn(true);
      setCurrentUser(adminUser);
      setPage('home');
      showAlert('Admin login successful!');
      return;
    }

    const users =
      JSON.parse(localStorage.getItem('textifyUsers')) || [];

    const user = users.find(
      (user) =>
        user.email?.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password
    );

    if (user) {
      const loginActivity =
        JSON.parse(localStorage.getItem('textifyLoginActivity')) || [];

      loginActivity.unshift({
        id: Date.now(),
        name: user.name,
        email: user.email,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });

      localStorage.setItem(
        'textifyLoginActivity',
        JSON.stringify(loginActivity)
      );

      setLoggedIn(true);
      setCurrentUser(user);
      setPage('home');
      showAlert('Login successful!');
    } else {
      showAlert('Invalid email or password!', 'danger');
    }
  };

  const handleForgotPassword = (email, newPassword) => {
    const users =
      JSON.parse(localStorage.getItem('textifyUsers')) || [];

    const userIndex = users.findIndex(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (userIndex === -1) {
      showAlert('No account found with this email!', 'danger');
      return;
    }

    users[userIndex].password = newPassword;

    localStorage.setItem('textifyUsers', JSON.stringify(users));

    showAlert('Password updated successfully! Please login.');
    setPage('login');
  };

  const handleUpdateProfile = (updatedDetails) => {
    const users =
      JSON.parse(localStorage.getItem('textifyUsers')) || [];

    const newEmail = updatedDetails.email.trim().toLowerCase();
    const oldEmail = currentUser.email.toLowerCase();

    const existingEmail = users.find(
      (user) =>
        user.email?.toLowerCase() === newEmail &&
        user.email?.toLowerCase() !== oldEmail
    );

    if (existingEmail) {
      showAlert('This email is already registered!', 'danger');
      return;
    }

    const userIndex = users.findIndex(
      (user) => user.email?.toLowerCase() === oldEmail
    );

    if (userIndex === -1) {
      showAlert('User account not found!', 'danger');
      return;
    }

    const oldId = encodeURIComponent(oldEmail);
    const newId = encodeURIComponent(newEmail);

    ['textifyText', 'textifyHistory'].forEach((key) => {
      const oldKey = `${key}_${oldId}`;
      const newKey = `${key}_${newId}`;

      const oldData = localStorage.getItem(oldKey);

      if (oldData !== null) {
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(oldKey);
      }
    });

    users[userIndex] = {
      ...users[userIndex],
      ...updatedDetails,
      email: newEmail
    };

    localStorage.setItem('textifyUsers', JSON.stringify(users));

    setCurrentUser(users[userIndex]);

    showAlert('Profile updated successfully!');
    setPage('home');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    setPage('login');
    showAlert('Logged out successfully!');
  };

  return (
    <div className={`app ${mode}-mode`}>
      <Alert alert={alert} />

      {!loggedIn ? (
        page === 'register' ? (
          <Register
            handleRegister={handleRegister}
            changePage={changePage}
          />
        ) : page === 'forgot' ? (
          <ForgotPassword
            handleForgotPassword={handleForgotPassword}
            changePage={changePage}
          />
        ) : (
          <Login
            handleLogin={handleLogin}
            changePage={changePage}
          />
        )
      ) : (
        <>
          <Navbar
            mode={mode}
            toggleMode={toggleMode}
            changePage={changePage}
            currentUser={currentUser}
            handleLogout={handleLogout}
            currentPage={page}
          />

          {page === 'dashboard' && (
            <Dashboard
              changePage={changePage}
              currentUser={currentUser}
            />
          )}

          {page === 'home' && (
            <Home
              showAlert={showAlert}
              changePage={changePage}
              currentUser={currentUser}
            />
          )}


          {page === 'features' && (
            <Features changePage={changePage} />
          )}

          {page === 'diff' && <TextDiffChecker />}

          {page === 'how' && <HowItWorks />}

          {page === 'about' && <AboutPage />}

          {page === 'profile' && (
            <Profile
              currentUser={currentUser}
              handleUpdateProfile={handleUpdateProfile}
            />
          )}

          <footer className="footer">
            <h3>Textify</h3>
            <p>Make every word count.</p>
            <p>© 2026 Textify. All rights reserved.</p>
          </footer>
        </>
      )}

      <BackToTop />
    </div>
  );
}

export default App;
