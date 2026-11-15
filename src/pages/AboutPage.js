
import React, { useState } from 'react';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      title: 'Technologies Used',
      description: 'Learn about the technologies behind Textify.',
      details: 'Textify is built using HTML, CSS, JavaScript and React.js. React manages the user interface, JavaScript handles functionality, and LocalStorage helps save user data and text in the browser.'
    },
    {
      title: 'Available Tools',
      description: 'Discover the different tools available in Textify.',
      details: 'Textify offers uppercase and lowercase conversion, reverse text, remove extra spaces, copy, word counting, reading time, text analysis, undo, redo and download functionality.'
    },
    {
      title: 'Project Goals',
      description: 'Understand the purpose and vision of Textify.',
      details: 'The goal is to create a simple, responsive and user-friendly text editing website that brings useful writing tools together in one place.'
    }
  ];

  const toggleSection = (index) => {
    setActiveSection(activeSection === index ? null : index);
  };

  return (
    <section className="extra-page">
      <div className="extra-hero">
        <span className="section-tag">ABOUT TEXTIFY</span>
        <h1>Making text editing effortless.</h1>
        <p>
          Textify is a simple and user-friendly text editing website
          designed to make everyday writing tasks easier.
        </p>
      </div>

      <div className="about-card">
        <h2>Our Purpose</h2>
        <p>
          We believe that editing text should be quick and convenient.
          Textify brings useful text tools together in one place so
          users can transform and organise their content with ease.
        </p>

        <h2>What We Offer</h2>
        <p>
          From changing text cases to reversing content, removing
          extra spaces and checking text statistics, Textify helps
          simplify everyday writing tasks.
        </p>

        <h2>Our Goal</h2>
        <p>
          To provide a clean, accessible and easy-to-use experience
          for everyone.
        </p>
      </div>

      <div className="explore-section">
        <div className="extra-hero">
          <span className="section-tag">GET TO KNOW US</span>
          <h2>Explore More</h2>
          <p>Discover more about how Textify works.</p>
        </div>

        <div className="explore-grid">
          {sections.map((section, index) => (
            <div className="explore-card" key={section.title}>
              <div
                className="explore-card-header"
                onClick={() => toggleSection(index)}
              >
                <div className="explore-card-content">
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>

                <span className="explore-icon">
                  {activeSection === index ? '−' : '+'}
                </span>
              </div>

              {activeSection === index && (
                <div className="explore-details">
                  <p>{section.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
