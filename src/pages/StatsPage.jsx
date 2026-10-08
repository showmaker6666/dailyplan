import React, { useEffect, useState } from 'react'
import {
  todayStr,
  getTodayStats,
  refreshUser,
  loadReview,
  saveReview,
} from '../storage/localStore'

const MOODS = [
  { key: 'good', emoji: '😄', label: '不错' },
  { key: 'ok', emoji: '😐', label: '一般' },
  { key: 'bad', emoji: '😞', label: '糟糕' },
]

// 统计页（Day 7 第 4 步）：
// 今日完成率 + streak_days 连续天数 + 当日复盘（PRD 4.3）
// 每次进入页面都重新读数据：打勾后切过来完成率立即更新（PRD 验收第 17 条）
function StatsPage() {
  const [stats, setStats] = useState({ total: 0, done: 0, rate: 0 })
  const [streak, setStreak] = useState(0)
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [savedTip, setSavedTip] = useState(false)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    setStats(getTodayStats())
    setStreak(refreshUser().streak_days)
    const r = loadReview(todayStr())
    setMood(r.mood)
    setNote(r.note)
  }, [])

  function handleSaveReview() {
    const result = saveReview(todayStr(), mood, note)
    setStorageError(!result.ok)
    if (result.ok) {
      setSavedTip(true)
      setTimeout(() => setSavedTip(false), 2000)
    }
  }

  return (
    <section className="today-card">
      {storageError && (
        <div className="storage-error">
          ⚠ 复盘保存失败（浏览器存储不可用），请勿关闭页面
        </div>
      )}

      <h2 className="today-title">今日统计</h2>

      {/* 两块核心指标 */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-value">{stats.rate}%</p>
          <p className="stat-label">今日完成率</p>
          <p className="stat-sub">
            {stats.done} / {stats.total} 个任务
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-value">
            {streak}
            <span className="stat-unit">天</span>
          </p>
          <p className="stat-label">连续完成</p>
          <p className="stat-sub">每天至少完成 1 个即累计</p>
        </div>
      </div>

      {/* 当日复盘 */}
      <h3 className="section-title">今日复盘</h3>
      <p className="mood-row">
        {MOODS.map(m => (
          <button
            key={m.key}
            className={mood === m.key ? 'mood-btn active' : 'mood-btn'}
            onClick={() => setMood(m.key)}
            title={m.label}
          >
            {m.emoji}
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </p>
      <textarea
        className="review-note"
        placeholder="今天干得怎么样？一句话记下来"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
      />
      <div className="form-buttons">
        {savedTip && <span className="saved-tip">已保存 ✓</span>}
        <button className="btn-primary" onClick={handleSaveReview}>
          保存复盘
        </button>
      </div>
    </section>
  )
}

export default StatsPage
