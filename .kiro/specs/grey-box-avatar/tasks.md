# Implementation Plan: Patchimon v1

## Overview

This implementation plan breaks down the Patchimon v1 feature into discrete coding tasks. The extension stitches together three incompatible technologies (Frankenstein seams):

1. **VS Code Extension Host APIs (Node.js)** - Extension activation, command registration, editor event monitoring
2. **Message Bridge (IPC)** - postMessage protocol for communication between isolated contexts
3. **Webview 3D Scene (Three.js/Browser)** - WebGL rendering and procedural animation

Each task builds incrementally on previous work, with checkpoints to validate core functionality early. Tasks reference specific requirements from requirements.md for traceability.

## Tasks

### Phase 1: Scaffold (COMPLETED)

- [x] 1.1 Initialize TypeScript project with VS Code extension boilerplate
  - Create package.json with extension manifest
  - Set up tsconfig.json for TypeScript compilation
  - Create extension entry point structure
  - _Requirements: 1.1_

- [x] 1.2 Create MIT license file at repo root
  - Add MIT license as required by Kiroween compliance
  - _Requirements: 15.3_

- [x] 1.3 Set up build tooling
  - Configure TypeScript compilation
  - Set up VSIX packaging with .vscodeignore
  - _Requirements: 1.1, 13.2_

- [x] 1.4 Create basic extension activation and command registration
  - Implement activate() function
  - Register 'patchimon.showAvatar' command
  - _Requirements: 1.1, 1.2_

### Phase 2: Webview Infrastructure (4/5 COMPLETED)

- [x] 2.1 Implement webview provider with panel lifecycle management
  - Create PatchyViewProvider class implementing WebviewViewProvider
  - Handle webview resolution and context retention
  - _Requirements: 2.1, 2.2_

- [x] 2.2 Create webview HTML template with proper CSP
  - Generate HTML with Content Security Policy
  - Allow blob: and data: for img-src and connect-src (critical for Three.js texture loading)
  - Prevent grey model rendering by configuring CSP correctly from day 1
  - _Requirements: 2.4, 10.1, 10.4_

- [x] 2.3 Integrate Three.js via CDN in webview HTML
  - Load Three.js from jsdelivr CDN
  - Enable browser caching for offline capability
  - _Requirements: 20.1, 20.2, 20.3_

- [x] 2.4 Set up basic Three.js scene
  - Initialize scene, camera, and WebGL renderer
  - Add ambient and directional lighting
  - Handle canvas resizing
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 2.5 Verify webview renders (screenshot checkpoint)
  - Confirm scene renders correctly in the panel
  - Verify CSP is working (not rendering grey)
  - Take screenshot for documentation
  - _Requirements: 2.3, 2.4_

### Phase 3: Grey-Box Avatar (3/4 COMPLETED)

- [x] 3.1 Create segmented avatar geometry using Three.js primitives
  - Build head (sphere) with patch-colored sections
  - Create 2 arms (cylinders) in different colors (lavender, mustard)
  - Create 2 feet (flat boxes) in different colors (mint, dusty pink)
  - Create belly patch (plane) on front
  - Create bolt (small cylinder) in metallic grey
  - _Requirements: 3.1, 3.2_

- [x] 3.2 Group parts under pivot points for animation
  - Create THREE.Group structures for arms with pivot points at shoulders
  - Implement "the seams are the joints" design principle
  - _Requirements: 3.4, 11.4_

- [x] 3.3 Apply patch colors to different segments
  - Set materials with mint, lavender, mustard, dusty pink colors
  - Apply metallic grey to bolt
  - _Requirements: 3.2_

- [ ] 3.4 Verify avatar is visible and colored (not grey) in panel
  - Screenshot verification that CSP is working correctly
  - Confirm all patch colors are visible
  - _Requirements: 3.3, 16.1_

### Phase 4: Animation System (COMPLETED)

- [x] 4.1 Implement idle animation
  - Apply sinusoidal Y-axis breathing sway to avatar body
  - Add occasional twitch motion to bolt
  - Use requestAnimationFrame for smooth rendering
  - _Requirements: 4.2, 4.3, 11.1, 11.2_

- [x] 4.2 Implement celebrate animation
  - Rotate arms upward (π/2 radians)
  - Translate body upward in hop motion (parabolic)
  - Duration: 1 second
  - _Requirements: 4.4, 11.3_

- [x] 4.3 Implement flinch animation
  - Scale body downward (squash effect)
  - Move arms to cover face position
  - Duration: 0.5 seconds
  - _Requirements: 4.5, 11.3_

- [x] 4.4 Create animation state machine in webview
  - State transitions: idle ↔ celebrate, idle ↔ flinch
  - Track animation start time and duration
  - Auto-return to idle after celebrate/flinch complete
  - _Requirements: 4.1, 4.6_

- [x] 4.5 Handle animation messages from extension host
  - Add window message listener
  - Parse {command: 'animate', state: 'idle'|'celebrate'|'flinch'} messages
  - Trigger state transitions based on incoming commands
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

### Phase 5: Editor Integration (COMPLETED)

- [x] 5.1 Implement diagnostics monitor listening to VS Code diagnostics API
  - Subscribe to vscode.languages.onDidChangeDiagnostics event
  - Filter for error-severity diagnostics only
  - Implement Disposable interface for cleanup
  - _Requirements: 5.1, 5.4_

