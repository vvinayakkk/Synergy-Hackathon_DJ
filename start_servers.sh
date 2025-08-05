#!/bin/bash

# Script to start Flask servers in all relevant directories
# This script is idempotent and can be run multiple times safely

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a directory contains a Flask app
detect_flask_app() {
    local dir="$1"
    if [[ -f "$dir/app.py" ]]; then
        echo "app.py"
    elif [[ -f "$dir/main.py" ]]; then
        echo "main.py"
    else
        echo ""
    fi
}

# Function to get available port
get_available_port() {
    local port=5000
    while netstat -tuln 2>/dev/null | grep -q ":$port "; do
        port=$((port + 1))
    done
    echo $port
}

# Array to store running services
declare -a running_services

# Main script
print_status "Starting Flask servers in all relevant directories..."

# Iterate over all directories in the current directory
for dir in */; do
    # Skip if not a directory
    if [[ ! -d "$dir" ]]; then
        continue
    fi
    
    # Remove trailing slash
    dir_name="${dir%/}"
    
    # Skip specified directories
    if [[ "$dir_name" == "client" || "$dir_name" == "atharva" ]]; then
        print_status "Skipping directory: $dir_name"
        continue
    fi
    
    print_status "Processing directory: $dir_name"
    
    # Check if directory contains a Flask app
    flask_app=$(detect_flask_app "$dir_name")
    if [[ -z "$flask_app" ]]; then
        print_warning "No Flask app (app.py or main.py) found in $dir_name, skipping..."
        continue
    fi
    
    print_status "Found Flask app: $flask_app in $dir_name"
    
    # Create virtual environment if it doesn't exist
    venv_path="$dir_name/myenv"
    if [[ ! -d "$venv_path" ]]; then
        print_status "Creating virtual environment in $dir_name..."
        python3 -m venv "$venv_path"
        print_success "Virtual environment created: $venv_path"
    else
        print_status "Virtual environment already exists: $venv_path"
    fi
    
    # Activate virtual environment and install requirements
    print_status "Activating virtual environment and installing dependencies..."
    
    # Source the virtual environment
    source "$venv_path/bin/activate"
    
    # Install requirements.txt if it exists
    if [[ -f "$dir_name/requirements.txt" ]]; then
        print_status "Installing requirements from $dir_name/requirements.txt..."
        pip install -r "$dir_name/requirements.txt" > /dev/null 2>&1
        print_success "Requirements installed successfully"
    else
        print_warning "No requirements.txt found in $dir_name"
        # Install Flask as a fallback
        print_status "Installing Flask as fallback..."
        pip install flask > /dev/null 2>&1
    fi
    
    # Get available port
    port=$(get_available_port)
    
    # Set Flask app environment variable
    export FLASK_APP="$dir_name/$flask_app"
    export FLASK_ENV=development
    
    print_status "Starting Flask server for $dir_name on port $port..."
    
    # Start Flask server in background
    cd "$dir_name"
    flask run --host=0.0.0.0 --port=$port > "flask_$dir_name.log" 2>&1 &
    flask_pid=$!
    cd ..
    
    # Store service information
    running_services+=("$dir_name|$port|$flask_pid|$flask_app")
    
    print_success "Flask server started for $dir_name on port $port (PID: $flask_pid)"
    
    # Deactivate virtual environment
    deactivate
done

# Print summary of running services
echo ""
echo "=========================================="
print_success "SUMMARY OF RUNNING SERVICES"
echo "=========================================="

if [[ ${#running_services[@]} -eq 0 ]]; then
    print_warning "No Flask servers were started."
else
    printf "%-20s %-10s %-10s %-15s\n" "Directory" "Port" "PID" "App File"
    echo "------------------------------------------------------------"
    
    for service in "${running_services[@]}"; do
        IFS='|' read -r dir port pid app <<< "$service"
        printf "%-20s %-10s %-10s %-15s\n" "$dir" "$port" "$pid" "$app"
    done
    
    echo ""
    print_status "All servers are running in the background."
    print_status "Logs are saved in each directory as 'flask_<directory>.log'"
    print_status "To stop all servers, run: pkill -f 'flask run'"
fi

echo ""
print_success "Script completed successfully!" 