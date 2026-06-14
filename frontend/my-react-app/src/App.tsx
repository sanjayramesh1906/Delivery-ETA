import { useState } from 'react'
import Navbar from './components/navbar'
import { Dashboard } from './components/dashboard'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('network-graph')
  const [user] = useState({ name: 'Operator Admin', email: 'operator@delhivery-eta.in' })

  const handleTabChange = (tabId: string) => {
    if (tabId === 'logout') {
      alert('Session reset. Re-initializing simulation database...');
      setActiveTab('network-graph');
    } else {
      setActiveTab(tabId);
    }
  };

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
