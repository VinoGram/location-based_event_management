import React from 'react';

const ColorSchemeGuide = () => {
  const colors = [
    { name: 'Text Primary', hex: '#FFFFFF', usage: 'Main text, headings, important content' },
    { name: 'Background Main', hex: '#000000', usage: 'Primary app background' },
    { name: 'Background Add-on', hex: '#171717', usage: 'Cards, modals, secondary surfaces' },
    { name: 'Primary Design', hex: '#FB8B24', usage: 'CTA buttons, active states, brand elements' },
    { name: 'Supplementary Design', hex: '#DDAA52', usage: 'Secondary buttons, highlights, borders' },
    { name: 'Accent Catchy', hex: '#A31818', usage: 'Notifications, badges, premium features' },
    { name: 'Accent Add-on', hex: '#CF0E0E', usage: 'Errors, warnings, delete actions' }
  ];

  return (
    <div style={{ background: '#000000', color: '#FFFFFF', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#FB8B24', marginBottom: '2rem' }}>Color Scheme Design Guide</h1>
      
      {/* Color Palette */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#DDAA52', marginBottom: '1rem' }}>1. Color Palette</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {colors.map((color, index) => (
            <div key={index} style={{
              background: color.hex,
              color: color.hex === '#FFFFFF' ? '#000000' : '#FFFFFF',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: color.hex === '#000000' ? '1px solid #171717' : 'none'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{color.name}</h3>
              <p style={{ margin: '0 0 0.5rem 0', fontFamily: 'monospace' }}>{color.hex}</p>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>{color.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Recommendations */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#DDAA52', marginBottom: '1rem' }}>2. Usage Recommendations</h2>
        <div style={{ background: '#171717', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#FB8B24', margin: '0 0 0.5rem 0' }}>Primary Actions</h3>
              <button style={{
                background: '#FB8B24',
                color: '#000000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Primary Button
              </button>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#FFFFFF99' }}>
                Use #FB8B24 for main CTAs, submit buttons, and primary actions
              </p>
            </div>
            
            <div>
              <h3 style={{ color: '#DDAA52', margin: '0 0 0.5rem 0' }}>Secondary Elements</h3>
              <button style={{
                background: 'transparent',
                color: '#DDAA52',
                border: '2px solid #DDAA52',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Secondary Button
              </button>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#FFFFFF99' }}>
                Use #DDAA52 for secondary buttons, borders, and highlights
              </p>
            </div>

            <div>
              <h3 style={{ color: '#A31818', margin: '0 0 0.5rem 0' }}>Premium Features</h3>
              <span style={{
                background: '#A31818',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                PREMIUM
              </span>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#FFFFFF99' }}>
                Use #A31818 for premium badges, notifications, and special features
              </p>
            </div>

            <div>
              <h3 style={{ color: '#CF0E0E', margin: '0 0 0.5rem 0' }}>Alerts & Errors</h3>
              <div style={{
                background: 'rgba(207, 14, 14, 0.1)',
                border: '1px solid #CF0E0E',
                color: '#CF0E0E',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                Error message or warning
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#FFFFFF99' }}>
                Use #CF0E0E for error states, warnings, and destructive actions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Guidelines */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: '#DDAA52', marginBottom: '1rem' }}>3. Accessibility Considerations</h2>
        <div style={{ background: '#171717', padding: '1.5rem', borderRadius: '12px' }}>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#FB8B24' }}>High Contrast:</strong> White text (#FFFFFF) on black background (#000000) provides excellent readability
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#FB8B24' }}>Color Blindness:</strong> Orange (#FB8B24) and red (#A31818, #CF0E0E) are distinguishable for most users
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: '#FB8B24' }}>Focus States:</strong> Use #DDAA52 for focus outlines and hover states
            </li>
            <li>
              <strong style={{ color: '#FB8B24' }}>Text Hierarchy:</strong> Use opacity variants (70%, 50%) for secondary text
            </li>
          </ul>
        </div>
      </section>

      {/* Color Combinations */}
      <section>
        <h2 style={{ color: '#DDAA52', marginBottom: '1rem' }}>4. Effective Color Combinations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#171717', padding: '1.5rem', borderRadius: '12px', border: '1px solid #FB8B24' }}>
            <h3 style={{ color: '#FB8B24', margin: '0 0 1rem 0' }}>Primary Card</h3>
            <p style={{ color: '#FFFFFF', margin: '0 0 1rem 0' }}>Main content with primary accent</p>
            <button style={{ background: '#FB8B24', color: '#000000', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>
              Action
            </button>
          </div>

          <div style={{ background: '#171717', padding: '1.5rem', borderRadius: '12px', border: '1px solid #DDAA52' }}>
            <h3 style={{ color: '#DDAA52', margin: '0 0 1rem 0' }}>Secondary Card</h3>
            <p style={{ color: '#FFFFFF', margin: '0 0 1rem 0' }}>Secondary content with gold accent</p>
            <button style={{ background: 'transparent', color: '#DDAA52', border: '1px solid #DDAA52', padding: '8px 16px', borderRadius: '6px' }}>
              Action
            </button>
          </div>

          <div style={{ background: '#171717', padding: '1.5rem', borderRadius: '12px', border: '1px solid #A31818' }}>
            <h3 style={{ color: '#A31818', margin: '0 0 1rem 0' }}>Premium Card</h3>
            <p style={{ color: '#FFFFFF', margin: '0 0 1rem 0' }}>Premium features with red accent</p>
            <span style={{ background: '#A31818', color: '#FFFFFF', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
              PREMIUM
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorSchemeGuide;