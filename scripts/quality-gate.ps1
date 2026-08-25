[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-GateStage {
    param([string]$Name, [scriptblock]$Command)
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Quality gate failed in '$Name' with exit code $LASTEXITCODE."
    }
}

function Invoke-Native {
    param([string]$Name, [string]$File, [string[]]$Arguments, [string]$WorkingDirectory)
    Invoke-GateStage -Name $Name -Command {
        Push-Location $WorkingDirectory
        try { & $File @Arguments }
        finally { Pop-Location }
    }
}

Push-Location $repoRoot
try {
    Invoke-Native 'Whitespace check' 'git' @('diff', '--check') $repoRoot

    $nodeVersion = (& node --version 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw 'Node.js is required; install a supported Node.js release.' }
    Write-Host "Node.js: $nodeVersion"

    $pnpmVersion = (& pnpm --version 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw 'pnpm is required for admin-web; install the pinned package manager with Corepack.' }
    Write-Host "pnpm: $pnpmVersion"

    $javaVersion = (& java -version 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $javaVersion -notmatch 'version "21') {
        throw "Java 21 is required. Detected: $javaVersion"
    }
    Write-Host "Java: $javaVersion"

    Invoke-Native 'Frontend dependencies' 'npm' @('ci', '--ignore-scripts') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Frontend lint' 'npm' @('run', 'lint') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Frontend tests' 'npm' @('run', 'test') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Frontend build' 'npm' @('run', 'build') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Admin web dependencies' 'pnpm' @('install', '--frozen-lockfile') (Join-Path $repoRoot 'admin-web')
    Invoke-Native 'Admin web build' 'pnpm' @('run', 'build') (Join-Path $repoRoot 'admin-web')
    Invoke-Native 'Backend Maven tests' '.\\mvnw.cmd' @('-q', 'test') (Join-Path $repoRoot 'backend')
    Write-Host "`nQUALITY GATE PASSED" -ForegroundColor Green
}
catch {
    Write-Error $_
    exit 1
}
finally {
    Pop-Location
}
