// storage 层：阶段 A 唯一数据出口（TECH_DESIGN 第二章、3.1 键名设计）
// 键名三件套：dp_tasks（任务数组）、dp_reviews（每日复盘）、dp_user（用户记录）
// 规矩：所有页面不许直接调 localStorage，一律经过本文件——Day 23 换数据库时只改这里

const TASKS_KEY = 'dp_tasks'
const REVIEWS_KEY = 'dp_reviews'
const USER_KEY = 'dp_user'

// 今天日期的字符串形式 YYYY-MM-DD（本地时区，不用 toISOString 是因为它按 UTC 算会差 8 小时）
export function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    // 数据损坏时不让整页崩溃：当作空数据继续，错误打印到控制台
    console.error(`读取 ${key} 失败:`, e)
    return fallback
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return { ok: true }
  } catch (e) {
    // TECH_DESIGN 第六章：写入失败不静默丢数据，返回失败标记，由页面提示用户
    console.error(`写入 ${key} 失败:`, e)
    return { ok: false, error: String(e) }
  }
}

// ---------- 任务（dp_tasks） ----------

export function loadTasks() {
  return readJson(TASKS_KEY, [])
}

function saveTasks(tasks) {
  return writeJson(TASKS_KEY, tasks)
}

// 新增任务：字段对齐 PRD 第五章 + TECH_DESIGN 3.1 补充字段（id / created_at）
// plan_date 按 PRD v1.1 锁定今天，调用方不许传别的日期
export function addTask(title, extra = {}) {
  const tasks = loadTasks()
  const task = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // 唯一编号，防重名
    title: title,
    category: extra.category || '学习',
    priority: extra.priority || '中',
    estimated_min: extra.estimated_min || 30,
    start_time: extra.start_time || '',
    status: '未完成',
    plan_date: todayStr(),
    created_at: new Date().toISOString(),
  }
  tasks.push(task)
  const result = saveTasks(tasks)
  return { ok: result.ok, task }
}

// 打勾/取消打勾：未完成 ↔ 已完成 来回切换
export function toggleTask(id) {
  const tasks = loadTasks()
  const t = tasks.find(t => t.id === id)
  if (t) t.status = t.status === '已完成' ? '未完成' : '已完成'
  return saveTasks(tasks)
}

// 删除任务（PRD 3.1：直接删，不做回收站/撤销）
export function deleteTask(id) {
  const tasks = loadTasks().filter(t => t.id !== id)
  return saveTasks(tasks)
}

// ---------- 复盘（dp_reviews） ----------

export function loadReviews() {
  return readJson(REVIEWS_KEY, [])
}

export function saveReviews(reviews) {
  return writeJson(REVIEWS_KEY, reviews)
}

// ---------- 用户记录（dp_user） ----------

export function loadUser() {
  return readJson(USER_KEY, { streak_days: 0, last_active_date: null })
}

export function saveUser(user) {
  return writeJson(USER_KEY, user)
}

// ---------- 统计（今日完成率 / streak_days） ----------

// 日期字符串加减天数（本地时区，不走 UTC）
function shiftDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${mm}-${dd}`
}

// 某天的完成率：完成数 ÷ 总数 × 100%，无任务记 0%（PRD 验收第 14 条）
function rateFor(date) {
  const tasks = loadTasks().filter(t => t.plan_date === date)
  const done = tasks.filter(t => t.status === '已完成').length
  return tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)
}

export function getTodayStats() {
  const tasks = loadTasks().filter(t => t.plan_date === todayStr())
  const done = tasks.filter(t => t.status === '已完成').length
  return { total: tasks.length, done, rate: rateFor(todayStr()) }
}

// streak_days：从任务记录推导"连续每天至少完成 1 个任务"的天数
// 规则（PRD v1.1 / 验收第 16 条）：今天还没完成不算断（今天还没过完）；
// 往前逐天查，跨过一个无完成的自然日（含整天没打开网站）即归零
export function computeStreak() {
  const doneDates = new Set(
    loadTasks()
      .filter(t => t.status === '已完成')
      .map(t => t.plan_date)
  )
  let streak = 0
  let cursor = todayStr()
  if (!doneDates.has(cursor)) cursor = shiftDays(cursor, -1)
  while (doneDates.has(cursor)) {
    streak++
    cursor = shiftDays(cursor, -1)
  }
  return streak
}

// 算好并写入 dp_user（TECH_DESIGN 3.1：last_active_date 记录活跃日，Day 23 迁 user_stats 表）
export function refreshUser() {
  const user = { streak_days: computeStreak(), last_active_date: todayStr() }
  saveUser(user)
  return user
}

// ---------- 复盘（dp_reviews，PRD 4.3） ----------

export function loadReview(date) {
  const found = loadReviews().find(r => r.date === date)
  return found ? { mood: found.mood, note: found.note } : { mood: '', note: '' }
}

// 保存当日复盘：同一日期只留一条（重复保存是更新）
// completion_rate 是保存那一刻的完成率快照（PRD 第五章）
export function saveReview(date, mood, note) {
  const reviews = loadReviews()
  const entry = { date, completion_rate: rateFor(date), mood, note }
  const idx = reviews.findIndex(r => r.date === date)
  if (idx >= 0) reviews[idx] = entry
  else reviews.push(entry)
  return saveReviews(reviews)
}

// ---------- mock 演示注入（Day 8；Day 23 可删） ----------

// 一键注入演示假任务：合并进现有任务，同标题不重复添加，不动你的真实数据
export function fillMockTasks(mockTasks) {
  const tasks = loadTasks()
  const titles = new Set(tasks.map(t => t.title))
  const additions = mockTasks.filter(t => !titles.has(t.title))
  if (additions.length === 0) return { ok: true, added: 0 }
  const result = saveTasks([...tasks, ...additions])
  return { ok: result.ok, added: additions.length }
}

// ---------- 设置页用（导出 / 清空） ----------

export function exportAllData() {
  return {
    app: 'dailyplan',
    exported_at: new Date().toISOString(),
    tasks: loadTasks(),
    reviews: loadReviews(),
    user: loadUser(),
  }
}

export function clearAllData() {
  try {
    window.localStorage.removeItem(TASKS_KEY)
    window.localStorage.removeItem(REVIEWS_KEY)
    window.localStorage.removeItem(USER_KEY)
    return { ok: true }
  } catch (e) {
    console.error('清空数据失败:', e)
    return { ok: false, error: String(e) }
  }
}
