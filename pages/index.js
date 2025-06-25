import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [myLanguage, setMyLanguage] = useState('en');
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Urdu', code: 'ur' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Portuguese', code: 'pt' },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/auth');
      return;
    }
    setUserName(user.username);

    setMessages([
      {
        id: 1,
        text: 'Welcome to Healthcare Chat! How can I assist you today?',
        isSystem: true,
        time: new Date().toLocaleTimeString(),
        translations: {},
        lang: 'en',
      },
    ]);

    if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = myLanguage;

      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
        if (e.results[0].isFinal) {
          sendMessage(true);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            text: 'Speech recognition error. Please try again.',
            isSystem: true,
            time: new Date().toLocaleTimeString(),
            translations: {},
            lang: 'en',
          },
        ]);
      };
    }

    return () => recognitionRef.current?.stop();
  }, [router, myLanguage]);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  const startVoiceNote = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = myLanguage;
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: 'Speech recognition not supported in this browser.',
          isSystem: true,
          time: new Date().toLocaleTimeString(),
          translations: {},
          lang: 'en',
        },
      ]);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const sendMessage = async (isVoiceNote = false) => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: input,
      isMe: true,
      isVoiceNote,
      time: new Date().toLocaleTimeString(),
      translations: {},
      lang: myLanguage,
      sender: userName,
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsListening(false);

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/provider-response`, {
        text: input,
        lang: myLanguage,
      });
      const providerMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isMe: false,
        time: new Date().toLocaleTimeString(),
        translations: {},
        lang: myLanguage,
        sender: 'Provider',
      };
      setMessages(prev => [...prev, providerMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: 'Error: Could not get provider response.',
          isSystem: true,
          time: new Date().toLocaleTimeString(),
          translations: {},
          lang: 'en',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleMessageOptions = (id) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  const handleTranslate = async (messageId, targetLang) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.translations[targetLang] || message.lang === targetLang) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/translate`, {
        text: message.text,
        source_lang: message.lang, // Changed from source to source_lang
        target_lang: targetLang,  // Changed from target to target_lang
      }, {
        headers: { Authorization: `Bearer mock-token` },
      });
      const translated = response.data.translated_text;
      if (translated && translated !== 'Translation failed') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...msg, translations: { ...msg.translations, [targetLang]: translated } }
              : msg
          )
        );
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error.response?.data || error.message); // Debug log
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: 'Translation failed.',
          isSystem: true,
          time: new Date().toLocaleTimeString(),
          translations: {},
          lang: 'en',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text, lang) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/speak`, { text, lang }, {
        headers: { Authorization: `Bearer mock-token` },
        responseType: 'blob',
      });
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: 'Error: Text-to-speech failed.',
          isSystem: true,
          time: new Date().toLocaleTimeString(),
          translations: {},
          lang: 'en',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-gray-100 font-sans">
      <header className="bg-primary text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">🩺 Healthcare Chat</h2>
          <p className="text-sm opacity-80">Online</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">{userName}</span>
          <select
            value={myLanguage}
            onChange={(e) => setMyLanguage(e.target.value)}
            className="p-2 rounded-md bg-white/90 text-primary text-sm"
            aria-label="Select language"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
            aria-label="Log out"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto bg-chatBg space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col animate-slide-in">
            <div
              className={`max-w-[75%] p-4 rounded-lg shadow-md border ${
                msg.isSystem
                  ? 'bg-yellow-100 border-yellow-200 mx-auto'
                  : msg.isMe
                  ? 'self-end bg-blue-100 border-blue-300'
                  : 'self-start bg-white border-gray-200'
              } ${msg.isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}
            >
              {!msg.isSystem && (
                <div className="text-sm font-semibold text-primary mb-1">{msg.sender}</div>
              )}
              <div className="text-base whitespace-pre-wrap">
                {msg.isVoiceNote && <span className="text-primary">🎤 </span>}
                <div className="flex flex-col gap-1">
                  {msg.translations[myLanguage] && msg.lang !== myLanguage ? (
                    <span>{msg.translations[myLanguage]} ({myLanguage})</span>
                  ) : (
                    <span>{msg.text} ({msg.lang})</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{msg.time}</span>
                {!msg.isSystem && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => speakText(msg.translations[myLanguage] || msg.text, myLanguage)}
                      className="p-1 rounded-md hover:bg-gray-200"
                      aria-label="Read message aloud"
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => toggleMessageOptions(msg.id)}
                      className="p-1 rounded-md hover:bg-gray-200"
                      aria-label="Translate message"
                    >
                      🌐
                    </button>
                  </div>
                )}
              </div>
              {expandedMessage === msg.id && (
                <div className="mt-2 p-3 bg-white/90 rounded-md border border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Translate to:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {languages
                      .filter(lang => lang.code !== msg.lang)
                      .map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleTranslate(msg.id, lang.code)}
                          className="px-2 py-1 border border-gray-200 rounded-full bg-white hover:bg-blue-50 hover:border-blue-400 text-sm"
                        >
                          {lang.name}
                        </button>
                      ))}
                  </div>
                  {Object.entries(msg.translations).map(([langCode, translation]) => (
                    <div key={langCode} className="mt-2 p-2 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-sm">{languages.find(l => l.code === langCode)?.name}:</strong>
                        <button
                          onClick={() => speakText(translation, langCode)}
                          className="p-1 rounded-md hover:bg-gray-200"
                          aria-label={`Read ${langCode} translation aloud`}
                        >
                          🔊
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">{translation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <ClipLoader color="#0d9488" size={24} className="mt-2 mx-auto" />}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-200 rounded-full bg-white text-base resize-none min-h-[40px] max-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
            rows={1}
            aria-label="Type your message"
          />
          <div className="flex gap-2">
            <button
              onClick={isListening ? stopListening : startVoiceNote}
              className={`w-12 h-12 rounded-full text-white flex items-center justify-center transition-transform ${
                isListening ? 'bg-red-500' : 'bg-primary'
              } hover:scale-105`}
              aria-label={isListening ? 'Stop recording' : 'Start voice recording'}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
            <button
              onClick={sendMessage}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
        {isListening && (
          <div className="flex items-center gap-2 mt-2 text-primary text-sm">
            <span className="animate-pulse">🎤</span>
            <span>Listening... (Speak now)</span>
          </div>
        )}
        <div className="text-xs text-gray-600 text-center mt-2 italic">
          💡 Click 🎤 to speak, then click ➤ to send
        </div>
      </div>
    </div>
  );
}