# Patchimon v1 Specification

**Project:** Patchimon — 3D Monster Pair Programming Companion for Kiro IDE  
**Category:** Frankenstein (Kiroween 2026)  
**Status:** Active Development  
**Created:** 2026-11-11

> **Note:** This specification includes a machine-readable structured format at `patchimon-structured.json` for automated analysis and judge validation. The structured format includes task status tracking, credit usage metrics, and requirement traceability.

## Overview

Patchimon is a VS Code/Kiro extension that stitches together three incompatible technologies into one creature: **3D generation pipeline + extension host APIs + webview 3D scene**. It displays a reactive 3D monster avatar in a webview panel that watches the editor and reacts to coding events.

## Requirements

### Functional Requirements

#### FR1: Extension Infrastructure
- **FR1.1** TypeScript VS Code extension targeting Kiro IDE (VS Code-based)
- **FR1.2** Webview panel integration for avatar display
- **FR1.3** Extension activates on command: "Patchimon: Show Avatar"
- **FR1.4** Zero external setup required: no API keys, no GPU, no accounts
- **FR1.5** Network-independent operation (works offline)

#### FR2: Avatar System
- **FR2.1** Single preset monster avatar: "Classic Patch-Plush" design
- **FR2.2** Avatar composition: segmented body parts (head, 2 arms, 2 feet, belly patch, bolt)
- **FR2.3** Color scheme: mismatched patches (mint, lavender, mustard, dusty pink)
- **FR2.4** Design principle: "the seams are the joints" — visible patch boundaries serve as animation pivots
- **FR2.5** Three.js renderer displaying the avatar in the webview

#### FR3: Animation System
- **FR3.1** Three animation states, all procedural:
  - **Idle:** Soft breathing sway + bolt twitch
  - **Celebrate:** Arms up + hop motion
  - **Flinch:** Squash down, arms cover face
- **FR3.2** No skeletal animation or clip library required
- **FR3.3** Parts-and-pivots animation approach (procedural transforms on segments)

#### FR4: Editor Reaction System
- **FR4.1** Monitor VS Code diagnostics API
- **FR4.2** Trigger **flinch** when error-level diagnostics appear
- **FR4.3** Trigger **celebrate** when diagnostics clear to all-green after errors existed
- **FR4.4** File save acknowledgment: small motion within idle state (not a fourth state)
- **FR4.5** No chat or LLM features

### Non-Functional Requirements

#### NFR1: Compliance (Kiroween 2026)
- **NFR1.1** Spec-first development: this spec committed before implementation code
- **NFR1.2** `/.kiro` directory at repo root, never gitignored
- **NFR1.3** MIT license file at repo root
- **NFR1.4** No absolute local paths in code, comments, docs, or commits
- **NFR1.5** All file references use repo-relative paths only
- **NFR1.6** No third-party monster-franchise trademarks (Pokémon, Digimon, etc.)

#### NFR2: Technical Constraints
- **NFR2.1** Credit budget: ~900 Kiro credits for this entry
- **NFR2.2** Three.js WebGL renderer with proper Content Security Policy
- **NFR2.3** CSP must allow `blob:` and `data:` for img-src and connect-src (GLTFLoader requirement)
- **NFR2.4** Extension packages as VSIX for judge installation
- **NFR2.5** Works on fresh Kiro install with no additional setup

#### NFR3: Performance
- **NFR3.1** Webview loads and renders avatar within 2 seconds
- **NFR3.2** Animation transitions occur within 200ms of trigger event
- **NFR3.3** Minimal CPU usage during idle animation

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Extension Host (Node.js)                │  │
│  │  - Activation                                      │  │
│  │  - Webview Provider                                │  │
│  │  - Diagnostics Listener                            │  │
│  │  - Event → Message Bridge                          │  │
│  └─────────────────┬────────────────────────────────┘  │
│                     │ postMessage                        │
│                     ↓                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Webview Panel (Browser Context)           │  │
│  │  - Three.js Scene                                  │  │
│  │  - Avatar Renderer                                 │  │
│  │  - Animation Controller                            │  │
│  │  - Message Receiver                                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Design

#### 1. Extension Entry Point (`extension.ts`)
- Registers command `patchimon.showAvatar`
- Creates and manages webview panel lifecycle
- Subscribes to diagnostics change events
- Translates diagnostics to animation commands
- Sends messages to webview: `{ command: 'animate', state: 'idle' | 'celebrate' | 'flinch' }`

#### 2. Webview Provider
- Provides HTML with Three.js scene setup
- Loads avatar geometry (initial: grey-box placeholder)
- Sets up Content Security Policy with proper blob/data permissions
- Handles incoming messages from extension host
- Manages animation state machine

#### 3. Avatar Geometry (Grey-Box v1)
- **Head:** Sphere or rounded box (main body), mixed patch colors
- **Arms (2):** Cylinders or boxes, different colors (lavender, mustard)
- **Feet (2):** Flat boxes, different colors (mint, dusty pink)
- **Belly Patch:** Plane or thin box on front of head
- **Bolt:** Small cylinder protruding from side (metallic grey)
- Each part is a separate `THREE.Mesh` grouped under pivot points

#### 4. Animation Controller
- State machine: `idle` (default) → `flinch` | `celebrate` → `idle`
- Uses `requestAnimationFrame` for smooth procedural animation
- **Idle:** Sinusoidal transform on Y-axis (breathing), occasional bolt rotation
- **Celebrate:** Arms rotate up, entire body hops (Y-translation), duration ~1s
- **Flinch:** Body scales down (squash), arms move to cover face, duration ~0.5s

