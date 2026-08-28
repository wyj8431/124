Describe 'quality-gate contract' {
    It 'keeps required stages in order' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $stages = @(
            "Invoke-Native 'Whitespace check'",
            "Invoke-Native 'Codex code review'",
            "Invoke-Native 'Governance tests'",
            "Invoke-Native 'Frontend dependencies'",
            "Invoke-Native 'Frontend lint'",
            "Invoke-Native 'Frontend tests'",
            "Invoke-Native 'Frontend build'",
            "Invoke-Native 'Admin web dependencies'",
            "Invoke-Native 'Admin web build'",
            "Invoke-Native 'Backend Maven tests'"
        )
        $positions = $stages | ForEach-Object { $script.IndexOf($_) }
        $positions | ForEach-Object { $_ | Should BeGreaterThan -1 }
        for ($index = 1; $index -lt $positions.Count; $index++) {
            $positions[$index] | Should BeGreaterThan $positions[$index - 1]
        }
    }

    It 'requires Node, pnpm, and Java 21 preflight checks' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $script | Should Match "Invoke-RuntimeCheck 'Node.js runtime'"
        $script | Should Match "Invoke-RuntimeCheck 'pnpm runtime'"
        $script | Should Match "Invoke-RuntimeCheck 'Java runtime'"
    }

    It 'runs the Codex review against the changed-file scope with JSON output' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $script | Should Match "scripts/codex-code-review\.mjs', '--scope', 'changed-files', '--format', 'json', '--severity', 'medium"
    }

    It 'accepts an optional review base for clean CI checkouts' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $script.IndexOf('[string]$ReviewBaseRef') | Should BeGreaterThan -1
        $script.IndexOf("reviewArguments += @('--base', `$ReviewBaseRef)") | Should BeGreaterThan -1
    }

    It 'pins the supported local runtime versions' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'quality-gate.ps1')
        $script.IndexOf("Invoke-RuntimeCheck 'Node.js runtime' 'node' @('--version') '^v22\.'") | Should BeGreaterThan -1
        $script.IndexOf("Invoke-RuntimeCheck 'pnpm runtime' 'pnpm' @('--version') '^11\.3\.'") | Should BeGreaterThan -1
    }
}
