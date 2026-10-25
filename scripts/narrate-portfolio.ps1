Add-Type -AssemblyName System.Speech
$taskProjectRoot = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force -Path (Join-Path $taskProjectRoot 'artifacts') | Out-Null
$taskNarrator = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $taskNarrator.SelectVoice('Microsoft Pavel')
    $taskNarrator.Rate = 0
    $taskNarrator.SetOutputToWaveFile((Join-Path $taskProjectRoot 'artifacts/business-narration.wav'))
    $taskNarrator.Speak('Ваш заказ уже в пути. Доставим бережно, чтобы вы занимались любимым делом.')
} finally {
    $taskNarrator.Dispose()
}
