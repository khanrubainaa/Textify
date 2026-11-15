import React, { useState } from 'react';

export default function Navbar({
  mode,
  toggleMode,
  changePage,
  currentUser,
  handleLogout,
  currentPage
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const adminEmail = 'abc@mail.com';

  const isAdmin =
    currentUser?.email?.toLowerCase() === adminEmail;

  const handleNavigation = (page) => {
    changePage(page);
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setMenuOpen(false);
  };

  const getActiveClass = (page) =>
    currentPage === page ? 'active-nav' : '';

  return (
    <nav className={`navbar creative-navbar ${mode === 'dark' ? 'navbar-dark' : 'navbar-light'}`}>
      <div className="navbar-container">

        <h2 className="logo" onClick={() => handleNavigation('home')}>
          Textify
        </h2>

        <div className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>

          <div className="main-links">
            <button className={getActiveClass('home')} onClick={() => handleNavigation('home')}>
              Home
            </button>

            <button className={getActiveClass('dashboard')} onClick={() => handleNavigation('dashboard')}>
              Dashboard
            </button>

            <button className={getActiveClass('features')} onClick={() => handleNavigation('features')}>
              Features
            </button>

            <button className={getActiveClass('diff')} onClick={() => handleNavigation('diff')}>
              Text Diff
            </button>

            <button className={getActiveClass('how')} onClick={() => handleNavigation('how')}>
              How It Works
            </button>

            <button className={getActiveClass('about')} onClick={() => handleNavigation('about')}>
              About
            </button>

          </div>

          <div className="auth-links">
            {!currentUser ? (
              <>
                <button className={getActiveClass('login')} onClick={() => handleNavigation('login')}>
                  Login
                </button>

                <button
                  className={`nav-register-btn ${getActiveClass('register')}`}
                  onClick={() => handleNavigation('register')}
                >
                  Get Started →
                </button>
              </>
            ) : (
              <>
                <span className="user-name">
                  Hi, {currentUser.name}
                  {isAdmin && (
                    <span className="admin-label"> (Admin)</span>
                  )}
                </span>

                <button className={getActiveClass('profile')} onClick={() => handleNavigation('profile')}>
                  Profile
                </button>

                <button
                  className="nav-logout-btn"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </>
            )}
          </div>

        </div>

        <label className="theme-switch">
          <input
            type="checkbox"
            checked={mode === 'dark'}
            onChange={toggleMode}
          />
          <span className="switch-slider"></span>
        </label>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

      </div>
    </nav>
  );
}
