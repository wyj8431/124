Describe 'check-commit-messages contract' {
    It 'defines the supported Conventional Commit types' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'check-commit-messages.ps1')
        $script | Should Match 'feat\|fix\|docs\|style\|refactor\|perf\|test\|build\|ci\|chore\|revert'
    }

    It 'allows a local working-tree invocation without a commit range' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'check-commit-messages.ps1')
        $script | Should Match "BaseRef -eq 'HEAD'"
    }
}
