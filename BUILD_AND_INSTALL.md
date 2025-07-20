# Build and Install Instructions

This guide explains how to compile the extension from source and install it in Visual Studio Code.

## Prerequisites

- Node.js (latest LTS recommended)  
- npm (comes with Node.js)  
- Visual Studio Code installed  

## Build from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/Bennowan2/language-server-watchdog.git
   cd language-server-watchdog


Install dependencies:

npm install
npm run compile
npm install -g vsce
vsce package

Open VS Code.

Press Ctrl+Shift+P (or Cmd+Shift+P on macOS) to open the Command Palette.

Type and select: Extensions: Install from VSIX...
select the generated .vsix file.

After installation, reload VS Code if prompted.

Verify
The extension runs silently in the background.
You should see logs or notifications when the Python Language Server (Pylance) is checked and restarted if needed.

If you encounter any issues, check the extension output in VS Code or open an issue on the GitHub repo.