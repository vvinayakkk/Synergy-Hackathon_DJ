# Flask Server Startup Scripts

This repository contains scripts to automatically start Flask servers in all relevant directories.

## Available Scripts

### 1. `start_servers.sh` (Bash/Linux/macOS)
- For Unix-like systems (Linux, macOS, WSL)
- Uses bash scripting
- Handles virtual environments with `source myenv/bin/activate`

### 2. `start_servers.ps1` (PowerShell/Windows)
- For Windows systems
- Uses PowerShell scripting
- Handles virtual environments with `myenv\Scripts\Activate.ps1`

## Features

Both scripts provide the following functionality:

1. **Directory Iteration**: Automatically processes all folders in the root directory
2. **Smart Filtering**: Skips folders named "client" and "atharva"
3. **Flask App Detection**: Automatically detects Flask apps (`app.py` or `main.py`)
4. **Virtual Environment Management**: 
   - Creates `myenv` virtual environment if it doesn't exist
   - Activates the environment for each directory
5. **Dependency Installation**: 
   - Installs packages from `requirements.txt` if available
   - Falls back to installing Flask if no requirements file exists
6. **Port Management**: Automatically assigns available ports starting from 5000
7. **Background Execution**: Starts all Flask servers in the background
8. **Comprehensive Logging**: Provides colored output and progress indicators
9. **Service Summary**: Displays a summary of all running services

## Usage

### On Windows:
```powershell
# Run the PowerShell script
.\start_servers.ps1
```

### On Linux/macOS/WSL:
```bash
# Make the script executable (first time only)
chmod +x start_servers.sh

# Run the bash script
./start_servers.sh
```

## What the Scripts Do

1. **Scan Directories**: Look for all directories in the current folder
2. **Skip Specified Folders**: Ignore "client" and "atharva" directories
3. **Detect Flask Apps**: Check for `app.py` or `main.py` files
4. **Setup Virtual Environment**: Create `myenv` if it doesn't exist
5. **Install Dependencies**: Install from `requirements.txt` or Flask as fallback
6. **Start Servers**: Launch Flask servers on available ports
7. **Provide Summary**: Show all running services with ports and PIDs

## Expected Directory Structure

The scripts expect the following structure:
```
root/
├── client/                 # (skipped)
├── atharva/               # (skipped)
├── vinayak_server/
│   ├── app.py
│   ├── requirements.txt
│   └── myenv/            # (created if needed)
├── anushka_server/
│   ├── app.py
│   └── myenv/            # (created if needed)
├── harshit/
│   ├── app.py
│   └── myenv/            # (created if needed)
└── pdfff/
    ├── app.py
    └── myenv/            # (created if needed)
```

## Stopping Servers

### Windows (PowerShell):
```powershell
# Stop all background jobs
Get-Job | Stop-Job

# Or kill Flask processes
Get-Process | Where-Object {$_.ProcessName -eq "python"} | Stop-Process
```

### Linux/macOS (Bash):
```bash
# Kill all Flask processes
pkill -f "flask run"

# Or kill by PID (shown in summary)
kill <PID>
```

## Logs

- Each Flask server logs to `flask_<directory>.log` in its respective directory
- Console output shows real-time progress and status
- Summary table shows all running services with ports and process IDs

## Idempotent Operation

Both scripts are designed to be idempotent:
- Can be run multiple times safely
- Won't recreate existing virtual environments
- Will restart servers if they're not running
- Provides clear status messages for each operation

## Troubleshooting

1. **Permission Issues**: Make sure you have execute permissions on the bash script
2. **Python Not Found**: Ensure Python is installed and in your PATH
3. **Port Conflicts**: Scripts automatically find available ports
4. **Virtual Environment Issues**: Delete the `myenv` folder to recreate it
5. **PowerShell Execution Policy**: If needed, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 