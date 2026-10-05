import { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  radius?: number | string;
  style?: React.CSSProperties;
}

// Deterministic color from name
function nameColor(name: string) {
  const colors = ['#FB8B24', '#A31818', '#7C3AED', '#0EA5E9', '#10B981', '#DDAA52'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function initials(name: string) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserAvatar({ src, name = '', size = 36, radius, style }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const color = nameColor(name);
  const r = radius ?? Math.round(size * 0.28);
  const fontSize = Math.round(size * 0.36);

  return (
    <div style={{
      width: size, height: size, borderRadius: r, overflow: 'hidden', flexShrink: 0,
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ color: '#fff', fontSize, fontWeight: 700, lineHeight: 1, userSelect: 'none' }}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}
