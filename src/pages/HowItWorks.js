
import React, { useState } from 'react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    [
      '01.',
      'Enter Your Text',
      'Type or paste your content into the text editor.',
      'You can enter sentences, paragraphs or even large amounts of text. Your content is saved automatically in your browser.'
    ],
    [
      '02.',
      'Choose a Tool',
      'Select the text transformation you want to use.',
      'Use uppercase, lowercase, reverse text, remove extra spaces and other editing tools to modify your content.'
    ],
    [
      '03.',
      'View Your Results',
      'See your updated text and live text statistics.',
      'Check your word count, character count, reading time, sentence count, average word length and longest word.'
    ],
    [
      '04.',
      'Copy Your Text',
      'Copy your finished content and use it wherever you need.',
      'You can copy, save or download your final text as a file for later use.'
    ]
  ];

  return (
    <section className="extra-page">
      <div className="extra-hero">
        <span className="section-tag">HOW IT WORKS</span>
        <h1>Simple. Quick. Effective.</h1>
        <p>Transform your text in just a few easy steps.</p>
      </div>

      <div className="steps-container">
        {steps.map(([number, title, description, details]) => (
          <div
            className="step-card"
            key={number}
            onClick={() =>
              setActiveStep(activeStep === number ? null : number)
            }
            style={{ cursor: 'pointer' }}
          >
            <span className="step-number">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>

            {activeStep === number && (
              <p style={{ marginTop: '12px' }}>
                {details}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
