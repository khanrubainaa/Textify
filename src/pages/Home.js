
import React from 'react';
import TextForm from '../components/TextForm';
import heroImage from '../images/hero.png';

export default function Home({ showAlert, changePage, currentUser }) {
  console.log(heroImage);
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">YOUR SMART TEXT TOOL</span>

          <h1>
            Your words, <span>made better.</span>
          </h1>

          <p>
            Simplify your writing with easy-to-use text editing tools.
            Edit, transform and organise your text in seconds.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              document.getElementById('text-editor').scrollIntoView({
                behavior: 'smooth'
              })
            }
          >
            Start Editing →
          </button>

          <button
            className="secondary-btn"
            onClick={() => changePage('features')}
          >
            Explore Features
          </button>

          <div className="hero-stats">
            <div><strong>6+</strong><span>Text tools</span></div>
            <div><strong>100%</strong><span>Easy to use</span></div>
            <div><strong>Free</strong><span>To use</span></div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src={heroImage}
            alt="Textify text editing preview"
            className="hero-img"
          />
        </div>
      </section>

      <section className="features-preview">
        <span className="section-tag">WHAT YOU CAN DO</span>
        <h2>Everything your text needs.</h2>
        <p className="section-description">
          Simple tools to make everyday writing easier.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <span>Aa</span>
            <h3>Change Case</h3>
            <p>Convert text into uppercase or lowercase instantly.</p>
          </div>

          <div className="feature-card">
            <span>↔</span>
            <h3>Reverse Text</h3>
            <p>Reverse your text with just one click.</p>
          </div>

          <div className="feature-card">
            <span>✂</span>
            <h3>Remove Spaces</h3>
            <p>Remove unnecessary spaces from your content.</p>
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={() => changePage('features')}
        >
          View All Features →
        </button>
      </section>

      <div id="text-editor">
        <TextForm
          showAlert={showAlert}
          currentUser={currentUser}
        />
      </div>
    </>
  );
}
