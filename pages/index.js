import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">🩺 HealthTranslate</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.username}</span>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Break Language Barriers in
            <span className="text-primary block">Healthcare Communication</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Real-time voice translation between patients and healthcare providers. 
            Speak naturally, translate instantly, and provide better care regardless of language.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-primary text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-teal-700 transform hover:scale-105 transition-all shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Healthcare Communication
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for seamless multilingual healthcare interactions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-3">Voice-to-Text</h3>
              <p className="text-gray-600">
                Advanced speech recognition optimized for medical terminology across multiple languages
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-3">Real-time Translation</h3>
              <p className="text-gray-600">
                Instant translation between 8+ languages with healthcare-specific accuracy
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔊</div>
              <h3 className="text-xl font-semibold mb-3">Audio Playback</h3>
              <p className="text-gray-600">
                Natural-sounding voice synthesis with language-appropriate pronunciation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple 3-step process for effective communication
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Speak</h3>
              <p className="text-gray-600">
                Click the microphone and speak naturally in your preferred language
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Translate</h3>
              <p className="text-gray-600">
                AI instantly translates your message with medical context awareness
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Communicate</h3>
              <p className="text-gray-600">
                Listen to the translated message or read the text transcript
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted by Healthcare Professionals
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600">
                End-to-end encryption ensures patient privacy and data security
              </p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Fast & Accurate</h3>
              <p className="text-gray-600">
                Sub-second translation with 95%+ accuracy for medical terminology
              </p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">
                Works seamlessly on any device, from tablets to smartphones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Healthcare Communication?
          </h2>
          <p className="text-xl mb-8 text-teal-100">
            Join thousands of healthcare providers using HealthTranslate to provide better patient care
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-primary px-8 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
          >
            Start Translating Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">🩺 HealthTranslate</h3>
              <p className="text-gray-400">
                Breaking language barriers in healthcare, one conversation at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Contact</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>HIPAA Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthTranslate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}