
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [langFrom, setLangFrom] = useState('en');
  const [langTo, setLangTo] = useState('es');

  const translateText = async () => {
    const res = await fetch('http://localhost:8000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input, source_lang: langFrom, target_lang: langTo })
    });
    const data = await res.json();
    setOutput(data.translated_text || 'Error');
  };

  const speakText = async () => {
    const res = await fetch('http://localhost:8000/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: output, language: langTo })
    });
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Healthcare Translation</h1>
      <select value={langFrom} onChange={(e) => setLangFrom(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
      <select value={langTo} onChange={(e) => setLangTo(e.target.value)}>
        <option value="es">Spanish</option>
        <option value="en">English</option>
      </select>
      <textarea rows="3" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text" />
      <button onClick={translateText}>Translate</button>
      <textarea rows="3" readOnly value={output} placeholder="Translation result" />
      <button onClick={speakText}>Speak</button>
    </div>
  );
}
