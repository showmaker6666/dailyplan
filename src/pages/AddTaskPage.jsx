import React, { useState } from 'react'
import { todayStr, addTask } from '../storage/localStore'

const CATEGORIES = ['学习', '运动', '生活', '其他']
const PRIORITIES = ['高', '中', '低']

// 添加任务页（Day 7 第 3 步）：
// 必填只有标题，其余有默认值（PRD 验收第 10 条）
// estimated_min 只许正整数（验收第 12 条）
// plan_date 锁定今天、只展示不可改（PRD v1.1 / 验收第 13 条）
function AddTaskPage({ goBack }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('学习')
  const [priority, setPriority] = useState('中')
  const [estMin, setEstMin] = useState('30')
  const [startTime, setStartTime] = useState('')
  const [storageError, setStorageError] = useState(false)

  // 只保留正整数的输入：非数字字符一律剔除，0 不算（PRD 验收第 12 条）
  function handleEstMin(e) {
    let v = e.target.value.replace(/[^0-9]/g, '')
    if (v !== '' && Number(v) < 1) v = ''
    setEstMin(v)
  }

  const titleOk = title.trim() !== ''
  const estMinOk = estMin !== '' && Number(estMin) >= 1
  const canSave = titleOk && estMinOk

  function handleSave() {
    if (!canSave) return
    const result = addTask(title.trim(), {
      category,
      priority,
      estimated_min: Number(estMin),
      start_time: startTime,
    })
    if (result.ok) {
      goBack() // 保存成功返回今日页，新任务出现在列表（PRD 验收第 11 条）
    } else {
      setStorageError(true)
    }
  }

  return (
    <section className="today-card">
      <h2 className="today-title">添加任务</h2>

      {storageError && (
        <div className="storage-error">
          ⚠ 保存失败（浏览器存储不可用），请勿关闭页面
        </div>
      )}

      <div className="form-area">
        <label className="form-label">
          任务标题 <span className="required">*</span>
        </label>
        <input
          className="form-input"
          type="text"
          placeholder="例如：复习高数第三章"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <label className="form-label">分类</label>
        <select
          className="form-input"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="form-label">优先级</label>
        <select
          className="form-input"
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          {PRIORITIES.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label className="form-label">预计时长（分钟）</label>
        <input
          className="form-input"
          type="text"
          inputMode="numeric"
          placeholder="30"
          value={estMin}
          onChange={handleEstMin}
        />
        {!estMinOk && (
          <p className="field-error">只能填正整数（最少 1 分钟）</p>
        )}

        <label className="form-label">
          开始时间<span className="optional">（选填，填了才进时间块）</span>
        </label>
        <input
          className="form-input"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />

        <label className="form-label">
          计划日期<span className="optional">（锁定为今天，暂不支持改）</span>
        </label>
        <input className="form-input" type="text" value={todayStr()} disabled />

        <div className="form-buttons">
          <button className="btn-secondary" onClick={goBack}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!canSave} /* 标题为空/时长非法时置灰（验收第 9/12 条） */
          >
            保存
          </button>
        </div>
      </div>
    </section>
  )
}

export default AddTaskPage
