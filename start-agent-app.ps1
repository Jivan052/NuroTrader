# start-agent-app.ps1
# Script to start the NeuroTrader application
# This script starts both the frontend and the agent server for the analytics dashboard widget

# Display banner
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "    NeuroTrader Analytics Platform" -ForegroundColor Cyan
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

if (Test-PortInUse -Port 5173) {
    Write-Host "Stopping existing processes on port 5173..." -ForegroundColor Yellow
    try {
        Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "No process found using port 5173" -ForegroundColor Yellow
    }
}

# Start agent server
Write-Host "`nStarting agent server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    node agent-server.cjs
}

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Check if backend started successfully
$backendRunning = Test-PortInUse -Port 3002
if ($backendRunning) {
    Write-Host "Agent server started successfully on http://localhost:3002" -ForegroundColor Green
} else {
    Write-Host "Failed to start agent server on port 3002" -ForegroundColor Red
    Write-Host "Check backend job for errors:" -ForegroundColor Red
    Receive-Job $backendJob
    Exit 1
}

# Start frontend server
Write-Host "`nStarting frontend server..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    bun run dev
}

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

# Check frontend status
Write-Host "Frontend server starting..." -ForegroundColor Green
Write-Host "You can access the app at http://localhost:5173" -ForegroundColor Green

# Display success message and instructions
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "    Servers started successfully!" -ForegroundColor Cyan
Write-Host "=======================================`n" -ForegroundColor Cyan

Write-Host "Agent API: http://localhost:3002" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "`nNavigate to http://localhost:5173/analytics to see the Analytics Dashboard" -ForegroundColor Yellow
Write-Host "The AI Agent chat widget will appear in the bottom-right corner" -ForegroundColor Yellow

Write-Host "`nPress Ctrl+C to stop all servers`n" -ForegroundColor Red

# Keep the script running and display logs
try {
    while ($true) {
        # Display backend logs
        $backendOutput = Receive-Job $backendJob
        if ($backendOutput) {
            Write-Host "[Agent Server] $backendOutput" -ForegroundColor Cyan
        }
        
        # Display frontend logs
        $frontendOutput = Receive-Job $frontendJob
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Yellow
        }
        
        # Check if jobs are still running
        if ($backendJob.State -ne "Running") {
            Write-Host "Agent server stopped unexpectedly!" -ForegroundColor Red
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
