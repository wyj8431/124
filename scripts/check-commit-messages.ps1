[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$BaseRef,
    [string]$HeadRef = 'HEAD'
)

$ErrorActionPreference = 'Stop'
$commitPattern = '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?!?: .{1,100}$'

try {
    if ($BaseRef -eq 'HEAD') {
        Write-Host 'No commit range supplied; commit policy check skipped for the working tree.'
        exit 0
    }

    & git rev-parse --verify "$HeadRef^{commit}" *> $null
    if ($LASTEXITCODE -ne 0) { throw "Head commit '$HeadRef' was not found." }

    if ($BaseRef -match '^0+$') {
        $subjects = @(& git log --format=%s --no-merges $HeadRef)
    }
    else {
        & git rev-parse --verify "$BaseRef^{commit}" *> $null
        if ($LASTEXITCODE -ne 0) { throw "Base commit '$BaseRef' was not found." }
        $subjects = @(& git log --format=%s --no-merges "$BaseRef..$HeadRef")
    }
    if ($LASTEXITCODE -ne 0) { throw "Unable to inspect commit messages in '$BaseRef..$HeadRef'." }
    if ($subjects.Count -eq 0) {
        Write-Host 'No non-merge commits found in the range.'
        exit 0
    }

    $invalid = @($subjects | Where-Object { $_ -notmatch $commitPattern })
    if ($invalid.Count -gt 0) {
        Write-Host 'Invalid commit messages:'
        $invalid | ForEach-Object { Write-Host "- $_" }
        throw 'Commit messages must match Conventional Commits, for example: feat(editor): add snap guides'
    }

    Write-Host "Commit policy passed for $($subjects.Count) commit(s)."
}
catch {
    Write-Error $_
    exit 1
}
