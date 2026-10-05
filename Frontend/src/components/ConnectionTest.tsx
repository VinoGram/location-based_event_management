import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function ConnectionTest() {
  const [status, setStatus] = useState('Testing...');
  const [color, setColor] = useState('text-yellow-400');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/api/test`);
        if (response.ok) {
          const data = await response.json();
          setStatus(`✓ Connected: ${data.message}`);
          setColor('text-green-400');
        } else {
          setStatus('✗ Backend Error');
          setColor('text-red-400');
        }
      } catch (error) {
        setStatus('✗ Connection Failed');
        setColor('text-red-400');
      }
    };

    testConnection();
  }, []);

  return (
    <div className={`fixed top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg px-3 py-2 text-sm ${color} z-50`}>
      Backend: {status}
    </div>
  );
}