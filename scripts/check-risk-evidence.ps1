[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$BaseRef,
    [string]$EventPath
)

$ErrorActionPreference = 'Stop'

$highRiskPatterns = @(
    '^backend/.*/security/',
    '^backend/.*/config/',
    '^backend/.*/controller/',
    '(?i)^backend/.*/service/.*(auth|security|permission|role|payment|upload).*\.java$',
    '^backend/src/main/resources/db/',
    '^frontend/src/api/',
    '^frontend/src/context/AuthContext',
    '^frontend/src/.*(route|Route|router|Router|guard|Guard)',
    '^admin-web/src/api/',
    '^admin-web/src/.*(route|Route|router|Router|guard|Guard)',
    '^\.github/',
    '(^|/)(Dockerfile|docker-compose[^/]*|nginx[^/]*|.*\.env[^/]*)$'
)

$requiredEvidence = @(
    @{ Name = 'Threat'; Pattern = '(?i)threat' },
    @{ Name = 'Compatibility or migration'; Pattern = '(?i)compatibility|migration' },
    @{ Name = 'Rollback'; Pattern = '(?i)rollback' },
    @{ Name = 'Regression'; Pattern = '(?i)regression' },
    @{ Name = 'Human review'; Pattern = '(?i)human\s+review' },
    @{ Name = 'Reviewer identity'; Pattern = '(?i)reviewer\s+identity' },
    @{ Name = 'Review timestamp'; Pattern = '(?i)review\s+timestamp' },
    @{ Name = 'Pull-request link or branch-protection approval result'; Pattern = '(?i)pull[- ]?request\s+link|branch[- ]?protection\s+approval\s+result' }
)

function Get-ChangedPaths {
    param([string]$Reference)

    if ($Reference -eq 'HEAD') {
        $paths = @(
            & git diff --name-only HEAD
            & git diff --cached --name-only
            & git ls-files --others --exclude-standard
        )
    }
    else {
        $paths = @(& git diff --name-only "$Reference...HEAD")
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Unable to inspect changed files from '$Reference'."
    }

    return @(
        $paths |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            ForEach-Object { $_ -replace '\\', '/' } |
            Sort-Object -Unique
    )
}

function Test-MeaningfulContent {
    param([string]$Content)

    $withoutEmptyListItems = $Content -replace '(?m)^\s*[-*+]\s*(\[[ xX]\]\s*)?$', ''
    return -not [string]::IsNullOrWhiteSpace($withoutEmptyListItems)
}

function Get-MissingEvidence {
    param([string]$Body)

    $labelPattern = '(?m)^\s*(?:#{1,6}\s+|[-*+]\s+)(?<label>[^:\r\n]+?)(?:\s*:\s*(?<inline>[^\r\n]*))?\s*$'
    $labels = [regex]::Matches($Body, $labelPattern)
    $missing = @()

    foreach ($requirement in $requiredEvidence) {
        $isSatisfied = $false
        for ($index = 0; $index -lt $labels.Count; $index++) {
            $label = $labels[$index]
            if ($label.Groups['label'].Value -notmatch $requirement.Pattern) {
                continue
            }

            $inlineContent = $label.Groups['inline'].Value
            if (Test-MeaningfulContent $inlineContent) {
                $isSatisfied = $true
                break
            }

            $contentStart = $label.Index + $label.Length
            $contentEnd = if ($index + 1 -lt $labels.Count) { $labels[$index + 1].Index } else { $Body.Length }
            $sectionContent = $Body.Substring($contentStart, $contentEnd - $contentStart)
            if (Test-MeaningfulContent $sectionContent) {
                $isSatisfied = $true
                break
            }
        }

        if (-not $isSatisfied) {
            $missing += $requirement.Name
        }
    }

    return $missing
}

try {
    $changedPaths = Get-ChangedPaths $BaseRef
    $highRiskPaths = @(
        $changedPaths | Where-Object {
            $path = $_
            $highRiskPatterns | Where-Object { $path -match $_ } | Select-Object -First 1
        }
    )

    if ($highRiskPaths.Count -eq 0) {
        Write-Host 'No high-risk files changed.'
        exit 0
    }

    Write-Host 'High-risk files changed:'
    $highRiskPaths | ForEach-Object { Write-Host "- $_" }

    if ([string]::IsNullOrWhiteSpace($EventPath)) {
        Write-Host 'Required evidence headings:'
        $requiredEvidence | ForEach-Object { Write-Host "- $($_.Name)" }
        exit 0
    }

    if (-not (Test-Path -LiteralPath $EventPath -PathType Leaf)) {
        throw "GitHub event file was not found: $EventPath"
    }

    $event = Get-Content -Raw -LiteralPath $EventPath | ConvertFrom-Json
    $body = [string]$event.pull_request.body
    $missingEvidence = Get-MissingEvidence $body
    if ($missingEvidence.Count -gt 0) {
        throw "Missing required high-risk evidence headings or content: $($missingEvidence -join ', ')."
    }

    Write-Host 'High-risk pull-request evidence is complete.'
}
catch {
    Write-Output $_.Exception.Message
    exit 1
}
