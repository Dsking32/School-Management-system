# extract-project.ps1
Write-Host "🔍 EXTRACTING PROJECT STRUCTURE AND CODE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$projectRoot = Get-Location
Write-Host "📂 Project Root: $projectRoot" -ForegroundColor Cyan
Write-Host ""

function Write-Section($title) {
    Write-Host ""
    Write-Host "📄 $title" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
}

function Get-FileContent($filePath) {
    if (Test-Path $filePath) {
        return Get-Content $filePath -Raw
    }
    return $null
}

# 1. Show package.json
Write-Section "PACKAGE.JSON"
$packageJson = Get-FileContent "package.json"
if ($packageJson) {
    Write-Host $packageJson
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

# 2. Show .env file
Write-Section "ENVIRONMENT VARIABLES (.env)"
$envFile = Get-FileContent ".env"
if ($envFile) {
    Write-Host $envFile
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

# 3. Show Prisma schema
Write-Section "PRISMA SCHEMA"
$prismaSchema = Get-FileContent "prisma/schema.prisma"
if ($prismaSchema) {
    Write-Host $prismaSchema
} else {
    Write-Host "❌ prisma/schema.prisma not found" -ForegroundColor Red
}

# 4. Show folder structure
Write-Section "FOLDER STRUCTURE"
Write-Host "📁 Project Directory Tree:" -ForegroundColor Cyan
Write-Host ""

function Show-Tree {
    param(
        [string]$Path = ".",
        [string]$Prefix = "",
        [int]$MaxDepth = 2
    )
    
    if (Test-Path $Path) {
        $items = Get-ChildItem -Path $Path -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch 'node_modules|\.git|\.next' }
        
        foreach ($item in $items) {
            Write-Host "$Prefix├── 📁 $($item.Name)" -ForegroundColor Cyan
            
            $files = Get-ChildItem -Path $item.FullName -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '\.(tsx?|jsx?|prisma|env)$' } | Select-Object -First 3
            foreach ($file in $files) {
                Write-Host "$Prefix│   ├── 📄 $($file.Name)" -ForegroundColor Gray
            }
            
            if ($MaxDepth -gt 0) {
                Show-Tree -Path $item.FullName -Prefix "$Prefix│   " -MaxDepth ($MaxDepth - 1)
            }
        }
    }
}

# Show main directories
Write-Host "📂 ./" -ForegroundColor Cyan
$rootDirs = Get-ChildItem -Path "." -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch 'node_modules|\.git|\.next' }
foreach ($dir in $rootDirs) {
    Write-Host "├── 📁 $($dir.Name)" -ForegroundColor Cyan
}

if (Test-Path "src") {
    Write-Host "│   └── 📁 src/" -ForegroundColor Cyan
    Show-Tree -Path "src" -Prefix "│       " -MaxDepth 1
}

if (Test-Path "prisma") {
    Write-Host "├── 📁 prisma/" -ForegroundColor Cyan
    $prismaFiles = Get-ChildItem -Path "prisma" -File -ErrorAction SilentlyContinue
    foreach ($file in $prismaFiles) {
        Write-Host "│   ├── 📄 $($file.Name)" -ForegroundColor Gray
    }
}

# Summary
Write-Section "SUMMARY"
Write-Host "✅ Extraction Complete!" -ForegroundColor Green
Write-Host ""
