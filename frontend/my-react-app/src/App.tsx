import { useState } from 'react'
import Navbar from './components/navbar'
import LoginPage from './components/login'
import LandingPage from './components/landing'
import RegisterPage from './components/register'
import { Dashboard } from './components/dashboard'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('network-graph')
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing')
  const [user, setUser] = useState({ name: '', email: '' })

  const handleLoginSuccess = (name: string, email: string) => {
    setUser({ name, email });
    setCurrentScreen('dashboard');
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'logout') {
      setUser({ name: '', email: '' });
      setCurrentScreen('landing');
      setActiveTab('network-graph');
    } else {
      setActiveTab(tabId);
    }
  };

  if (currentScreen === 'landing') {
    return (
      <LandingPage 
        onSignInClick={() => setCurrentScreen('login')} 
        onRegisterClick={() => setCurrentScreen('register')} 
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onBackToHome={() => setCurrentScreen('landing')} 
        onRegisterClick={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterPage 
        onRegisterSuccess={handleLoginSuccess} 
        onBackToHome={() => setCurrentScreen('landing')} 
        onBackToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  return (
    <>
      <Navbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onNewTripClick={() => alert('Simulation Run started! Predictions are recalculating.')}
        userName={user.name}
        userEmail={user.email}
      />
      <div style={{ paddingTop: '64px', display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
        <Dashboard activeTab={activeTab} onTabChange={handleTabChange} user={user} />
      </div>
    </>
  );
}

export default App
