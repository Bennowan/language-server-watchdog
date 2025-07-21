# Language Server Watchdog

A lightweight VS Code extension that monitors the Python Language Server (Pylance) and restarts it automatically if it becomes unresponsive.  
Designed to avoid full VS Code reloads, preventing loss of unsaved work.

---

## Features

- Checks every 2 minutes if Pylance is responsive.
- Restarts the Python Language Server silently by toggling a config setting.
- Runs quietly in the background with minimal interference.

---

## Installation

### Install from Release

1. Download the latest `.vsix` package from the [Releases](https://github.com/Bennowan/language-server-watchdog/releases).
2. Install it using the VS Code CLI:

   ```bash
   code --install-extension language-server-watchdog-0.0.1.vsix
