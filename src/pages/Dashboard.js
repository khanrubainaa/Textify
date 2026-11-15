
import React, { useState, useEffect, useRef } from 'react';

export default function Dashboard({ changePage, currentUser }) {
  const [history, setHistory] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [loginActivity, setLoginActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [deletedLogin, setDeletedLogin] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const undoTimer = useRef(null);

  const adminEmail = 'abc@mail.com';
  const isAdmin =
    currentUser?.email?.toLowerCase() === adminEmail;

  const userId = encodeURIComponent(
    (currentUser?.email || 'guest').toLowerCase()
  );

  const textKey = `textifyText_${userId}`;
  const historyKey = `textifyHistory_${userId}`;

  const loadUserData = (key, oldKey) => {
    let savedData = localStorage.getItem(key);

    if (savedData === null) {
      const oldData = localStorage.getItem(oldKey);

      if (oldData !== null) {
        localStorage.setItem(key, oldData);
        localStorage.removeItem(oldKey);
        savedData = oldData;
      }
    }

    return savedData;
  };

  useEffect(() => {
    const savedHistory = JSON.parse(
      loadUserData(historyKey, 'textifyHistory') || '[]'
    );

    const draft =
      loadUserData(textKey, 'textifyText') || '';

    const activity =
      JSON.parse(localStorage.getItem('textifyLoginActivity')) || [];

    const registeredUsers =
      JSON.parse(localStorage.getItem('textifyUsers')) || [];

    setHistory(savedHistory);
    setCurrentText(draft);
    setLoginActivity(activity);
    setUsers(registeredUsers);

    return () => clearTimeout(undoTimer.current);
  }, [historyKey, textKey]);

  const countWords = (value) => {
    return value.trim()
      ? value.trim().split(/\s+/).length
      : 0;
  };

  const openSavedText = (content) => {
    localStorage.setItem(textKey, content);
    changePage('home-editor');
  };

  const togglePasswordVisibility = (email) => {
    setShowPasswords((previous) => ({
      ...previous,
      [email]: !previous[email]
    }));
  };

  const handleDeleteLogin = (index) => {
    if (deletedLogin) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this login record? You will have 5 seconds to undo.'
    );

    if (!confirmDelete) return;

    const deletedRecord = loginActivity[index];

    if (!deletedRecord) return;

    const updatedActivity = loginActivity.filter(
      (_, i) => i !== index
    );

    setLoginActivity(updatedActivity);

    localStorage.setItem(
      'textifyLoginActivity',
      JSON.stringify(updatedActivity)
    );

    setDeletedLogin({
      record: deletedRecord,
      index
    });

    undoTimer.current = setTimeout(() => {
      setDeletedLogin(null);
    }, 5000);
  };

  const handleDeleteAllLogins = () => {
    if (deletedLogin || loginActivity.length === 0) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete ALL login activity records? You will have 5 seconds to undo.'
    );

    if (!confirmDelete) return;

    const deletedRecords = [...loginActivity];

    setLoginActivity([]);

    localStorage.setItem(
      'textifyLoginActivity',
      JSON.stringify([])
    );

    setDeletedLogin({
      allRecords: deletedRecords
    });

    undoTimer.current = setTimeout(() => {
      setDeletedLogin(null);
    }, 5000);
  };

  const handleUndoDelete = () => {
    if (!deletedLogin) return;

    clearTimeout(undoTimer.current);

    let updatedActivity;

    if (deletedLogin.allRecords) {
      updatedActivity = deletedLogin.allRecords;
    } else {
      updatedActivity = [...loginActivity];

      updatedActivity.splice(
        deletedLogin.index,
        0,
        deletedLogin.record
      );
    }

    setLoginActivity(updatedActivity);

    localStorage.setItem(
      'textifyLoginActivity',
      JSON.stringify(updatedActivity)
    );

    setDeletedLogin(null);
  };

  const currentWords = countWords(currentText);

  const savedWords = history.reduce(
    (total, item) => total + countWords(item.content),
    0
  );

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`
      .toLowerCase()
      .includes(searchUser.toLowerCase())
  );

  const activeUsers = users.filter((user) =>
    loginActivity.some(
      (item) =>
        item.email?.toLowerCase() === user.email?.toLowerCase()
    )
  ).length;

  const today = new Date().toLocaleDateString();

  const todayLogins = loginActivity.filter(
    (login) => login.date === today
  ).length;

  const userActivity = loginActivity.filter(
    (login) =>
      login.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  const groupedLogins = loginActivity.reduce(
    (groups, login, index) => {
      const date = login.date || 'Unknown Date';

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push({
        ...login,
        originalIndex: index
      });

      return groups;
    },
    {}
  );

  return (
    <section className="dashboard-page">

      <div className="dashboard-header">
        <span className="section-tag">
          {isAdmin ? 'ADMIN WORKSPACE' : 'YOUR WORKSPACE'}
        </span>

        <h1>
          Welcome, {currentUser?.name || 'User'}!
        </h1>

        <p>
          Track your writing activity and manage your saved texts.
        </p>

        <button
          className="primary-btn"
          onClick={() => changePage('home-editor')}
        >
          Start Editing →
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <span>📝</span>
          <h2>{history.length}</h2>
          <p>Saved Texts</p>
        </div>

        <div className="dashboard-card">
          <span>✍️</span>
          <h2>{currentWords}</h2>
          <p>Words in Current Draft</p>
        </div>

        <div className="dashboard-card">
          <span>📚</span>
          <h2>{savedWords}</h2>
          <p>Words in Saved Texts</p>
        </div>

        {!isAdmin && (
          <div className="dashboard-card">
            <span>🔐</span>
            <h2>{userActivity.length}</h2>
            <p>Total Logins</p>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="dashboard-history account-details-card">
          <div className="dashboard-history-heading">
            <div>
              <h2>👤 Account Details</h2>
              <p>Your registered account information.</p>
            </div>
          </div>

          <div className="account-details-content">
            <div>
              <strong>Name:</strong>
              <span>{currentUser?.name || 'Not available'}</span>
            </div>

            <div>
              <strong>Email:</strong>
              <span>{currentUser?.email || 'Not available'}</span>
            </div>

            <button
              className="primary-btn"
              onClick={() => changePage('profile')}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-history">
        <div className="dashboard-history-heading">
          <div>
            <h2>Recently Saved Texts</h2>
            <p>Your latest saved writing appears here.</p>
          </div>

          <span>{history.length} Total</span>
        </div>

        {history.length === 0 ? (
          <div className="dashboard-empty">
            <span>📄</span>
            <h3>No saved texts yet!</h3>
            <p>
              Start writing and save your first text to see it here.
            </p>
          </div>
        ) : (
          history.slice(0, 5).map((item) => (
            <div
              className="dashboard-history-item"
              key={item.id}
              onClick={() => openSavedText(item.content)}
              title="Click to open this text in the editor"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openSavedText(item.content);
                }
              }}
            >
              <div>
                <h3>
                  {item.content.substring(0, 45)}
                  {item.content.length > 45 ? '...' : ''}
                </h3>
                <p>{item.date}</p>
              </div>

              <span>
                {countWords(item.content)} Words →
              </span>
            </div>
          ))
        )}
      </div>

      <div className="dashboard-history">
        <div className="dashboard-history-heading">
          <div>
            <h2>🕒 Your Recent Activity</h2>
            <p>Your recent login history.</p>
          </div>

          <span>{userActivity.length} Total Logins</span>
        </div>

        {userActivity.length === 0 ? (
          <div className="dashboard-empty">
            <span>🔐</span>
            <h3>No activity yet!</h3>
            <p>Your login activity will appear here.</p>
          </div>
        ) : (
          userActivity.slice(0, 5).map((login, index) => (
            <div
              className="dashboard-history-item"
              key={login.id || index}
            >
              <div>
                <h3>Successful Login</h3>
                <p>{login.date}</p>
              </div>

              <span>{login.time}</span>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <>
          <div className="admin-overview">
            <div className="admin-overview-heading">
              <h2>📊 Admin Overview</h2>
              <p>
                Here's a quick overview of your website activity.
              </p>
            </div>

            <div className="admin-overview-cards">

              <div className="admin-overview-card">
                <span>👥</span>
                <h2>{users.length}</h2>
                <p>Total Registered Users</p>
              </div>

              <div className="admin-overview-card">
                <span>🔐</span>
                <h2>{loginActivity.length}</h2>
                <p>Total Logins</p>
              </div>

              <div className="admin-overview-card">
                <span>🟢</span>
                <h2>{activeUsers}</h2>
                <p>Active Users</p>
              </div>

              <div className="admin-overview-card">
                <span>📅</span>
                <h2>{todayLogins}</h2>
                <p>Today's Logins</p>
              </div>

            </div>
          </div>

          <div className="dashboard-history admin-activity">

            <div className="dashboard-history-heading">
              <div>
                <h2>👥 User Management</h2>
                <p>
                  View registered users and their login activity.
                </p>
              </div>

              <span>{users.length} Total Users</span>
            </div>

            <input
              type="text"
              className="user-search"
              placeholder="Search by name or email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />

            {filteredUsers.length === 0 ? (
              <div className="dashboard-empty">
                <span>🔍</span>
                <h3>No users found!</h3>
                <p>
                  Try searching with another name or email.
                </p>
              </div>
            ) : (
              filteredUsers.map((user, index) => {
                const userIsAdmin =
                  user.email?.toLowerCase() === adminEmail;

                return (
                  <div
                    className="dashboard-history-item user-item"
                    key={user.email || index}
                  >
                    <div>
                      <h3>
                        {user.name}
                        {userIsAdmin && (
                          <span className="admin-label">
                            {' '}(Admin)
                          </span>
                        )}
                      </h3>

                      <p>{user.email}</p>
                    </div>

                    <div className="user-login-time">
                      <span>
                        Total Logins: {
                          loginActivity.filter(
                            (item) =>
                              item.email?.toLowerCase() ===
                              user.email?.toLowerCase()
                          ).length
                        }
                      </span>

                      <div className="user-password-display">
                        <span>
                          Password: {
                            showPasswords[user.email]
                              ? (user.password || 'Not available')
                              : '••••••••'
                          }
                        </span>

                        <button
                          type="button"
                          className="password-eye-btn"
                          onClick={() =>
                            togglePasswordVisibility(user.email)
                          }
                          title={
                            showPasswords[user.email]
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPasswords[user.email] ? '👁️' : '🚫'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="date-wise-logins">

              <div className="dashboard-history-heading">
                <div>
                  <h2>📅 Login Activity</h2>
                  <p>
                    Users grouped according to their login dates.
                  </p>
                </div>

                <div className="login-activity-heading-actions">
                  <span>
                    {loginActivity.length} Total Logins
                  </span>

                  <button
                    className="delete-user-btn"
                    onClick={handleDeleteAllLogins}
                    disabled={
                      !!deletedLogin || loginActivity.length === 0
                    }
                  >
                    Delete All
                  </button>
                </div>
              </div>

              {deletedLogin && (
                <div className="undo-delete-message">
                  <p>
                    {deletedLogin.allRecords
                      ? 'All login records deleted.'
                      : `Login record of ${deletedLogin.record.name} deleted.`}
                  </p>

                  <button onClick={handleUndoDelete}>
                    ↩ Undo
                  </button>

                  <span>Available for 5 seconds</span>
                </div>
              )}

              {Object.keys(groupedLogins).length === 0 ? (
                <div className="dashboard-empty">
                  <span>🔐</span>
                  <h3>No login activity yet!</h3>
                  <p>User login records will appear here.</p>
                </div>
              ) : (
                Object.entries(groupedLogins).map(
                  ([date, logins]) => (
                    <div className="login-date-group" key={date}>
                      <h3 className="login-date-heading">
                        {date}
                      </h3>

                      {logins.map((login) => (
                        <div
                          className="user-login-record"
                          key={
                            login.id ||
                            `${login.email}-${login.originalIndex}`
                          }
                        >
                          <div>
                            <h4>
                              {login.name}
                              {login.email?.toLowerCase() ===
                                adminEmail && (
                                <span className="admin-label">
                                  {' '}(Admin)
                                </span>
                              )}
                            </h4>

                            <p>{login.email}</p>
                          </div>

                          <div className="login-record-actions">
                            <span>
                              {login.date} | {login.time}
                            </span>

                            <button
                              className="delete-user-btn"
                              onClick={() =>
                                handleDeleteLogin(
                                  login.originalIndex
                                )
                              }
                              disabled={!!deletedLogin}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )
              )}
            </div>

          </div>
        </>
      )}

    </section>
  );
}