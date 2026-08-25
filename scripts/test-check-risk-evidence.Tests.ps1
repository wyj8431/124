Describe 'check-risk-evidence' {
    It 'rejects an incomplete pull request body for a high-risk payment service change' {
        $temporaryRepo = Join-Path ([System.IO.Path]::GetTempPath()) ("risk-evidence-test-" + [guid]::NewGuid())
        New-Item -ItemType Directory -Path (Join-Path $temporaryRepo 'scripts') -Force | Out-Null
        try {
            Copy-Item (Join-Path $PSScriptRoot 'check-risk-evidence.ps1') (Join-Path $temporaryRepo 'scripts/check-risk-evidence.ps1')
            Push-Location $temporaryRepo
            git init -q
            git config user.email 'test@example.invalid'
            git config user.name 'Quality Gate Test'
            New-Item -ItemType File -Path '.gitkeep' | Out-Null
            git add .gitkeep
            git commit -qm 'baseline'
            New-Item -ItemType Directory -Path 'backend/src/main/java/com/example/service' -Force | Out-Null
            Set-Content -Path 'backend/src/main/java/com/example/service/PaymentService.java' -Value 'class PaymentService {}'
            Set-Content -Path 'event.json' -Value '{"pull_request":{"body":"## Summary\nHigh-risk change"}}'

            $result = & ./scripts/check-risk-evidence.ps1 -BaseRef HEAD -EventPath (Join-Path $temporaryRepo 'event.json') 2>&1

            $LASTEXITCODE | Should Be 1
            ($result | Out-String) | Should Match 'Threat'
        }
        finally {
            Pop-Location -ErrorAction SilentlyContinue
            Remove-Item -LiteralPath $temporaryRepo -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    It 'accepts a complete pull request body with a human reviewer approval' {
        $temporaryRepo = Join-Path ([System.IO.Path]::GetTempPath()) ("risk-evidence-test-" + [guid]::NewGuid())
        New-Item -ItemType Directory -Path (Join-Path $temporaryRepo 'scripts') -Force | Out-Null
        try {
            Copy-Item (Join-Path $PSScriptRoot 'check-risk-evidence.ps1') (Join-Path $temporaryRepo 'scripts/check-risk-evidence.ps1')
            Push-Location $temporaryRepo
            git init -q
            git config user.email 'test@example.invalid'
            git config user.name 'Quality Gate Test'
            New-Item -ItemType File -Path '.gitkeep' | Out-Null
            git add .gitkeep
            git commit -qm 'baseline'
            New-Item -ItemType Directory -Path 'backend/src/main/java/com/example/service' -Force | Out-Null
            Set-Content -Path 'backend/src/main/java/com/example/service/PaymentService.java' -Value 'class PaymentService {}'
            @'
{"pull_request":{"body":"## Threat\nAuthorization impact assessed.\n## Compatibility or migration\nNo data migration.\n## Rollback\nRevert this commit.\n## Regression\nPayment service regression test passes.\n## Human reviewer and approval\nPat Example approved.\n## Reviewer identity\npat-example\n## Review timestamp\n2026-08-25T09:00:00Z\n## Pull-request link or branch-protection approval result\nhttps://github.com/example/repo/pull/1"}}
'@ | Set-Content -Path 'event.json'

            $result = & ./scripts/check-risk-evidence.ps1 -BaseRef HEAD -EventPath (Join-Path $temporaryRepo 'event.json') 2>&1

            $LASTEXITCODE | Should Be 0
            ($result | Out-String) | Should Match 'complete'
        }
        finally {
            Pop-Location -ErrorAction SilentlyContinue
            Remove-Item -LiteralPath $temporaryRepo -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    It 'rejects evidence headings whose only content is an HTML comment' {
        $temporaryRepo = Join-Path ([System.IO.Path]::GetTempPath()) ("risk-evidence-test-" + [guid]::NewGuid())
        New-Item -ItemType Directory -Path (Join-Path $temporaryRepo 'scripts') -Force | Out-Null
        try {
            Copy-Item (Join-Path $PSScriptRoot 'check-risk-evidence.ps1') (Join-Path $temporaryRepo 'scripts/check-risk-evidence.ps1')
            Push-Location $temporaryRepo
            git init -q
            git config user.email 'test@example.invalid'
            git config user.name 'Quality Gate Test'
            New-Item -ItemType File -Path '.gitkeep' | Out-Null
            git add .gitkeep
            git commit -qm 'baseline'
            New-Item -ItemType Directory -Path 'backend/src/main/java/com/example/service' -Force | Out-Null
            Set-Content -Path 'backend/src/main/java/com/example/service/PaymentService.java' -Value 'class PaymentService {}'
            @'
{"pull_request":{"body":"## Threat\n<!-- no evidence -->\n## Compatibility or migration\nNo data migration.\n## Rollback\nRevert this commit.\n## Regression\nPayment service regression test passes.\n## Human reviewer and approval\nPat Example approved.\n## Reviewer identity\npat-example\n## Review timestamp\n2026-08-25T09:00:00Z\n## Pull-request link or branch-protection approval result\nhttps://github.com/example/repo/pull/1"}}
'@ | Set-Content -Path 'event.json'

            $result = & ./scripts/check-risk-evidence.ps1 -BaseRef HEAD -EventPath (Join-Path $temporaryRepo 'event.json') 2>&1

            $LASTEXITCODE | Should Be 1
            ($result | Out-String) | Should Match 'Threat'
        }
        finally {
            Pop-Location -ErrorAction SilentlyContinue
            Remove-Item -LiteralPath $temporaryRepo -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    It 'fails when the first local Git inspection command fails' {
        $temporaryRepo = Join-Path ([System.IO.Path]::GetTempPath()) ("risk-evidence-test-" + [guid]::NewGuid())
        $mockBin = Join-Path $temporaryRepo 'mock-bin'
        $originalPath = $env:PATH
        $pwshPath = (Get-Command pwsh).Source
        try {
            New-Item -ItemType Directory -Path (Join-Path $temporaryRepo 'scripts'), $mockBin -Force | Out-Null
            Copy-Item (Join-Path $PSScriptRoot 'check-risk-evidence.ps1') (Join-Path $temporaryRepo 'scripts/check-risk-evidence.ps1')
            @'
@echo off
exit /b 1
'@ | Set-Content -Path (Join-Path $mockBin 'git.cmd')

            $env:PATH = "$mockBin;$env:SystemRoot\System32"
            $result = & $pwshPath -NoProfile -File (Join-Path $temporaryRepo 'scripts/check-risk-evidence.ps1') -BaseRef HEAD 2>&1

            $LASTEXITCODE | Should Be 1
            ($result | Out-String) | Should Match 'working-tree changes'
        }
        finally {
            $env:PATH = $originalPath
            Remove-Item -LiteralPath $temporaryRepo -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}
