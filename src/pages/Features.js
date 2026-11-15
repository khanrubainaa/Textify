
import React, { useState } from 'react';

export default function Features({ changePage }) {
  const [search, setSearch] = useState('');

  const features = [
    ['Aa', 'Uppercase & Lowercase', 'Convert your text into uppercase or lowercase.'],
    ['↔', 'Reverse Text', 'Reverse any sentence or paragraph instantly.'],
    ['✂', 'Remove Extra Spaces', 'Clean up unnecessary spaces in your writing.'],
    ['📋', 'Copy Text', 'Copy your edited content with one click.'],
    ['📝', 'Word Counter', 'Get an instant count of words and characters.'],
    ['⚡', 'Reading Time', 'Estimate how long your text takes to read.']
  ];

  const filteredFeatures = features.filter(([icon, title, description]) =>
    `${title} ${description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="extra-page">
      <div className="extra-hero">
        <span className="section-tag">TEXTIFY FEATURES</span>
        <h1>Tools that make writing easier.</h1>
        <p>Everything you need to edit, clean and manage your text in one place.</p>
      </div>

      <div style={{ textAlign: 'center', margin: '25px 0' }}>
        <input
          type="text"
          placeholder="Search features..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '450px',
            padding: '13px 18px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text)',
            fontSize: '15px',
            outline: 'none'
          }}
        />
      </div>

      <div className="feature-grid page-grid">
        {filteredFeatures.length > 0 ? (
          filteredFeatures.map(([icon, title, description]) => (
            <div
              className="feature-card"
              key={title}
              onClick={() => changePage('home-editor')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  changePage('home');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <span>{icon}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', width: '100%' }}>
            No matching features found.
          </p>
        )}
      </div>
    </section>
  );
}