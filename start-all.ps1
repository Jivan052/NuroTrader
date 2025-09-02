# Start-All.ps1
# Script to start both frontend and backend servers

# Display banner
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "    NeuroTrader Development Servers" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Function to check if port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connections.Count -gt 0
    } catch {
        return $false
    }
}

# Kill existing processes if needed
Write-Host "Checking for running processes..." -ForegroundColor Yellow

if (Test-PortInUse -Port 3002) {
    Write-Host "Stopping existing processes on port 3002..." -ForegroundColor Yellow
    try {
        Stop-Process -Id (Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "No process found using port 3002" -ForegroundColor Yellow
    }
}

if (Test-PortInUse -Port 8080) {
    Write-Host "Stopping existing processes on port 8080..." -ForegroundColor Yellow
    try {
        Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "No process found using port 8080" -ForegroundColor Yellow
    }
}

# Start backend server
Write-Host "`nStarting backend server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    node simple-server.js
}

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Check if backend started successfully
$backendRunning = Test-PortInUse -Port 3002
if ($backendRunning) {
    Write-Host "Backend server started successfully on http://localhost:3002" -ForegroundColor Green
} else {
    Write-Host "Failed to start backend server on port 3002" -ForegroundColor Red
    Write-Host "Check backend job for errors:" -ForegroundColor Red
    Receive-Job $backendJob
    Exit 1
}

# Start frontend server
Write-Host "`nStarting frontend server..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

# Check if frontend started successfully
$frontendRunning = Test-PortInUse -Port 8080
if ($frontendRunning) {
    Write-Host "Frontend server started successfully on http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "Failed to start frontend server on port 8080" -ForegroundColor Red
    Write-Host "Check frontend job for errors:" -ForegroundColor Red
    Receive-Job $frontendJob
    Exit 1
}

# Display success message and instructions
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "    All servers started successfully!" -ForegroundColor Cyan
Write-Host "=======================================`n" -ForegroundColor Cyan

Write-Host "Backend: http://localhost:3002" -ForegroundColor Green
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host "`nNavigate to http://localhost:8080/simple-agent to use the SimpleAgentChat" -ForegroundColor Yellow

Write-Host "`nPress Ctrl+C to stop all servers`n" -ForegroundColor Red

# Keep the script running and display logs
try {
    while ($true) {
        # Display backend logs
        $backendOutput = Receive-Job $backendJob
        if ($backendOutput) {
            Write-Host "[Backend] $backendOutput" -ForegroundColor Cyan
        }
        
        # Display frontend logs
        $frontendOutput = Receive-Job $frontendJob
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Yellow
        }
        
        # Check if jobs are still running
        if ($backendJob.State -ne "Running") {
            Write-Host "Backend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        if ($frontendJob.State -ne "Running") {
            Write-Host "Frontend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 1
    }
}
finally {
    # Clean up jobs when script is interrupted
    Write-Host "`nStopping all servers..." -ForegroundColor Yellow
    
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    Write-Host "All servers stopped." -ForegroundColor Yellow
}
