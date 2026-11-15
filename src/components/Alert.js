import React from 'react';
export default function Alert({ alert }) {
  if (!alert) return null;
  return (
    <div className={`custom-alert ${alert.type}`}>
      <strong>{alert.type}:</strong> {alert.message}
    </div>
  );
}