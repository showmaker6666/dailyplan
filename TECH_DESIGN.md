# dailyplan 技术设计文档（TECH_DESIGN.md）

> Day 5 产出 ｜ 2026-10-06 ｜ 作者：showmaker6666（AI 协助撰写）
> 依据：PRD.md v1.1（Day 4）＋ Day 5 技术规格

## 一、技术路线与理由

**默认路线（一句话）**：React/Vite（前端） + localStorage（MVP 数据） → Day 23 接 CloudBase Node.js 云函数 + CloudBase PostgreSQL，部署用 CloudBase 静态网站托管。

**两阶段结构**（与 PRD "MVP 先 localStorage、Day 23 升级数据库"一致）：

| 阶段 | 时间 | 架构 | 说明 |
|---|---|---|---|
| A（MVP） | Day 7–22 | 纯前端 + localStorage，无后端无 API | 先跑通"记任务→打勾→看反馈"闭环 |
| B（升级） | Day 23–28 | 前端 + CloudBase 云函数 + PostgreSQL | 数据上云，支持换设备 |

**方案比较（3 套）**：

| | 路线一：示范路线（React+Vite / CloudBase 全家桶） | 路线二：纯原生（HTML/JS + GitHub Pages） | 路线三：Vue + 多平台拼装 |
|---|---|---|---|
| 上手难度 | React 概念多，但 vibe coding 下代码由 AI 写、用户验收 | 最低，直接开写 | Vue 略缓于 React |
| 生态/资料 | React 全球第一，卡住必有答案 | 多但零散 | 多 |
| 平台分散度 | **一家全包**（托管/云函数/数据库同一控制台） | MVP 简单，Day 23 仍要另找后端 | 三个平台三套账号 |
| 后期升级 | 顺滑，只加不改 | 四页面无组件复用，升级要重构 | 拼装零散 |
| 代价 | 需接受 npm/打包/组件概念；CloudBase 免费额度有限 | 维护吃力 | 与课程示范不一致 |

**选路线一的理由**：① 课程示范配套，出问题可对照；② CloudBase 一家全包，零基础少开账号少踩坑；③ React 生态最大，AI 编写更稳、用户排错资料最多。**代价如实记录**：前期要消化构建工具概念；免费额度超限需留意（本项目体量远够用）。

## 二、项目结构

```
dailyplan/
├── index.html              # 入口页面（Vite 生成）
├── package.json            # 项目"采购清单"，记录依赖（npm 用）
├── .env                    # 环境变量（Day 23 用，已在 .gitignore 禁运名单）
├── .gitignore
├── PRD.md / research.md / AGENTS.md / TECH_DESIGN.md
├── src/
│   ├── main.jsx            # 程序入口：把 App 挂到页面上
│   ├── App.jsx             # 总壳：页面路由（今日/添加/统计/设置）
│   ├── pages/              # 四个页面组件
│   │   ├── TodayPage.jsx       # 今日页
│   │   ├── AddTaskPage.jsx     # 添加任务页
│   │   ├── StatsPage.jsx       # 统计页
│   │   └── SettingsPage.jsx     # 设置页
│   ├── components/         # 可复用小零件（任务条、进度条、导航栏）
│   └── storage/
│       └── localStore.js   # localStorage 读写（阶段 A 唯一数据出口）
└── functions/              # 【阶段 B 新增】云函数
    └── api/                # 云函数：数据库的"看门人"
```

## 三、数据模型

### 3.1 localStorage 键名设计（阶段 A）

数据以 JSON 文本存浏览器，键名三件套（对齐 PRD 第五章，字段不变）：

| 键名 | 存什么 | 结构示例 |
|---|---|---|
| `dp_tasks` | 全部任务数组 | `[{id, title, category, priority, estimated_min, start_time, status, plan_date, created_at}]` |
| `dp_reviews` | 每日复盘数组 | `[{date, completion_rate, mood, note}]` |
| `dp_user` | 用户记录 | `{streak_days, last_active_date}` |

> 补充字段说明：`id` 是每条任务的唯一编号（防止重名）；`created_at` 用于"同优先级按添加时间排序"（PRD 验收第 4 条）；`last_active_date` 用于 streak_days 断天判定。

### 3.2 PostgreSQL 表结构（阶段 B，Day 23）

| 表 | 字段 | 对应 localStorage 键 |
|---|---|---|
| tasks | id(PK), title, category, priority, estimated_min, start_time, status, plan_date, created_at | dp_tasks |
| reviews | date(PK), completion_rate, mood, note | dp_reviews |
| user_stats | id(PK=1 单行), streak_days, last_active_date | dp_user |

## 四、API 列表（阶段 B 专属，Day 23 实现）

前端永远不直接碰数据库，一律走云函数：

