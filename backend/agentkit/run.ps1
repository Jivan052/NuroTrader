# Run AgentKit directly with Bun
param (
    [Parameter(Mandatory=$true)]
    [string]$Prompt
)

# Get the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

# Run AgentKit with the prompt
bun run index.ts $Prompt
