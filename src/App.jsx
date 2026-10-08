import React, { useState } from 'react'
import TodayPage from './pages/TodayPage'
import AddTaskPage from './pages/AddTaskPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import Navbar from './components/Navbar'

// 总壳：页面切换（阶段 A 用轻量的 state 切页，不引路由库）
function App() {
  const [page, setPage] = useState('today')

  return (
    <div className="container">
      <header>
        <h1 className="app-title">dailyplan</h1>
        <p className="app-subtitle">今天的事，今天做完</p>
      </header>

      {page === 'today' && <TodayPage goAdd={() => setPage('add')} />}
      {page === 'add' && <AddTaskPage goBack={() => setPage('today')} />}
      {page === 'stats' && <StatsPage />}
      {page === 'settings' && <SettingsPage />}

      <Navbar current={page} onNavigate={setPage} />
    </div>
  )
}

export default App
