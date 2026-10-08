import React, { useState } from 'react'
import { todayStr, exportAllData, clearAllData } from '../storage/localStore'

// 设置页（Day 7 第 4 步）：
// 导出 JSON 备份 + 清空数据（PRD 4.4，验收第 18/19 条）
// 清空用"两步确认"：第一次点只是变红警示，再点一次才真清
function SettingsPage() {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  function handleExport() {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dailyplan_backup_${todayStr()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setError(false)
    setMessage('备份文件已生成，看浏览器右下角的下载栏')
  }

  function handleClear() {
    if (!confirming) {
      setConfirming(true) // 第一次点：只进入确认状态，不动数据
      return
    }
    const result = clearAllData()
    setConfirming(false)
    setError(!result.ok)
    setMessage(result.ok ? '已清空全部本地数据' : '清空失败，请截图后联系 AI 排查')
  }

  return (
    <section className="today-card">
      <h2 className="today-title">设置</h2>

      <div className="settings-item">
        <div>
          <p className="settings-name">导出数据备份</p>
          <p className="settings-desc">
            把全部任务、复盘、统计导出成一个 JSON 文件（存到你的下载文件夹）
          </p>
        </div>
        <button className="btn-secondary" onClick={handleExport}>
          导出
        </button>
      </div>

      <div className="settings-item">
        <div>
          <p className="settings-name danger">清空全部数据</p>
          <p className="settings-desc">
            删除本地保存的所有任务和复盘，不可恢复（建议先导出备份）
          </p>
        </div>
        {confirming ? (
          <span className="confirm-group">
            <button className="btn-secondary" onClick={() => setConfirming(false)}>
              取消
            </button>
            <button className="btn-danger" onClick={handleClear}>
              确认清空
            </button>
          </span>
        ) : (
          <button className="btn-danger-outline" onClick={handleClear}>
            清空
          </button>
        )}
      </div>

      {message && (
        <p className={error ? 'settings-msg error' : 'settings-msg'}>{message}</p>
      )}

      <p className="settings-footnote">
        所有数据仅存本机浏览器（localStorage），不上传任何服务器（PRD 验收第
        22 条）
      </p>
    </section>
  )
}

export default SettingsPage
