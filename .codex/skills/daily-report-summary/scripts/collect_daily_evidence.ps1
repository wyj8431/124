[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,

    [datetime]$Date = (Get-Date)
)

$ErrorActionPreference = 'Stop'

$resolvedRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$gitRootOutput = & git -C $resolvedRoot rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $gitRootOutput) {
    throw "ProjectRoot is not inside a Git worktree: $resolvedRoot"
}
$gitRoot = ($gitRootOutput | Select-Object -First 1).Trim()

$dayStart = $Date.Date
$dayEnd = $dayStart.AddDays(1)
$since = $dayStart.ToString('yyyy-MM-dd HH:mm:ss')
$until = $dayEnd.ToString('yyyy-MM-dd HH:mm:ss')

function Write-Section {
    param([string]$Name)
    Write-Output ''
    Write-Output "[$Name]"
}

Write-Output "DATE: $($dayStart.ToString('yyyy-MM-dd'))"
Write-Output "PROJECT_ROOT: $gitRoot"

Write-Section 'COMMITS_TODAY'
$commits = & git -C $gitRoot log --since="$since" --until="$until" --date=iso --pretty=format:'%h|%ad|%an|%s' --all
if ($commits) {
    $commits | Write-Output
} else {
    Write-Output '(none)'
}

Write-Section 'WORKTREE_STATUS'
$status = & git -C $gitRoot status --short
if ($status) {
    $status | Write-Output
} else {
    Write-Output '(clean)'
}

Write-Section 'UNSTAGED_DIFF_STAT'
$unstaged = & git -C $gitRoot diff --stat
if ($unstaged) {
    $unstaged | Write-Output
} else {
    Write-Output '(none)'
}

Write-Section 'STAGED_DIFF_STAT'
$staged = & git -C $gitRoot diff --cached --stat
if ($staged) {
    $staged | Write-Output
} else {
    Write-Output '(none)'
}

Write-Section 'CHANGED_PATHS'
$paths = & git -C $gitRoot status --short | ForEach-Object {
    if ($_.Length -gt 3) { $_.Substring(3) }
}
if ($paths) {
    $paths | Sort-Object -Unique | Write-Output
} else {
    Write-Output '(none)'
}
