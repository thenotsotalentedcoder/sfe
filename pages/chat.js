import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function Chat() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [myLanguage, setMyLanguage] = useState('en');
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const languages = [
    { name: 'English', code: 'en', flag: '🇺🇸' },
    { name: 'Spanish', code: 'es', flag: '🇪🇸' },
    { name: 'French', code: 'fr', flag: '🇫🇷' },
    { name: 'Arabic', code: 'ar', flag: '🇸🇦' },
    { name: 'Urdu', code: 'ur', flag: '🇵🇰' },
    { name: 'Chinese', code: 'zh', flag: '🇨🇳' },
    { name: 'Hindi', code: 'hi', flag: '🇮🇳' },
    { name: 'Portuguese', code: 'pt', flag: '🇵🇹' },
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
        text: 'Welcome to Healthcare Chat! I\'m Dr. Martinez, your AI healthcare assistant. How can I help you today?',
        isSystem: false,
        isMe: false,
        time: new Date().toLocaleTimeString(),
        translations: {},
        lang: 'en',
        sender: 'Dr. Martinez'
      },
    ]);

    // Initialize speech recognition
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = myLanguage === 'zh' ? 'zh-CN' : myLanguage;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setIsListening(true);
      };

      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (e) => {
        setIsRecording(false);
        setIsListening(false);
        console.error('Speech recognition error:', e.error);
        addSystemMessage(`Speech recognition error: ${e.error}. Please try again.`);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
      }
    };
  }, [router, myLanguage]);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  const addSystemMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        isSystem: true,
        time: new Date().toLocaleTimeString(),
        translations: {},
        lang: 'en',
      },
    ]);
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.lang = myLanguage === 'zh' ? 'zh-CN' : myLanguage;
      recognitionRef.current.start();
    } else if (!recognitionRef.current) {
      addSystemMessage('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const sendMessage = async (isVoiceNote = false) => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: input.trim(),
      isMe: true,
      isVoiceNote,
      time: new Date().toLocaleTimeString(),
      translations: {},
      lang: myLanguage,
      sender: userName,
    };
    
    setMessages(prev => [...prev, newMessage]);
    const currentInput = input.trim();
    setInput('');

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/provider-response`, {
        text: currentInput,
        lang: myLanguage,
      });
      
      const providerMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isMe: false,
        time: new Date().toLocaleTimeString(),
        translations: {},
        lang: myLanguage,
        sender: 'Dr. Martinez',
      };
      
      setMessages(prev => [...prev, providerMessage]);
    } catch (error) {
      console.error('Provider response error:', error);
      addSystemMessage('Error: Could not get provider response. Please try again.');
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
        source_lang: message.lang,
        target_lang: targetLang,
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
      console.error('Translation error:', error);
      addSystemMessage('Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text, lang) => {
    try {
      // Stop any currently playing audio
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        setCurrentPlayingAudio(null);
      }

      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/text-to-speech`, 
        { text, lang }, 
        { responseType: 'blob' }
      );

      if (response.data.size > 0) {
        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio(audioUrl);
        setCurrentPlayingAudio(audio);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentPlayingAudio(null);
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentPlayingAudio(null);
          addSystemMessage('Audio playback failed.');
        };
        
        await audio.play();
      } else {
        addSystemMessage('Text-to-speech not available (quota exceeded).');
      }
    } catch (error) {
      console.error('TTS error:', error);
      addSystemMessage('Text-to-speech service temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToDashboard}
              className="text-gray-600 hover:text-primary transition-colors"
              title="Back to Dashboard"
            >
              ← Dashboard
            </button>
            <div>
              <h2 className="text-xl font-bold text-primary">🩺 Healthcare Chat</h2>
              <p className="text-sm text-gray-600">Dr. Martinez • Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Language:</span>
              <select
                value={myLanguage}
                onChange={(e) => setMyLanguage(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{userName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-white">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col animate-fade-in">
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm border ${
                msg.isSystem
                  ? 'bg-yellow-50 border-yellow-200 mx-auto text-center'
                  : msg.isMe
                  ? 'self-end bg-primary text-white border-primary/20'
                  : 'self-start bg-white border-gray-200'
              }`}
            >
              {!msg.isSystem && (
                <div className={`text-xs font-semibold mb-2 ${
                  msg.isMe ? 'text-teal-100' : 'text-primary'
                }`}>
                  {msg.sender}
                </div>
              )}
              
              <div className="text-sm leading-relaxed">
                {msg.isVoiceNote && (
                  <span className={`mr-2 ${msg.isMe ? 'text-teal-100' : 'text-primary'}`}>
                    🎤
                  </span>
                )}
                
                <div className="mb-2">
                  {msg.translations[myLanguage] && msg.lang !== myLanguage ? (
                    <>
                      <div className="font-medium">
                        {msg.translations[myLanguage]}
                      </div>
                      <div className={`text-xs mt-1 ${
                        msg.isMe ? 'text-teal-200' : 'text-gray-500'
                      }`}>
                        Translated from {languages.find(l => l.code === msg.lang)?.name}
                      </div>
                    </>
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${
                  msg.isMe ? 'text-teal-200' : 'text-gray-500'
                }`}>
                  {msg.time}
                </span>
                
                {!msg.isSystem && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => speakText(
                        msg.translations[myLanguage] || msg.text, 
                        msg.translations[myLanguage] ? myLanguage : msg.lang
                      )}
                      className={`p-1 rounded-md transition-colors ${
                        msg.isMe 
                          ? 'hover:bg-teal-600 text-teal-100' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title="Read aloud"
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => toggleMessageOptions(msg.id)}
                      className={`p-1 rounded-md transition-colors ${
                        msg.isMe 
                          ? 'hover:bg-teal-600 text-teal-100' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title="Translate"
                    >
                      🌐
                    </button>
                  </div>
                  )}
              </div>
              
              {expandedMessage === msg.id && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Translate to:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {languages
                      .filter(lang => lang.code !== msg.lang)
                      .map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleTranslate(msg.id, lang.code)}
                          className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                  </div>
                  
                  {Object.entries(msg.translations).map(([langCode, translation]) => (
                    <div key={langCode} className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {languages.find(l => l.code === langCode)?.flag}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {languages.find(l => l.code === langCode)?.name}:
                          </span>
                        </div>
                        <button
                          onClick={() => speakText(translation, langCode)}
                          className="p-1 rounded-md hover:bg-gray-200 text-gray-600"
                          title={`Read ${languages.find(l => l.code === langCode)?.name} translation aloud`}
                        >
                          🔊
                        </button>
                      </div>
                      <div className="text-sm text-gray-800">{translation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-center">
            <ClipLoader color="#0d9488" size={24} />
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>
          
          <div className="flex space-x-2">
            {/* Voice Input Button */}
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gray-500 hover:bg-gray-600'
              } text-white shadow-lg`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
            
            {/* Send Button */}
            <button
              onClick={() => sendMessage(false)}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-full bg-primary hover:bg-teal-700 text-white flex items-center justify-center transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
        
        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center mt-3 text-red-600">
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording... Speak now</span>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            💡 Press and hold 🎤 to record voice, or type your message
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports Roman Urdu and mixed language input
          </p>
        </div>
      </div>
    </div>
  );
}