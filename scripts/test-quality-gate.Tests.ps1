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
}
