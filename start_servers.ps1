# PowerShell script to start Flask servers in all relevant directories
# This script is idempotent and can be run multiple times safely

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if a directory contains a Flask app
function Detect-FlaskApp {
    param([string]$Directory)
    if (Test-Path "$Directory\app.py") {
        return "app.py"
    }
    elseif (Test-Path "$Directory\main.py") {
        return "main.py"
    }
    else {
        return ""
    }
}

# Function to get available port
function Get-AvailablePort {
    $port = 5000
    while ($true) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if (-not $connection) {
            break
        }
        $port++
    }
    return $port
}

# Array to store running services
$runningServices = @()

# Main script
Write-Status "Starting Flask servers in all relevant directories..."

# Get all directories in the current directory
$directories = Get-ChildItem -Directory

foreach ($dir in $directories) {
    $dirName = $dir.Name
    
    # Skip specified directories
    if ($dirName -eq "client" -or $dirName -eq "atharva") {
        Write-Status "Skipping directory: $dirName"
        continue
    }
    
    Write-Status "Processing directory: $dirName"
    
    # Check if directory contains a Flask app
    $flaskApp = Detect-FlaskApp $dirName
    if (-not $flaskApp) {
        Write-Warning "No Flask app (app.py or main.py) found in $dirName, skipping..."
        continue
    }
    
    Write-Status "Found Flask app: $flaskApp in $dirName"
    
    # Create virtual environment if it doesn't exist
    $venvPath = "$dirName\myenv"
    if (-not (Test-Path $venvPath)) {
        Write-Status "Creating virtual environment in $dirName..."
        python -m venv $venvPath
        Write-Success "Virtual environment created: $venvPath"
    }
    else {
        Write-Status "Virtual environment already exists: $venvPath"
    }
    
    # Activate virtual environment and install requirements
    Write-Status "Activating virtual environment and installing dependencies..."
    
    # Activate the virtual environment
    & "$venvPath\Scripts\Activate.ps1"
    
    # Install requirements.txt if it exists
    $requirementsPath = "$dirName\requirements.txt"
    if (Test-Path $requirementsPath) {
        Write-Status "Installing requirements from $dirName\requirements.txt..."
        pip install -r $requirementsPath | Out-Null
        Write-Success "Requirements installed successfully"
    }
    else {
        Write-Warning "No requirements.txt found in $dirName"
        # Install Flask as a fallback
        Write-Status "Installing Flask as fallback..."
        pip install flask | Out-Null
    }
    
    # Get available port
    $port = Get-AvailablePort
    
    # Set Flask app environment variable
    $env:FLASK_APP = "$dirName\$flaskApp"
    $env:FLASK_ENV = "development"
    
    Write-Status "Starting Flask server for $dirName on port $port..."
    
    # Start Flask server in background
    Push-Location $dirName
    $job = Start-Job -ScriptBlock {
        param($port, $flaskApp)
        $env:FLASK_APP = $flaskApp
        $env:FLASK_ENV = "development"
        flask run --host=0.0.0.0 --port=$port
    } -ArgumentList $port, $flaskApp
    
    Pop-Location
    
    # Store service information
    $serviceInfo = [PSCustomObject]@{
        Directory = $dirName
        Port = $port
        JobId = $job.Id
        AppFile = $flaskApp
    }
    $runningServices += $serviceInfo
    
    Write-Success "Flask server started for $dirName on port $port (Job ID: $($job.Id))"
}

# Print summary of running services
Write-Host ""
Write-Host "=========================================="
Write-Success "SUMMARY OF RUNNING SERVICES"
Write-Host "=========================================="

if ($runningServices.Count -eq 0) {
    Write-Warning "No Flask servers were started."
}
else {
    Write-Host ("{0,-20} {1,-10} {2,-10} {3,-15}" -f "Directory", "Port", "Job ID", "App File")
    Write-Host "------------------------------------------------------------"
    
    foreach ($service in $runningServices) {
        Write-Host ("{0,-20} {1,-10} {2,-10} {3,-15}" -f $service.Directory, $service.Port, $service.JobId, $service.AppFile)
    }
    
    Write-Host ""
    Write-Status "All servers are running in the background."
    Write-Status "To stop all servers, run: Get-Job | Stop-Job"
}

Write-Host ""
Write-Success "Script completed successfully!" 