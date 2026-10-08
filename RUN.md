# dailyplan 运行说明（RUN.md）

> Day 7 存档 ｜ 2026-10-08 ｜ 给"以后任何一天想把这个网站跑起来的人"（包括未来的你和 AI）

## 一、这是什么

dailyplan——给"想努力但缺乏规划、容易拖延"的大学生用的极简每日任务清单网站。
MVP 版本：今日任务清单（清单/时间块双视图）+ 添加任务 + 统计 + 设置，数据存在你自己的浏览器里。

## 二、环境要求

| 需要什么 | 怎么检查 | 没有怎么办 |
|---|---|---|
| Node.js 18 以上 | 终端输 `node -v` | 官网 nodejs.org 下 LTS 版安装 |
| npm（随 Node 一起装） | 终端输 `npm -v` | 装 Node 就有 |
| Git（可选，拉代码用） | 终端输 `git --version` | 官网 git-scm.com 下载 |

本机已验证版本：Node v22.22.2 / npm 10.9.7 / Git 2.55.0（Windows）。

## 三、第一次跑起来（三步）

在终端里依次执行：

```cmd
cd /d D:\.workplace\dailyplan
npm install
npm run dev
```

| 步骤 | 干什么 | 成功时看到 |
|---|---|---|
| `cd /d ...` | 进入项目文件夹（`/d` 是跨到 D 盘的意思，CMD 必须加） | 提示符变成 `D:\.workplace\dailyplan>` |
| `npm install` | 按 package.json 采购依赖，装进 node_modules（**该文件夹不入 git，换电脑必须重跑这步**） | 一堆下载进度，最后出现 `added 63 packages` 之类 |
| `npm run dev` | 启动开发服务器 | 出现 `Local: http://localhost:5173/` |

然后浏览器打开 `http://localhost:5173/`，看到 dailyplan 页面即成功。

## 四、日常启停

| 想做什么 | 命令 |
|---|---|
| 启动 | `npm run dev`（项目文件夹下） |
| 停止 | 在跑着的服务窗口按 `Ctrl + C`（问 Y/N 就输 Y） |
| 改了代码想看效果 | 什么都不用做，保存文件浏览器自动刷新（Vite 热更新） |

**端口说明**：默认 5173。如果被别的程序占了，Vite 会自动换 5174、5175……以终端显示的 `Local:` 那一行为准。

## 五、数据在哪、怎么备份

- **全存本机浏览器**（localStorage），换浏览器/换电脑/清缓存 = 数据没了；
- **备份**：设置页 → 导出，得到一个 JSON 文件（含全部任务、复盘、统计）；
- **恢复/搬家**：Day 23 接上数据库后支持云端同步，现阶段只有导出文件这一条路；
- **清空**：设置页 → 清空（两步确认），删了不可恢复。

## 六、常见问题（踩过的坑）

| 症状 | 原因 | 解法 |
|---|---|---|
| `npm run dev` 报错说找不到什么包 | 没跑 `npm install`，或 node_modules 被删了 | 重跑 `npm install` |
| 命令卡住没输出 | 网络慢（npm 下载不动）或终端状态异常 | `Ctrl+C` 取消，加 `--verbose` 重试一次，仍失败带完整输出找 AI（个人规则 2） |
| 打开 localhost 页面空白 | 服务器没在跑，或端口换了 | 看终端 `Local:` 显示的地址，照着输 |
| push 卡住 | 网络到 GitHub 不稳 | 同上"卡住"处理法 |
| `.env` 文件 | 现在还没有，Day 23 才会创建；已在 .gitignore 禁运名单 | 不用管 |

## 七、项目文件地图（跑起来只依赖这些）

```
dailyplan/
├── index.html            # 网页入口
├── package.json          # 依赖清单
├── vite.config.js        # Vite 配置
├── src/
│   ├── main.jsx          # 程序起点
│   ├── App.jsx           # 总壳：页面切换
│   ├── index.css         # 全部样式
│   ├── pages/            # 四个页面
│   │   ├── TodayPage.jsx     # 今日页（清单/时间块）
│   │   ├── AddTaskPage.jsx   # 添加任务页
│   │   ├── StatsPage.jsx     # 统计页
│   │   └── SettingsPage.jsx  # 设置页
│   ├── components/
│   │   └── Navbar.jsx        # 底部导航
│   └── storage/
│       └── localStore.js     # 唯一数据出口（Day 23 换数据库只改它）
└── node_modules/         # 依赖（不入库，npm install 生成）
```

## 八、后续版本预告

- Day 23 起：接 CloudBase 云函数 + PostgreSQL，数据上云，支持换设备（详见 TECH_DESIGN.md 第八、九章）；
- 部署上线：`npm run build` 生成 dist/ 静态文件，托管到 CloudBase（Day 23+ 做，现在不用跑）。

---

*存档于 Day 7 ｜ 有新坑随时往第六节补*
