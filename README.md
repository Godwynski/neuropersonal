# Neuroptimize (System & VALORANT Optimizer)

**Neuroptimize** is a high-performance desktop system utility and gaming optimization platform built on **Electron + React (Vite)**. It requires administrative privileges (`requireAdministrator`) to perform low-level registry modifications, apply advanced power policies, schedule sub-millisecond hardware timers, and manage gaming configurations.

The entire application runs on a **single, unified control dashboard** with no tab routing, ensuring zero performance overhead and immediate visibility.

---

## 🚀 Dashboard Interface Layout

The interface is divided into two main columns with an integrated system console:

### 1. Left Control Column (Sidebar)
*   **Telemetry Monitor:** Live telemetry reporting CPU Load percentage, RAM consumption (used vs total in GB and percentage), and GPU statistics (utilization percentage, device name, and GPU temperature).
    *   *Focus Detection:* Real-time polling automatically pauses when the application window is minimized or blurred (out of focus) to guarantee **0.0% CPU usage** while gaming.
*   **1-Click Booster:** Select and apply optimization profiles instantly with visual progress tracking:
    *   **Safe Boost:** Turns on Windows Game Mode, sets the High Performance Power Plan, disables background GameDVR telemetry, overrides mouse acceleration/USB selective suspend, and clears GPU shader caches.
    *   **Max Boost:** Safe Boost optimizations plus power throttling disable, NIC power savings disable, persistent IFEO High CPU priority configuration for VALORANT, Xbox Live service suspension, system clock lock to 0.5ms, VBS/Core Isolation disable, and active GPU driver performance profile injection.
*   **System Cleaners (Quick Diagnostics):**
    *   *Clear RAM:* Runs garbage collection sweeps to purge active memory heaps.
    *   *Restart UI:* Restores frozen taskbars by killing and restarting `explorer.exe`.
*   **OS Temp Directory Scrubber:** Directly scans and purges the Windows User Temporary Directory (`%TEMP%`) to reduce NTFS transaction delays.
*   **Registry Rollback Manager:** Automatically backs up modified registry keys prior to tweaking. Provides tools to Refresh the list, Restore All (revert modified keys to Windows defaults), Forget (delete backup tracking without reverting), or restore individual entries back to Windows registry.

### 2. Right Control Column (Main Panel)

#### A. Valorant Engine Booster & Tweaks Grid
Features a search bar and category filters (**All, Safe, Aggressive, GPU & Sync, Caches & Launch**) for toggling tweaks:
*   **OS & Registry:** GameDVR Telemetry, Mouse Acceleration override, USB Selective Suspend disable, Persistent High CPU priority, System Clock Lock (0.5ms), NIC Power Savings disable, Xbox Live services suspension, Power Throttling policy disable, HPET platform clock disable (requires reboot), and VBS/Core Isolation disable (requires reboot).
*   **GPU & Monitor Sync:** NVIDIA G-Sync Buffer Bypass, AMD FreeSync tweak, AMD Multi-Plane Overlay (MPO) disable (remedies screen flickering/stutters), AMD Shader Cache forced always-on, AMD Legacy DX11 Driver Pipeline selection (bypasses modern DXNavi stutters), Force ReBAR on Legacy AMD GPUs (registry hack for RX 580/570), and active GPU Driver Tuning Profile injection (NVIDIA PowerMizer / AMD Anti-Lag, Radeon Chill, Radeon Boost performance presets).
*   **Caches & Cleaners:** Scans and purges VALORANT Telemetry & Client Log directories and DirectX Shader Caches.
*   **Launch Policies:** Suspend Windows Updates (on-launch services suspension), Background Process Purging (automatically terminates selected browsers/launchers like Chrome, Edge, Spotify, Discord, Steam, OneDrive on game start, customizable via checklist), Windows Game Mode policy, High Performance Power Plan activation, and One-Time Scheduler Elevation.

#### B. Subsystem Diagnostics
*   **Anticheat Diagnostics:** Validates Secure Boot status (Enabled/Disabled) and TPM 2.0 presence (Active/Inactive) required by Riot Vanguard.
*   **Hardware Status:** Reports RAM XMP status and PCIe ReBAR status.

#### C. Game Graphics Config
*   **Multi-Account Configuration Tuner:** Scans `%LOCALAPPDATA%\VALORANT\Saved\Config` to parse and write graphics preferences inside `GameUserSettings.ini` per account directory.
*   **Resolution Quality Scale:** Custom slider allowing quality scaling adjustments from 50% (Max FPS) to 100% (Native).
*   **Scalability Groups:** Texture Quality, Shadow Quality, and Raw Input Buffer dropdowns.
*   **Monitor Sync & Framerate Tuning:** Monitor Refresh Rate selector (60 Hz to 360 Hz or Custom Hz) and Framerate Limit Mode (Uncapped vs VRR Cap locking framerates at `Refresh Rate - 3` to maintain G-Sync active window).

#### D. Console Log Stream (Bottom Console)
Streams real-time optimization status updates, success logs, and troubleshooting exceptions with quick clear support.

---

## 🛠️ Technology Stack
*   **Frontend Framework:** React 19 + Tailwind CSS v4 (Vite compiler).
*   **Backend Shell:** Electron 42 (with secure preload IPC bridge context isolation).
*   **Execution Policies:** Spawns silent background PowerShell processes with execution policies bypassed (`-ExecutionPolicy Bypass`) and hidden window flags for clean execution.
*   **Security Controls:** Strict input sanitization of registry keys, allowed game names validation, and path traversal guards.