- [x] 5.2 Track error state transitions
  - Maintain hasErrors boolean tracking previous state
  - Detect none→errors transition (new errors)
  - Detect errors→none transition (all errors cleared)
  - _Requirements: 5.2, 5.3_

- [x] 5.3 Send flinch message when errors appear
  - Call provider.animate('flinch') on none→errors transition
  - _Requirements: 6.1, 6.2_

- [x] 5.4 Send celebrate message when errors clear after existing
  - Call provider.animate('celebrate') on errors→none transition
  - _Requirements: 7.1, 7.2_

- [x] 5.5 Send idle acknowledgment on file save events
  - Subscribe to vscode.workspace.onDidSaveTextDocument
  - Call provider.acknowledgeSave() without changing animation state
  - Display subtle acknowledgment motion in idle state
  - _Requirements: 8.1, 8.2, 8.3_

### Phase 6: Packaging & Verification (3/4 COMPLETED)

- [x] 6.1 Configure VSIX packaging
  - Set up .vscodeignore to exclude dev files
  - Create npm package script
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 6.2 Create README with installation instructions
  - Document 3-step installation: install VSIX → open panel → code something broken
  - Use only repo-relative paths in all file references
  - Explicitly name the three stitched Frankenstein technologies
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 6.3 Build VSIX package
  - Run npm run package to create patchimon-x.x.x.vsix
  - _Requirements: 13.4_

- [ ] 6.4 Run acceptance checks
  - Fresh Kiro install + VSIX installation
  - Verify avatar panel opens
  - Verify avatar colored (not grey)
  - Introduce syntax error → verify flinch animation
  - Fix syntax error → verify celebrate animation
  - Verify works offline with no API keys
  - _Requirements: 1.3, 1.4, 3.3, 6.1, 6.2, 7.1, 7.2, 12.1, 12.2, 12.3, 12.4_

### Phase 7: Documentation (2/4 COMPLETED)

- [x] 7.1 Document the three stitched technologies in README
  - Explicitly name: 3D generation pipeline + VS Code Extension Host APIs + Webview 3D Scene
  - Explain Frankenstein seam boundaries
  - _Requirements: 14.4_

- [x] 7.2 Add code comments explaining Frankenstein seams
  - Document which seam each component belongs to
  - Seam 1: Extension Host APIs (extension.ts, diagnosticsMonitor.ts)
  - Seam 2: Message Bridge (patchyViewProvider.ts message protocol)
  - Seam 3: Webview 3D Scene (webview inline JavaScript)
  - _Requirements: 15.1_

- [ ] 7.3 Prepare Devpost description draft
  - Write features and functionality description
  - Document Kiro usage: spec-driven development, hooks, steering
  - Explain how Kiro was used compared to vibe coding
  - _Requirements: 15.1, 15.4_

- [ ] 7.4 Create changelog
  - Document version history
  - List all implemented features
  - _Requirements: 15.1_

### Checkpoint - Final Verification

- [ ] 8. Ensure all acceptance checks pass
  - Review AGENTS.md acceptance checks list
  - Verify all Kiroween compliance requirements met
  - Confirm credit budget (~900 credits) not exceeded
  - Ensure all tests pass, ask the user if questions arise

## Notes

- **Current Status:** 25/29 tasks completed (86% complete)
- **Implementation Language:** TypeScript (for extension) + JavaScript (for webview inline code)
- **Critical Path:** Tasks 2.5, 3.4, and 6.4 are verification checkpoints that validate the core functionality
- **Testing Strategy:** Manual testing and visual verification (see acceptance checks in task 6.4)
- **Property-Based Testing:** Not applicable - this is a UI rendering and event-driven system best tested with visual regression and example-based tests
- **Frankenstein Seams:** Each task references which seam it belongs to in the design document
- **CSP Requirement:** Tasks 2.2 and 2.5 are CRITICAL - incorrect CSP causes grey rendering with no error
- **Order of Work:** Extension shell + grey-box avatar reactions FIRST, real assets SECOND (per AGENTS.md)
- **Credit Budget:** ~900 Kiro credits allocated, ~90 credits used so far (810 remaining)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2"]
    },
    {
      "id": 1,
      "tasks": ["1.3", "1.4"]
    },
    {
      "id": 2,
      "tasks": ["2.1"]
    },
    {
      "id": 3,
      "tasks": ["2.2", "2.3"]
    },
    {
      "id": 4,
      "tasks": ["2.4"]
    },
    {
      "id": 5,
      "tasks": ["2.5", "3.1"]
    },
    {
      "id": 6,
      "tasks": ["3.2", "3.3"]
    },
    {
      "id": 7,
      "tasks": ["3.4", "4.1", "4.2", "4.3"]
    },
    {
      "id": 8,
      "tasks": ["4.4"]
    },
    {
      "id": 9,
      "tasks": ["4.5", "5.1"]
    },
    {
      "id": 10,
      "tasks": ["5.2"]
    },
    {
      "id": 11,
      "tasks": ["5.3", "5.4", "5.5"]
    },
    {
      "id": 12,
      "tasks": ["6.1", "7.1", "7.2"]
    },
    {
      "id": 13,
      "tasks": ["6.2", "6.3"]
    },
    {
      "id": 14,
      "tasks": ["6.4", "7.3", "7.4"]
    }
  ]
}
```
