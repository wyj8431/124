import fs from 'node:fs'
import path from 'node:path'

// 工单编号：网站学院-All poster低代码开发平台--Cursor或者Trae配置代码审查Skills能力工单

export const SEVERITY_ORDER = ['high', 'medium', 'low', 'info']

const SCOPE_CATEGORIES = {
  'changed-files': null,
  'component-standards': new Set(['component-standards']),
  'performance-issues': new Set(['performance', 'dependency-risk']),
  'types-and-contracts': new Set(['types-and-contracts', 'correctness']),
}

function severityAtLeast(severity, threshold) {
  return SEVERITY_ORDER.indexOf(severity) <= SEVERITY_ORDER.indexOf(threshold)
}

function isSourceFile(filePath) {
  return /\.(?:ts|tsx|js|jsx|mjs|cjs|vue|css)$/.test(filePath)
}

function isTestFile(filePath) {
  return /(?:^|[\\/])(?:test|tests|__tests__)(?:[\\/]|$)|\.(?:test|spec)\.[^.]+$/.test(filePath)
}

function isReviewToolingFile(filePath) {
  return /^(?:\.codex\/skills\/code-review|cursor-skills\/code-review)\/scripts\//.test(filePath)
}

function isExcludedPath(filePath, excludeDirectories = []) {
  const normalizedFilePath = filePath.replaceAll('\\', '/').replace(/^\.\//, '')
  return excludeDirectories.some((directory) => {
    const normalizedDirectory = String(directory).replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/$/, '')
    return normalizedDirectory && (normalizedFilePath === normalizedDirectory || normalizedFilePath.startsWith(`${normalizedDirectory}/`) || normalizedFilePath.includes(`/${normalizedDirectory}/`))
  })
}

function lineNumberForMatch(lines, matcher, start = 0) {
  for (let index = start; index < lines.length; index += 1) {
    if (matcher(lines[index], index)) return index + 1
  }
  return 1
}

function addFinding(findings, finding, options) {
  if (options.enabledRuleIds && !options.enabledRuleIds.has(finding.id)) return
  const configuredSeverity = options.ruleSeverities?.[finding.id]
  const normalizedFinding = configuredSeverity ? { ...finding, severity: configuredSeverity } : finding
  const categories = SCOPE_CATEGORIES[options.scope]
  if (categories && !categories.has(normalizedFinding.category)) return
  if (!severityAtLeast(normalizedFinding.severity, options.severityThreshold)) return
  findings.push({ ...normalizedFinding, line: Math.max(1, normalizedFinding.line || 1) })
}

function resolveLocalImport(rootDir, filePath, importPath) {
  const absoluteBase = path.resolve(rootDir, path.dirname(filePath), importPath)
  const candidates = [absoluteBase]
  for (const extension of ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.css']) candidates.push(`${absoluteBase}${extension}`)
  for (const extension of ['.ts', '.tsx', '.js', '.jsx', '.vue']) candidates.push(path.join(absoluteBase, `index${extension}`))
  return candidates.some((candidate) => fs.existsSync(candidate))
}

function nearestPackageManifest(rootDir, filePath) {
  let directory = path.resolve(rootDir, path.dirname(filePath))
  const root = path.resolve(rootDir)
  while (directory.startsWith(root)) {
    const candidate = path.join(directory, 'package.json')
    if (fs.existsSync(candidate)) return candidate
    const parent = path.dirname(directory)
    if (parent === directory) break
    directory = parent
  }
  return null
}

function declaredDependencies(manifestPath) {
  if (!manifestPath) return new Set()
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    return new Set([
      ...Object.keys(manifest.dependencies || {}),
      ...Object.keys(manifest.devDependencies || {}),
      ...Object.keys(manifest.peerDependencies || {}),
      ...Object.keys(manifest.optionalDependencies || {}),
    ])
  } catch {
    return new Set()
  }
}

function packageNameFromImport(importPath) {
  if (importPath.startsWith('@')) return importPath.split('/').slice(0, 2).join('/')
  return importPath.split('/')[0]
}

