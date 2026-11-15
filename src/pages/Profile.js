import React, { useState } from 'react';

export default function Profile({ currentUser, handleUpdateProfile }) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const nameChanged = name.trim() !== (currentUser.name || '');
  const emailChanged = email.trim().toLowerCase() !== (currentUser.email || '');

  const passwordChanged =
    changePassword &&
    currentPassword !== '' &&
    newPassword !== '' &&
    confirmPassword !== '';

  const hasChanges = nameChanged || emailChanged || passwordChanged;

  const passwordsValid =
    !changePassword ||
    (
      currentPassword === currentUser.password &&
      newPassword !== '' &&
      newPassword === confirmPassword
    );

  const canSave =
    hasChanges &&
    passwordsValid &&
    name.trim() !== '' &&
    email.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canSave) return;

    if (changePassword) {
      if (currentPassword !== currentUser.password) {
        alert('Current password is incorrect!');
        return;
      }

      if (!newPassword || newPassword !== confirmPassword) {
        alert('Please enter matching new passwords!');
        return;
      }
    }

    handleUpdateProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: changePassword
        ? newPassword
        : currentUser.password
    });
  };

  const cancelPasswordChange = () => {
    setChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <section className="profile-page">
      <div className="profile-card">

        <div className="profile-header">
          <div className="profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <h1>{name || 'My Profile'}</h1>
          <p>Manage your account and personal information</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="profile-section">
            <h2>Personal Information</h2>
            <p>Update your basic account details.</p>

            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="profile-section security-section">

            <div className="security-heading">
              <div>
                <h2>Account Security</h2>
                <p>Keep your account protected.</p>
              </div>
            </div>

            {!changePassword ? (
              <button
                type="button"
                className="change-password-btn"
                onClick={() => setChangePassword(true)}
              >
                Change Password →
              </button>
            ) : (
              <div className="password-fields">

                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Create a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="cancel-password-btn"
                  onClick={cancelPasswordChange}
                >
                  Cancel Password Change
                </button>

              </div>
            )}
          </div>

          <button
            type="submit"
            className="profile-save-btn"
            disabled={!canSave}
          >
            Save Changes
          </button>

        </form>
      </div>
    </section>
  );
}