# Neuroptimize (System & VALORANT Optimizer)

**Neuroptimize** is a desktop system utility and gaming optimization platform built on **Electron + React (Vite)**. It requires administrative privileges (`requireAdministrator`) to perform low-level registry modifications, apply advanced power policies, schedule sub-millisecond hardware timers, and manage gaming configurations.

The entire application runs on a **single, unified control dashboard** with no tab routing, ensuring zero performance overhead and immediate visibility.

---

## 🚀 Dashboard Interface Structure

The interface is divided into two primary visual panels:

### 1. Left Control Panel (System Telemetry & Quick Boosts)
*   **Telemetry Monitor:** Live telemetry reporting CPU Load percentage, RAM consumption (used vs total in GB), and GPU statistics (utilization percentage, device name, and GPU temperature).
    *   *Focus Detection:* Real-time polling automatically pauses when the application window is minimized or blurred (out of focus) to guarantee **0.0% CPU usage** while gaming.
*   **1-Click Booster:** Select and apply optimization profiles instantly:
    *   **Safe Boost:** Flushes DNS cache, purges temp files, turns on Windows Game Mode, sets the High Performance Power Plan, and disables background GameDVR telemetry.
    *   **Max Boost:** Safe Boost optimizations plus power throttling disable, NIC power savings disable, persistent IFEO High CPU priority configuration for VALORANT, and Xbox Live Auth service suspension.
*   **System Cleaners (Quick Diagnostics):**
    *   *Clear RAM:* Runs garbage collection sweeps to purge active memory heaps.
    *   *Restart UI:* Restores frozen taskbars by killing and restarting `explorer.exe`.
*   **OS Temp Directory Scrubber:** Directly scans and purges the Windows User Temporary Directory (`%TEMP%`) to reduce NTFS transaction delays.

### 2. Right Control Panel (VALORANT Optimizer)
*   **Executable Setup:** Automatically locates the game shipping launcher through Riot metadata config JSON files or supports manual browser paths.
*   **Multi-Account Configuration Tuner:** Scans `%LOCALAPPDATA%\VALORANT\Saved\Config` to parse and write graphics preferences inside `GameUserSettings.ini` per account directory:
    *   Custom Resolution Scaling (50% to 100%).
    *   Scalability Groups: Texture, Shadow, Effects, Foliage, Post-Process, and Shading Quality.
    *   Anti-Aliasing quality and VSync (hard-coded off to minimize frame delays).
    *   Raw Input Buffer toggle.
    *   *Tournament Preset:* Quick button to drop all scalability graphics to low, disable VSync, and cap frames optimally.
*   **Anti-Cheat (Vanguard) Compliance Monitor:** Validates compatibility settings required by Vanguard: Secure Boot status, TPM 2.0 presence, CSM disabled status, active VPN notifications, and signed driver checks.
*   **Monitor Sync & Framerate Tuning:**
    *   G-Sync & FreeSync toggling via direct GPU registry overrides.
    *   Framerate limit target (Uncapped vs VRR Cap locking framerates at `Refresh Rate - 3` to maintain G-Sync active window).
    *   Monitor Refresh Rate Selector (60 Hz to 360 Hz).
*   **Advanced Game & Input Latency Controls:**
    *   *Disable Mouse Acceleration:* Overrides precision enhancement mouse scaling.
    *   *Disable USB Selective Suspend:* Stops USB hubs from entering low-power sleep.
    *   *System Clock Lock (0.5ms):* Locks timer resolution using native `WaitForExit` handlers.
    *   *Network Adaptor Boost:* Disables Energy Efficient Ethernet to stop adapter latency spikes.
    *   *Persistent High CPU Priority:* Forces the game executable into High CPU priority automatically on launch.

---

## 🛠️ Technology Stack
*   **Frontend Framework:** React 19 + Tailwind CSS (Vite compiler).
*   **Backend Shell:** Electron 42 (with IPC main process controller).
*   **Execution Policies:** Spawns silent background PowerShell processes with execution policies bypassed (`-ExecutionPolicy Bypass`) and hidden window flags for clean execution.