function scanLocalImports(filePath, content, rootDir, findings, options, changedLines) {
  if (isTestFile(filePath)) return
  const importPattern = /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()(['"])(\.\.?\/[^'"]+)\1/g
  let match
  while ((match = importPattern.exec(content))) {
    if (resolveLocalImport(rootDir, filePath, match[2])) continue
    const line = content.slice(0, match.index).split('\n').length
    if (changedLines && !changedLines.has(line)) continue
    addFinding(findings, {
      id: 'correctness/missing-local-import',
      category: 'correctness',
      severity: 'high',
      file: filePath,
      line,
      title: 'Local import target does not exist',
      evidence: match[2],
      recommendation: 'Correct the relative path or add the missing module before merging.',
      fix: `Check ${match[2]} from ${filePath}`,
    }, options)
  }
}

function scanUndeclaredImports(filePath, content, rootDir, findings, options, changedLines) {
  if (!isSourceFile(filePath) || isTestFile(filePath)) return
  const manifestPath = nearestPackageManifest(rootDir, filePath)
  const dependencies = declaredDependencies(manifestPath)
  if (!dependencies.size) return
  const importPattern = /(?:from\s+|import\s*\()(['"])([^'"./][^'"]*)\1/g
  let match
  while ((match = importPattern.exec(content))) {
    const packageName = packageNameFromImport(match[2])
    if (match[2].startsWith('@/') || match[2].startsWith('#/') || match[2].startsWith('node:') || ['react', 'react-dom'].includes(packageName) || dependencies.has(packageName)) continue
    const line = content.slice(0, match.index).split('\n').length
    if (changedLines && !changedLines.has(line)) continue
    addFinding(findings, {
      id: 'dependency/undeclared-import',
      category: 'dependency-risk',
      severity: 'medium',
      file: filePath,
      line,
      title: 'Imported package is not declared in the nearest package manifest',
      evidence: match[2],
      recommendation: `Add ${packageName} to the package manifest or remove the undeclared import.`,
    }, options)
  }
}

function scanContentRules(filePath, content, findings, options, changedLines) {
  if (isTestFile(filePath) || isReviewToolingFile(filePath) || (!isSourceFile(filePath) && path.basename(filePath) !== 'package.json')) return
  const lines = content.split(/\r?\n/)
  const sourceLines = lines.map((text, index) => ({ text, line: index + 1 })).filter(({ line }) => !changedLines || changedLines.has(line))

  for (const { text, line } of sourceLines) {
    const explicitAny = /:\s*any\b|<any>|\bany\[\]/.test(text)
    if (explicitAny) {
      addFinding(findings, {
        id: 'types/no-explicit-any',
        category: 'types-and-contracts',
        severity: 'medium',
        file: filePath,
        line,
        title: 'Avoid an explicit any type',
        evidence: text.trim(),
        recommendation: 'Use a domain type or unknown with a narrowed guard so the contract remains visible.',
        fix: 'Replace any with the smallest concrete interface needed by this path.',
      }, options)
    }
    if (/\bas\s+any\b/.test(text)) {
      addFinding(findings, {
        id: 'types/unsafe-cast',
        category: 'types-and-contracts',
        severity: 'medium',
        file: filePath,
        line,
        title: 'Unsafe cast bypasses TypeScript checking',
        evidence: text.trim(),
        recommendation: 'Narrow the value with a type guard or update the source type instead of casting to any.',
      }, options)
    }
    if (/console\.(?:log|info|warn)\s*\(/.test(text) && !isTestFile(filePath) && !/scripts?[\\/]/.test(filePath)) {
      addFinding(findings, {
        id: 'performance/console-in-production',
        category: 'performance',
        severity: 'low',
        file: filePath,
        line,
        title: 'Console output is present in application code',
        evidence: text.trim(),
        recommendation: 'Remove the log or route it through the project logger before shipping.',
      }, options)
    }
    const defaultFunction = text.match(/export\s+default\s+function\s+([a-z][A-Za-z0-9_]*)/)
    if (defaultFunction) {
      addFinding(findings, {
        id: 'component/name-export',
        category: 'component-standards',
        severity: 'low',
        file: filePath,
        line,
        title: 'React component export should use PascalCase',
        evidence: defaultFunction[1],
        recommendation: 'Use a PascalCase component name so the JSX boundary is unambiguous.',
        fix: `export default function ${defaultFunction[1][0].toUpperCase()}${defaultFunction[1].slice(1)}() {}`,
      }, options)
    }
  }

  const effectStartPattern = /\buseEffect\s*\(\s*\(?.*?=>\s*\{?/g
  let effectMatch
  while ((effectMatch = effectStartPattern.exec(content))) {
    const startLine = content.slice(0, effectMatch.index).split('\n').length
    if (changedLines && !changedLines.has(startLine)) continue
    const block = content.slice(effectMatch.index, effectMatch.index + 2400)
    if (!/\},\s*\[[^\]]*\]\s*\)/s.test(block) && !/\},\s*\[\]\s*\)/s.test(block)) {
      addFinding(findings, {
        id: 'performance/effect-dependencies',
        category: 'performance',
        severity: 'medium',
        file: filePath,
        line: startLine,
        title: 'Effect dependency array is missing or not visible',
        evidence: lines[startLine - 1]?.trim() || 'useEffect(...)',
        recommendation: 'Declare the values used by the effect in its dependency array, or document why the effect is intentionally one-shot.',
      }, options)
    }
  }

  if (filePath.endsWith('.json') && path.basename(filePath) === 'package.json') {
    for (const { text, line } of sourceLines) {
      if (/"[^"\n]+"\s*:\s*"\*"/.test(text)) {
        addFinding(findings, {
          id: 'dependency/wildcard-version',
          category: 'dependency-risk',
          severity: 'medium',
          file: filePath,
          line,
          title: 'Wildcard dependency version makes builds non-reproducible',
          evidence: text.trim(),
          recommendation: 'Pin the dependency to a compatible major/minor range approved by the project.',
        }, options)
      }
    }
  }
}

function scanVerification(filePath, content, allPaths, findings, options, changedLines) {
  if (!isSourceFile(filePath) || isTestFile(filePath)) return
  if (!/\bexport\s+(?:default\s+)?(?:function|class|const|async function)\b/.test(content)) return
  const stem = path.basename(filePath).replace(/\.(?:tsx?|jsx?|vue)$/, '')
  const hasFocusedTest = allPaths.some((candidate) => isTestFile(candidate) && candidate.toLowerCase().includes(stem.toLowerCase()))
  if (hasFocusedTest) return
  const line = lineNumberForMatch(content.split(/\r?\n/), (text) => /\bexport\s+/.test(text))
  if (changedLines && !changedLines.has(line)) return
  addFinding(findings, {
    id: 'verification/missing-focused-test',
    category: 'verification',
    severity: 'info',
    file: filePath,
    line,
    title: 'Exported behavior has no nearby focused test',
    evidence: `No test path matched ${stem}`,
    recommendation: 'Add or update a focused test covering the changed success, empty, and error paths.',
  }, options)
}

export function analyzeFiles(files, options = {}) {
  const normalizedOptions = {
    rootDir: process.cwd(),
    scope: 'changed-files',
    severityThreshold: 'info',
    maxFindings: 100,
    excludeDirectories: [],
    ...options,
  }
  const findings = []
  const allPaths = files.map((file) => file.path)
  for (const file of files) {
    const filePath = file.path.replaceAll('\\', '/')
    const content = file.content || ''
    const changedLines = file.addedLines instanceof Set ? file.addedLines : null
    if (isExcludedPath(filePath, normalizedOptions.excludeDirectories)) continue
    if (isSourceFile(filePath)) scanLocalImports(filePath, content, normalizedOptions.rootDir, findings, normalizedOptions, changedLines)
    scanUndeclaredImports(filePath, content, normalizedOptions.rootDir, findings, normalizedOptions, changedLines)
    scanContentRules(filePath, content, findings, normalizedOptions, changedLines)
    scanVerification(filePath, content, allPaths, findings, normalizedOptions, changedLines)
  }

  const deduped = [...new Map(findings.map((finding) => [`${finding.id}:${finding.file}:${finding.line}`, finding])).values()]
  deduped.sort((left, right) => {
    const severityDelta = SEVERITY_ORDER.indexOf(left.severity) - SEVERITY_ORDER.indexOf(right.severity)
    return severityDelta || left.file.localeCompare(right.file) || left.line - right.line
  })
  const limited = deduped.slice(0, normalizedOptions.maxFindings)
  const bySeverity = Object.fromEntries(SEVERITY_ORDER.map((severity) => [severity, limited.filter((finding) => finding.severity === severity).length]))
  const byCategory = {}
  for (const finding of limited) byCategory[finding.category] = (byCategory[finding.category] || 0) + 1
  return {
    schemaVersion: '1.0',
    scope: normalizedOptions.scope,
    summary: { total: limited.length, bySeverity, byCategory },
    files: allPaths,
    findings: limited,
    verification: { commands: [], status: 'not-run' },
  }
}

export function reportToMarkdown(report) {
  const { summary } = report
  const lines = [
    '# Code Review Report',
    '',
    `Scope: \`${report.scope}\``,
    `Files: ${report.files.length}`,
    `Findings: ${summary.total} (high ${summary.bySeverity.high}, medium ${summary.bySeverity.medium}, low ${summary.bySeverity.low}, info ${summary.bySeverity.info})`,
    '',
  ]
  if (!report.findings.length) {
    lines.push('No actionable findings were detected for this scope.', '')
    return lines.join('\n')
  }
  lines.push('| Severity | Category | Location | Finding | Recommendation |', '| --- | --- | --- | --- | --- |')
  for (const finding of report.findings) {
    const recommendation = finding.recommendation.replaceAll('|', '\\|')
    lines.push(`| ${finding.severity} | ${finding.category} | ${finding.file}:${finding.line} | ${finding.title} | ${recommendation} |`)
  }
  lines.push('', '## Evidence')
  for (const finding of report.findings) lines.push('- **' + finding.file + ':' + finding.line + '** `' + finding.id + '`: ' + finding.evidence)
  return lines.join('\n')
}
