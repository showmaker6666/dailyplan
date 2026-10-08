import React from 'react'

// 底部导航（PRD 4.1）：四页入口（Day 7 第 4 步起全部可用）
const ITEMS = [
  { key: 'today', label: '今日', icon: '📅' },
  { key: 'add', label: '添加', icon: '➕' },
  { key: 'stats', label: '统计', icon: '📊' },
  { key: 'settings', label: '设置', icon: '⚙️' },
]

function Navbar({ current, onNavigate }) {
  return (
    <nav className="navbar">
      {ITEMS.map(item => (
        <button
          key={item.key}
          className={current === item.key ? 'nav-item active' : 'nav-item'}
          disabled={item.disabled}
          title={item.hint || item.label}
          onClick={() => onNavigate(item.key)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navbar
