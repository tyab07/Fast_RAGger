import React, { useState, useEffect } from 'react';
import { Bot as BotIcon } from 'lucide-react'; 
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// --- Firebase Configuration & Initialization ---
// We check if the environment variable exists. 
// If you are running this locally, you would replace this with your actual const firebaseConfig = { ... } object.
let auth = null;
let googleProvider = null;

try {
  if (typeof __firebase_config !== 'undefined') {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn("Firebase config not found. Google Sign-In will not work.");
  }
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

// Placeholder for the logo
const fastLogo = "components/Assets/CFD.png"; 
const API_URL = "http://localhost:8000";

// --- Icons Components ---

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.68 0 1.35-.06 2-.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

const GoogleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// --- Login Page Component ---

export const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', fullName: '' });
    setError('');
    setShowPassword(false); // Reset password visibility on toggle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password || (!isLogin && !formData.fullName)) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, fullName: formData.fullName };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (isLogin) {
        // Login success: Pass token and user info up to App.jsx
        if (onLogin) onLogin(data.access_token, data.username);
      } else {
        // Signup success: Switch to login mode
        alert("Account created! Please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      // For demo purposes, if the API fails (because localhost isn't running), we simulate a login
      console.warn("API Error caught:", err);
      if (err.message.includes("Failed to fetch")) {
         // SIMULATION FOR PREVIEW: Remove this in production
         alert("Demo Mode: API not detected. Simulating login.");
         if (onLogin) onLogin("demo-token", formData.email);
         return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    
    // Check if Firebase is initialized
    if (!auth || !googleProvider) {
      setError("Google Sign-In is not configured in this environment.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Trigger the Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Get the user info
      const user = result.user;
      
      // 3. Get the ID token (if you need to send it to your backend)
      const token = await user.getIdToken();
      
      console.log("Google Sign-In Successful:", user);

      // 4. Pass control to the main app
      // We use the user's Display Name or email as the 'username'
      if (onLogin) {
        onLogin(token, user.displayName || user.email);
      }
      
    } catch (err) {
      console.error("Google Auth Error:", err);
      // specific error handling
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#0C2B4E]">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        
        <img 
          src={fastLogo}
          alt="FAST University Logo"
          className="absolute top-4 right-4 w-14 h-auto object-contain opacity-80"
          onError={(e) => {e.target.style.display = 'none'}}
        />

        <div className="text-center mb-6 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-lg">
             <BotIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-blue-200">
            {isLogin ? 'Sign in to access Fast Assistant' : 'Join us to explore AI'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 text-white bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none placeholder-white/30 transition-all"
                placeholder="Tayyab"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 text-white bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none placeholder-white/30 transition-all"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 text-white bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none placeholder-white/30 transition-all pr-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 text-white font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {/* Google Sign In Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-blue-200 bg-transparent backdrop-blur-xl">Or continue with</span>
          </div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleAuth}
          type="button"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon className="w-5 h-5" />
          <span className="font-medium group-hover:text-white text-gray-200">Google</span>
        </button>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-sm text-blue-200">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={toggleMode}
              className="ml-2 font-semibold text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/30 underline-offset-4 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
// This wrapper ensures the LoginPage is rendered and receives the necessary props.
export default function App() {
  const handleLogin = (token, username) => {
    console.log("Logged in with:", token, username);
    alert(`Logged in successfully as ${username}!`);
  };

  return <LoginPage onLogin={handleLogin} />;
}