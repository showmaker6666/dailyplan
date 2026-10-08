import React, { useEffect, useState } from 'react'
import {
  todayStr,
  loadTasks,
  addTask,
  toggleTask,
  deleteTask,
} from '../storage/localStore'

// 优先级：排序顺序（PRD 验收第 4 条：高→中→低，同优先级按添加时间）
const PRIORITY_ORDER = { '高': 0, '中': 1, '低': 2 }
const PRIORITY_COLOR = { '高': '#e5484d', '中': '#f5a623', '低': '#46a758' }

// 给 HH:MM 加分钟数，算时间块的结束时刻（用于显示"14:00–14:30"）
function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = (h * 60 + m + minutes) % (24 * 60)
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// 今日页（Day 7 第 3 步）：
// 清单/时间块双视图 + 快速添加 + 优先级排序 + 打勾/删除 + 进度条
function TodayPage({ goAdd }) {
  const today = new Date()
  const dateStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`
  const weekMap = ['日', '一', '二', '三', '四', '五', '六']

  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [view, setView] = useState('list') // 'list' 清单 | 'block' 时间块

  useEffect(() => {
    setTasks(loadTasks())
  }, [])

  function refresh(result) {
    setTasks(loadTasks())
    setStorageError(result ? !result.ok : false)
  }

  function handleAdd() {
    const title = input.trim()
    if (!title) return
    const result = addTask(title)
    refresh(result)
    if (result.ok) setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  // 只显示今天的任务（PRD 验收第 2 条）
  const todayKey = todayStr()
  const todayTasks = tasks.filter(t => t.plan_date === todayKey)

  // 排序：优先级 高→中→低，同优先级按添加时间先后（PRD 验收第 4 条）
  const sorted = [...todayTasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority]
    const pb = PRIORITY_ORDER[b.priority]
    if (pa !== pb) return pa - pb
    return a.created_at < b.created_at ? -1 : 1
  })

  const doneCount = todayTasks.filter(t => t.status === '已完成').length
  const percent =
    todayTasks.length === 0
      ? 0
      : Math.round((doneCount / todayTasks.length) * 100)

  // 时间块视图的数据：有 start_time 的按时段排，没有的进"未安排"
  const scheduled = sorted
    .filter(t => t.start_time)
    .sort((a, b) => (a.start_time < b.start_time ? -1 : 1))
  const unscheduled = sorted.filter(t => !t.start_time)

  return (
    <section className="today-card">
      {storageError && (
        <div className="storage-error">
          ⚠ 数据可能没存上（浏览器存储不可用），请勿关闭页面
        </div>
      )}

      <p className="today-date">
        {dateStr} 星期{weekMap[today.getDay()]}
      </p>

      {/* 视图切换：清单 / 时间块（PRD 验收第 7 条） */}
      <div className="view-toggle">
        <button
          className={view === 'list' ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => setView('list')}
        >
          清单
        </button>
        <button
          className={view === 'block' ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => setView('block')}
        >
          时间块
        </button>
        <button className="add-entry-btn" onClick={goAdd} title="添加任务">
          +
        </button>
      </div>

      <h2 className="today-title">今日任务清单</h2>

      <div className="progress-area">
        <p className="progress-text">
          已完成 <span className="progress-num">{doneCount}</span> /{' '}
          {todayTasks.length}
          <span className="progress-percent">（{percent}%）</span>
        </p>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="quick-add">
        <input
          className="quick-add-input"
          type="text"
          placeholder="快速添加：只填标题，回车即可"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="quick-add-btn"
          onClick={handleAdd}
          disabled={!input.trim()}
        >
          添加
        </button>
      </div>

      {/* ---------- 清单视图 ---------- */}
      {view === 'list' &&
        (sorted.length === 0 ? (
          <p className="today-placeholder">
            今天还没有任务，点右上角 + 或在上面输入框加一条吧
          </p>
        ) : (
          <ul className="task-list">
            {sorted.map(task => (
              <li
                key={task.id}
                className={
                  task.status === '已完成' ? 'task-item done' : 'task-item'
                }
              >
                <input
                  type="checkbox"
                  checked={task.status === '已完成'}
                  onChange={() => refresh(toggleTask(task.id))}
                />
                <span
                  className="priority-dot"
                  style={{ background: PRIORITY_COLOR[task.priority] }}
                  title={`优先级：${task.priority}`}
                />
                <span className="task-title">{task.title}</span>
                {task.start_time && (
                  <span className="task-time">{task.start_time}</span>
                )}
                <button
                  className="task-delete"
                  onClick={() => refresh(deleteTask(task.id))}
                  title="删除这条任务"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ))}

      {/* ---------- 时间块视图 ---------- */}
      {view === 'block' && (
        <div className="time-block-area">
          {sorted.length === 0 ? (
            <p className="today-placeholder">没有任务可排</p>
          ) : (
            <>
              {scheduled.length === 0 && (
                <p className="block-section-hint">今天还没有安排时段的任务</p>
              )}
              {scheduled.map(task => (
                <div
                  key={task.id}
                  className={
                    task.status === '已完成'
                      ? 'time-block done'
                      : 'time-block'
                  }
                >
                  <span className="block-time">
                    {task.start_time}–{addMinutes(task.start_time, task.estimated_min)}
                  </span>
                  <span className="block-title">{task.title}</span>
                  <span className="block-meta">
                    {task.estimated_min} 分钟 · 优先级{task.priority}
                  </span>
                </div>
              ))}
              {unscheduled.length > 0 && (
                <>
                  <p className="block-section-hint">未安排时段</p>
                  {unscheduled.map(task => (
                    <div
                      key={task.id}
                      className={
                        task.status === '已完成'
                          ? 'time-block plain done'
                          : 'time-block plain'
                      }
                    >
                      <span className="block-title">{task.title}</span>
                      <span className="block-meta">
                        {task.estimated_min} 分钟 · 优先级{task.priority}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default TodayPage
