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
}
