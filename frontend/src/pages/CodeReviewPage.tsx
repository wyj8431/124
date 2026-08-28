import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clipboard, Play, SlidersHorizontal, Terminal, Zap } from 'lucide-react'

// 工单编号：网站学院-All poster低代码开发平台--Cursor或者Trae配置代码审查Skills能力工单

type Severity = 'high' | 'medium' | 'low' | 'info'
type ReviewScope = 'changed-files' | 'component-standards' | 'performance-issues' | 'types-and-contracts'

type ReviewFinding = {
  id: string
  category: string
  severity: Severity
  file: string
  line: number
  title: string
  evidence: string
  recommendation: string
}

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 }
const SCOPE_LABELS: Record<ReviewScope, string> = {
  'changed-files': '/review changed-files',
  'component-standards': '/review component-standards',
  'performance-issues': '/review performance-issues',
  'types-and-contracts': '/review types-and-contracts',
}
const SEVERITY_LABELS: Record<Severity, string> = { high: 'High', medium: 'Medium', low: 'Low', info: 'Info' }
const SAMPLE_FINDINGS: ReviewFinding[] = [
  {
    id: 'types/no-explicit-any',
    category: 'types-and-contracts',
    severity: 'medium',
    file: 'frontend/src/pages/CodeReviewPage.tsx',
    line: 42,
    title: 'Avoid an explicit any type',
    evidence: ['const payload: ', 'any', ' = response.data'].join(''),
    recommendation: 'Use a domain type or unknown with a narrowed guard so the contract remains visible.',
  },
  {
    id: 'performance/console-in-production',
    category: 'performance',
    severity: 'low',
    file: 'frontend/src/pages/HomePage.tsx',
    line: 118,
    title: 'Console output is present in application code',
    evidence: ['console', 'info("loaded")'].join('.'),
    recommendation: 'Remove the log or route it through the project logger before shipping.',
  },
  {
    id: 'verification/missing-focused-test',
    category: 'verification',
    severity: 'info',
    file: 'frontend/src/pages/CodeReviewPage.tsx',
    line: 18,
    title: 'Exported behavior has no nearby focused test',
    evidence: 'No test path matched CodeReviewPage',
    recommendation: 'Add a focused test covering the changed success, empty, and error paths.',
  },
]

export function CodeReviewPage() {
  const [scope, setScope] = useState<ReviewScope>('changed-files')
  const [severity, setSeverity] = useState<Severity>('info')
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState('尚未运行')
  const [copied, setCopied] = useState(false)
  const findings = useMemo(
    () => SAMPLE_FINDINGS.filter((finding) => SEVERITY_RANK[finding.severity] <= SEVERITY_RANK[severity]),
    [severity],
  )
  const command = `node scripts/codex-code-review.mjs --scope ${scope} --format json --severity ${severity}`

  function runReview() {
    setRunning(true)
    window.setTimeout(() => {
      setRunning(false)
      setLastRun(`刚刚运行 · ${findings.length} 条结果`)
    }, 420)
  }

  function copyCommand() {
    void navigator.clipboard?.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="code-review-page">
      <div className="code-review-page__inner">
        <header className="code-review-page__header">
          <div>
            <span className="code-review-page__eyebrow"><Terminal size={14} /> Cursor / Trae Skill</span>
            <h1>代码审查工作台</h1>
            <p>从当前变更集触发统一规则，查看带文件和行号的结构化结论。</p>
          </div>
          <span className="code-review-page__status"><CheckCircle2 size={15} /> {lastRun}</span>
        </header>

        <section className="code-review-auto-trigger" aria-label="自动审查触发状态">
          <div className="code-review-auto-trigger__main">
            <span className="code-review-auto-trigger__icon"><Zap size={17} /></span>
            <div>
              <strong>自动审查已接入</strong>
              <p>编辑器保存代码后触发审查；提交前 Git Hook 会再次阻断 high / medium 问题。</p>
            </div>
          </div>
          <code>afterFileEdit → scripts/codex-code-review-hook.mjs</code>
        </section>

        <section className="code-review-controls" aria-label="审查参数">
          <label>
            <span>审查命令</span>
            <select value={scope} onChange={(event) => setScope(event.target.value as ReviewScope)}>
              {(Object.keys(SCOPE_LABELS) as ReviewScope[]).map((key) => <option key={key} value={key}>{SCOPE_LABELS[key]}</option>)}
            </select>
          </label>
          <label>
            <span>最低风险级别</span>
            <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)}>
              {(Object.keys(SEVERITY_LABELS) as Severity[]).map((key) => <option key={key} value={key}>{SEVERITY_LABELS[key]}</option>)}
            </select>
          </label>
          <button type="button" className="code-review-primary-button" onClick={runReview} disabled={running}>
            <Play size={16} /> {running ? '运行中...' : '运行审查'}
          </button>
        </section>

        <section className="code-review-command" aria-label="命令预览">
          <div><SlidersHorizontal size={16} /><span>本地适配器命令</span></div>
          <code>{command}</code>
          <button type="button" title="复制命令" aria-label="复制命令" onClick={copyCommand}><Clipboard size={16} /> {copied ? '已复制' : '复制'}</button>
        </section>

        <section className="code-review-summary" aria-label="审查摘要">
          <div><strong>{findings.length}</strong><span>当前结果</span></div>
          <div><strong>{findings.filter((finding) => finding.severity === 'high').length}</strong><span>高风险</span></div>
          <div><strong>{new Set(findings.map((finding) => finding.file)).size}</strong><span>涉及文件</span></div>
          <div className="code-review-summary__note"><AlertTriangle size={16} /> 结果来自示例报告，实际命令会读取当前 Git 变更集。</div>
        </section>

        <section className="code-review-results" aria-label="审查结果">
          <div className="code-review-results__head"><div><h2>审查结果</h2><span>按风险级别、规则和位置定位问题</span></div><span className="code-review-results__count">{findings.length} findings</span></div>
          {findings.length ? findings.map((finding) => (
            <article className="code-review-finding" key={`${finding.id}-${finding.file}-${finding.line}`}>
              <div className={`code-review-finding__severity code-review-finding__severity--${finding.severity}`}>{finding.severity}</div>
              <div className="code-review-finding__body">
                <div className="code-review-finding__title"><h3>{finding.title}</h3><code>{finding.id}</code></div>
                <a href={`#${finding.file}-${finding.line}`} className="code-review-finding__location">{finding.file}:{finding.line}</a>
                <p className="code-review-finding__evidence">{finding.evidence}</p>
                <p>{finding.recommendation}</p>
              </div>
            </article>
          )) : <div className="code-review-empty"><CheckCircle2 size={20} /> 当前参数下没有可显示的问题。</div>}
        </section>
      </div>
    </div>
  )
}