#### 5. Diagnostics Monitor
- Listens to `vscode.languages.onDidChangeDiagnostics`
- Tracks previous error state
- Logic:
  ```
  If (errors now && !errors before) → flinch
  If (!errors now && errors before) → celebrate
  On file save → idle acknowledgment (small pulse)
  ```

### File Structure

```
patchimon/
├── .kiro/
│   ├── specs/
│   │   └── patchimon-v1.md (this file)
│   ├── steering/
│   │   └── kiroween-compliance.md
│   └── hooks/
│       └── (proposed hooks)
├── src/
│   ├── extension.ts          # Entry point, webview provider
│   ├── diagnosticsMonitor.ts # Diagnostics listener
│   └── webview/
│       ├── main.html          # Webview HTML template
│       └── avatar.js          # Three.js scene, animation
├── media/                     # Future: avatar assets
├── package.json               # Extension manifest
├── tsconfig.json
├── LICENSE                    # MIT
├── README.md                  # Installation instructions
└── .vscodeignore
```

### Content Security Policy

**Critical:** The webview CSP must allow `blob:` and `data:` URLs for images and connections, per the GLB texture lesson in AGENTS.md.

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               script-src 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'unsafe-inline'; 
               img-src blob: data:; 
               connect-src blob: data:;">
```

### API Surface (Extension ↔ Webview)

**Extension → Webview Messages:**
```typescript
type WebviewMessage = 
  | { command: 'animate', state: 'idle' | 'celebrate' | 'flinch' }
  | { command: 'init' }
```

**Webview → Extension Messages:** (none in v1)

## Tasks

### Phase 1: Scaffold (Priority: Critical)
- **T1.1** Initialize TypeScript project with VS Code extension boilerplate
  - `package.json` with extension manifest
  - `tsconfig.json` for TypeScript compilation
  - Extension entry point structure
- **T1.2** Create MIT license file at repo root
- **T1.3** Set up build tooling (esbuild or webpack for bundling)
- **T1.4** Create basic extension activation and command registration

### Phase 2: Webview Infrastructure (Priority: Critical)
- **T2.1** Implement webview provider with panel lifecycle management
- **T2.2** Create webview HTML template with proper CSP (blob/data allowed)
- **T2.3** Integrate Three.js via CDN in webview HTML
- **T2.4** Set up basic Three.js scene (camera, renderer, lighting)
- **T2.5** Verify webview renders (screenshot checkpoint)

### Phase 3: Grey-Box Avatar (Priority: Critical)
- **T3.1** Create segmented avatar geometry using Three.js primitives
  - Head: Sphere/RoundedBox with patch-colored sections
  - Arms: 2 cylinders in different colors
  - Feet: 2 flat boxes in different colors
  - Belly: Plane on front
  - Bolt: Small cylinder (grey/metallic)
- **T3.2** Group parts under pivot points for animation
- **T3.3** Apply patch colors (mint, lavender, mustard, dusty pink) to different segments
- **T3.4** Verify avatar is visible and colored (not grey) in panel

### Phase 4: Animation System (Priority: Critical)
- **T4.1** Implement idle animation (breathing sway + bolt twitch)
- **T4.2** Implement celebrate animation (arms up + hop)
- **T4.3** Implement flinch animation (squash + arms cover face)
- **T4.4** Create animation state machine in webview
- **T4.5** Handle animation messages from extension host

### Phase 5: Editor Integration (Priority: Critical)
- **T5.1** Implement diagnostics monitor listening to VS Code diagnostics API
- **T5.2** Track error state transitions (none→errors, errors→none)
- **T5.3** Send flinch message when errors appear
- **T5.4** Send celebrate message when errors clear after existing
- **T5.5** Send idle acknowledgment on file save events

### Phase 6: Packaging & Verification (Priority: Critical)
- **T6.1** Configure VSIX packaging
- **T6.2** Create README with installation instructions (3 steps)
- **T6.3** Build VSIX package
- **T6.4** Run acceptance checks:
  - Fresh install opens panel
  - Avatar is visible and colored (not grey)
  - Syntax error triggers flinch
  - Fixing error triggers celebrate
  - Works offline with no API keys

### Phase 7: Documentation (Priority: High)
- **T7.1** Document the three stitched technologies in README
- **T7.2** Add code comments explaining Frankenstein seams
- **T7.3** Prepare Devpost description draft
- **T7.4** Create changelog

### Future (Post-Grey-Box)
- Real 3D GLB asset generation with the design prompt
- Additional editor signals (debug session, test results)
- Multiple monster variants
- On-demand generation (if no API key required)

## Acceptance Criteria

This specification is complete when:
1. ✅ All requirements are testable and traceable to tasks
2. ✅ Design addresses all three Frankenstein components explicitly
3. ✅ Task list maps every v1 feature from AGENTS.md
4. ✅ Compliance requirements from AGENTS.md are enforced in design
5. ✅ Grey-box scope is clearly separated from future work

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSP blocks texture loading | High | Set CSP correctly from day 1, verify with screenshot |
| Animation performance poor | Medium | Use simple procedural transforms, minimize geometry |
| Diagnostics events miss-timed | Medium | Add debouncing, test with rapid error introduction |
| VSIX packaging issues | High | Test install on clean Kiro instance early |
| Credit budget overrun | Medium | Monitor usage, avoid gold-plating |

## Success Metrics

- Extension installs and activates on fresh Kiro
- Avatar renders colored (not grey) within 2 seconds
- All three animations trigger correctly from editor events
- Works completely offline
- Passes all acceptance checks in AGENTS.md

---

**Spec Version:** 1.0  
**Last Updated:** 2026-11-11  
**Next Review:** After grey-box completion
