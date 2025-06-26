import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth');
      return;
    }
    setUser(JSON.parse(userData)); // Fixed: Added missing space after return;
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const startTranslationSession = () => {
    router.push('/chat');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">🩺 HealthTranslate</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Healthcare Translation Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start a new translation session to communicate effectively with patients in multiple languages.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sessions Today</h3>
                <p className="text-2xl font-bold text-primary">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🌐</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Languages Available</h3>
                <p className="text-2xl font-bold text-primary">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⚡</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Avg. Response Time</h3>
                <p className="text-2xl font-bold text-primary">2s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Start Translation */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Translation Session
              </h2>
              <p className="text-gray-600 mb-6">
                Begin a new conversation with real-time voice translation and text-to-speech capabilities.
              </p>
              <button
                onClick={startTranslationSession}
                className="bg-primary text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-teal-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Start Session
              </button>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Settings
              </h2>
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                    <option value="ur">Urdu</option>
                    <option value="zh">Chinese</option>
                    <option value="hi">Hindi</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Speed
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="slow">Slow</option>
                    <option value="normal" defaultValue>Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Session History</h2>
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p>No recent sessions. Start your first translation session above!</p>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Medical Accuracy</h3>
            <p className="text-gray-600 text-sm">
              Specialized for healthcare terminology and context
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Privacy Protected</h3>
            <p className="text-gray-600 text-sm">
              HIPAA compliant with end-to-end encryption
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold mb-2">Mobile Ready</h3>
            <p className="text-gray-600 text-sm">
              Works seamlessly on any device or screen size
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}