| API | 方法 | 入参 | 出参 | 干什么 |
|---|---|---|---|---|
| /tasks | GET | date（可选，默认今天） | 任务数组 | 取任务列表 |
| /tasks | POST | 完整任务对象 | 新任务（含 id） | 新增任务 |
| /tasks/:id | PUT | 要改的字段 | 更新后任务 | 改状态/编辑 |
| /tasks/:id | DELETE | id | 成功标志 | 删除任务 |
| /review | GET / PUT | date | 当日复盘 | 读/写当日复盘 |
| /stats | GET | 无 | streak_days 等 | 取用户统计 |

## 五、前后端数据流（ASCII 图）

**阶段 A（Day 7–22，MVP）：前端自理，数据不出浏览器**

```
┌─────────────────────────────── 浏览器 ───────────────────────────────┐
│                                                                     │
│   用户操作            前端页面 (React)            localStorage       │
│  ─────────          ───────────────────          ────────────       │
│                                                                     │
│   输入任务 ──→ [添加任务页] 校验打包 ──写──→ (dp_tasks)              │
│   打勾/删除 ──→ [今日页] 改状态 ────写────→ (dp_tasks)              │
│   看反馈  ←──  [统计页/今日页] ←──读──── (dp_tasks/dp_reviews/dp_user)│
│   写复盘  ──→ [统计页] 打包 ─────写───→ (dp_reviews)                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ×  云端不参与，数据只在本机浏览器 ×
```

**阶段 B（Day 23–28）：前端递包裹，专人管仓库**

```
┌──────────── 浏览器 ─────────────┐      ┌──────── CloudBase 云端 ────────┐
│                                │      │                                │
│  用户操作 → 前端页面            │ HTTPS│  云函数（看门人）    PostgreSQL  │
│                              │      │                                │
│  添加/打勾/删除 ──→ 调 API ───────→  校验合法 ──写──→ (tasks 表)      │
│  看统计/复盘   ←── 调 API ───────←  查询结果 ←──读── (reviews/user_stats)│
│                                │      │                                │
└────────────────────────────────┘      └────────────────────────────────┘
```

**一句话（今天要掌握的答案）**：数据从**用户在前端页面的输入**来（敲键盘填表单），到 **localStorage（MVP）/ PostgreSQL（Day 23 后）**去，中间在阶段 B 多一道云函数安检。

## 六、错误处理

| 场景 | 谁负责 | 处理方式 |
|---|---|---|
| 标题为空 / estimated_min 非正整数 | 前端 | 拦在保存之前（按钮置灰或提示），PRD 验收 10/14 条 |
| localStorage 写入失败（罕见：隐私模式/空间满） | 前端 storage 层 | 页面顶部红条提示"数据可能没存上，请勿关页面"，不静默丢数据 |
| 云函数调用失败（阶段 B） | 前端 + 云函数 | 统一错误码：401 未登录 / 400 参数错 / 500 服务错；前端按码提示人话（"网络问题，稍后再试"），不暴露英文堆栈 |
| 云函数内部异常 | 云函数 | 每次操作写日志（CloudBase 控制台可查），返回统一错误壳，不把数据库地址等敏感信息带回前端 |

## 七、环境变量（.env）

`.env` 存"不能进 git 的配置"（Day 2 的 .gitignore 禁运名单第一名就是它）：

| 变量 | 什么时候用 | 示例 |
|---|---|---|
| `VITE_TCB_ENV_ID` | Day 23，前端连 CloudBase 环境 | `dailyplan-1a2b3c` |
| `TCB_SECRET` | Day 23，云函数鉴权（如需） | 云端生成 |

**规矩**：仓库里放一份 `.env.example`（只有变量名没真值），真人配置复制它改名成 `.env` 填真值——.example 能上传，.env 永不上传。

## 八、迁移注意事项（Day 23：localStorage → PostgreSQL）

1. **先建库后搬家**：表建好、API 跑通，再搬数据，顺序反了数据没地方落；
2. **搬家是"复制"不是"剪切"**：localStorage 旧数据保留到验证无误，再考虑清理（出问题可回退到阶段 A）；
3. **一次性搬迁入口**：在设置页加"上传历史数据"按钮，把 dp_tasks/dp_reviews/dp_user 整体 POST 给云函数批量入库，避免手工逐条录；
4. **字段映射核对着迁**：localStorage 的字段名 = 表字段名（第三章 3.2 已对齐），迁完抽查 3 条数据核对；
5. **搬完重点回归**：PRD 验收 21–23 条（数据不丢失）要在新链路下重测一遍。

---

*文档版本：v1.0（Day 5）｜ 下一步：Day 7 按 PRD 第六章 23 条验收标准开发 MVP*
