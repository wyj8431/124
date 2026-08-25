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

function Invoke-RuntimeCheck {
    param(
        [string]$Name,
        [string]$File,
        [string[]]$Arguments,
        [string]$ExpectedVersionPattern
    )

    Invoke-GateStage -Name $Name -Command {
        $command = Get-Command -Name $File -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $command) {
            throw "$Name requires '$File' to be available on PATH."
        }

        $versionOutput = & $command.Source @Arguments 2>&1
        $exitCode = $LASTEXITCODE
        $versionOutput | ForEach-Object { Write-Host $_ }
        if ($exitCode -ne 0) {
            throw "$Name version check failed with exit code $exitCode."
        }

        $version = ($versionOutput | Out-String).Trim()
        if ($ExpectedVersionPattern -and $version -notmatch $ExpectedVersionPattern) {
            throw "$Name requires $ExpectedVersionPattern. Detected: $version"
        }
    }
}

Push-Location $repoRoot
try {
    Invoke-Native 'Whitespace check' 'git' @('diff', '--check') $repoRoot

    Invoke-RuntimeCheck 'Node.js runtime' 'node' @('--version')
    Invoke-RuntimeCheck 'pnpm runtime' 'pnpm' @('--version')
    Invoke-RuntimeCheck 'Java runtime' 'java' @('-version') 'version "21'

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
