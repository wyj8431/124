Describe 'check-risk-evidence contract' {
    It 'recognizes CI, API, auth, database, and deployment paths as high risk' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'check-risk-evidence.ps1')
        $script | Should Match '\.github/'
        $script | Should Match 'frontend/src/api/'
        $script | Should Match 'backend/src/main/resources/db/'
        $script | Should Match 'Dockerfile'
    }

    It 'requires reviewer identity and approval metadata' {
        $script = Get-Content -Raw (Join-Path $PSScriptRoot 'check-risk-evidence.ps1')
        $script | Should Match 'Reviewer identity'
        $script | Should Match 'Review timestamp'
        $script | Should Match 'Pull-request link or branch-protection approval result'
    }
}
