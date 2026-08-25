Describe 'quality-gate contract' {
    It 'defines the required gate stages in execution order' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $expectedStages = @(
            "Invoke-Native 'Whitespace check' 'git' @('diff', '--check')",
            "Invoke-Native 'Frontend dependencies' 'npm' @('ci', '--ignore-scripts')",
            "Invoke-Native 'Frontend lint' 'npm' @('run', 'lint')",
            "Invoke-Native 'Frontend tests' 'npm' @('run', 'test')",
            "Invoke-Native 'Frontend build' 'npm' @('run', 'build')",
            "Invoke-Native 'Admin web dependencies' 'pnpm' @('install', '--frozen-lockfile')",
            "Invoke-Native 'Admin web build' 'pnpm' @('run', 'build')",
            "Invoke-Native 'Backend Maven tests' '.\\mvnw.cmd' @('-q', 'test')"
        )

        $positions = $expectedStages | ForEach-Object { $script.IndexOf($_) }
        $positions | ForEach-Object { $_ | Should BeGreaterThan -1 }
        for ($index = 1; $index -lt $positions.Count; $index++) {
            $positions[$index] | Should BeGreaterThan $positions[$index - 1]
        }
    }

    It 'names each runtime preflight stage' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $expectedPreflights = @(
            "Invoke-RuntimeCheck 'Node.js runtime' 'node' @('--version')",
            "Invoke-RuntimeCheck 'pnpm runtime' 'pnpm' @('--version')",
            'Invoke-RuntimeCheck ''Java runtime'' ''java'' @(''-version'') ''version "21'''
        )

        $expectedPreflights | ForEach-Object { $script | Should Match ([regex]::Escape($_)) }
    }

    It 'reports the Node.js runtime stage when Node.js is unavailable' {
        $temporaryRepo = Join-Path ([System.IO.Path]::GetTempPath()) ("quality-gate-test-" + [guid]::NewGuid())
        $mockBin = Join-Path $temporaryRepo 'mock-bin'
        $originalPath = $env:PATH
        $pwshPath = (Get-Command pwsh).Source
        try {
            New-Item -ItemType Directory -Path (Join-Path $temporaryRepo 'scripts'), $mockBin -Force | Out-Null
            Copy-Item (Join-Path $PSScriptRoot 'quality-gate.ps1') (Join-Path $temporaryRepo 'scripts/quality-gate.ps1')
            @'
@echo off
exit /b 0
'@ | Set-Content -Path (Join-Path $mockBin 'git.cmd')

            $env:PATH = "$mockBin;$env:SystemRoot\System32"
            $result = & $pwshPath -NoProfile -File (Join-Path $temporaryRepo 'scripts/quality-gate.ps1') 2>&1

            $LASTEXITCODE | Should Be 1
            ($result | Out-String) | Should Match 'Node.js runtime'
        }
        finally {
            $env:PATH = $originalPath
            Remove-Item -LiteralPath $temporaryRepo -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}
