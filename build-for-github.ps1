# PowerShell script to build for GitHub Pages
Write-Host "Building for GitHub Pages..." -ForegroundColor Green

# Change base href for GitHub Pages
(Get-Content "src/index.html") -replace '<base href="/">', '<base href="/angularapi/">' | Set-Content "src/index.html"

# Build for production
ng build --configuration production

# Change base href back for local development
(Get-Content "src/index.html") -replace '<base href="/angularapi/">', '<base href="/">' | Set-Content "src/index.html"

Write-Host "Build completed! Files are in docs/ folder" -ForegroundColor Green
Write-Host "Don't forget to commit and push the docs/ folder to GitHub" -ForegroundColor Yellow
