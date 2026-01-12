# Get total commit count
$commitCount = git rev-list --count HEAD
$version = "v0.0.$commitCount"

# Read index.html
$indexPath = "index.html"
$html = Get-Content $indexPath -Raw

# Replace version
$html = $html -replace '<div id="version-indicator">v\d+\.\d+\.\d+</div>', "<div id=`"version-indicator`">$version</div>"

# Write back
Set-Content -Path $indexPath -Value $html -NoNewline

Write-Host "✓ Version updated to $version" -ForegroundColor Green
