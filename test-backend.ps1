# test-backend.ps1
# Script to test the backend server connectivity

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "    NeuroTrader Backend Health Check" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$serverUrl = "http://localhost:3002"

# Test main endpoint
Write-Host "Testing main endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $serverUrl -Method GET -TimeoutSec 5
    Write-Host "✓ Main endpoint is accessible!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Failed to connect to main endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$serverUrl/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Health endpoint is accessible!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Failed to connect to health endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Test history endpoint
Write-Host "`nTesting chat history endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$serverUrl/api/agent/history" -Method GET -TimeoutSec 5
    Write-Host "✓ History endpoint is accessible!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed to connect to history endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Agentkit execution
Write-Host "`nTesting AgentKit execution..." -ForegroundColor Yellow
try {
    $body = @{
        message = "Hello, test message"
        role = "user"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$serverUrl/api/agent/chat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✓ AgentKit execution successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed to execute AgentKit: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nHealth check complete!" -ForegroundColor Cyan
