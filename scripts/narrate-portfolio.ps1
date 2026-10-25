$taskNarrationScript = Join-Path $PSScriptRoot 'narrate-portfolio.py'
& python $taskNarrationScript
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
