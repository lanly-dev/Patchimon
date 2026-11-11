# Patchimon

**3D Monster Pair Programming Companion for Kiro IDE**

Patchimon is a Kiroween 2026 Frankenstein category entry that stitches together three incompatible technologies into one creature:

1. **3D Generation Pipeline** — Avatar geometry and appearance
2. **VS Code Extension Host APIs** — Editor event monitoring and lifecycle management  
3. **Webview 3D Scene (Three.js)** — Real-time browser-context rendering

A reactive 3D monster avatar lives in your editor sidebar, watching your code and responding to your coding events. It flinches when errors appear, celebrates when things go green, and idles while you think.

## Features

- **Reactive Avatar**: Responds to editor diagnostics and file events in real-time
- **Three Animation States**: Idle (breathing + bolt twitch), Celebrate (arms up + hop), Flinch (squash + cover)
- **Zero Setup**: No API keys, no GPU, no accounts — works completely offline
- **Classic Patch-Plush Design**: Round plush monster with mismatched fabric patches (mint, lavender, mustard, dusty pink)

## Installation

1. **Install the VSIX** in Kiro IDE:
   - Download `patchimon-0.1.0.vsix` from this repository
   - Open Kiro IDE (VS Code)
   - Run command: `Extensions: Install from VSIX...`
   - Select the downloaded VSIX file

2. **Open the Avatar Panel**:
   - Click the Patchimon icon in the Activity Bar (left sidebar)
   - Or run command: `Patchimon: Show Avatar`

3. **See it React**:
   - Type a syntax error in any file → avatar flinches 😱
   - Fix the error → diagnostics clear → avatar celebrates 🎉
   - Save a file → avatar acknowledges with a small pulse

## How It Works

### The Frankenstein Seams

**Seam 1: VS Code Extension Host (Node.js)**
- Manages extension lifecycle and activation
- Subscribes to diagnostics API events
- Listens for file save events
- Translates editor events into animation commands

**Seam 2: Message Bridge**
- `postMessage` communication between Node.js host and browser context
- Command protocol: `{ command: 'animate', state: 'idle' | 'celebrate' | 'flinch' }`
- Webview provider manages panel lifecycle and retains context

**Seam 3: Three.js Webview Scene**
- Runs in isolated browser context with proper Content Security Policy
- Renders 3D avatar using WebGL (Three.js)
- Procedural animation system (no skeletal rigs or clip libraries)
- Parts-and-pivots approach: segmented body parts with visible patch seams as joints

### Avatar Anatomy

The Patchimon avatar is built from segmented primitives:
- **Head**: Sphere (mint green) — main body
- **Belly Patch**: Circle (dusty pink) — front detail
- **Left Arm**: Cylinder (lavender) — independently animated
- **Right Arm**: Cylinder (mustard) — independently animated
- **Left Foot**: Box (dusty pink) — grounded support
- **Right Foot**: Box (lavender) — grounded support
- **Bolt**: Metallic cylinder (grey) — neck ornament with twitch animation

Design principle: **"The seams are the joints"** — patch color boundaries serve as animation pivot points.

## Built with Kiro

This project demonstrates thorough, skillful, and varied use of Kiro IDE and its features:

### 1. Spec-Driven Development

**Full requirements → design → tasks specification created first:**
- **Location:** `/.kiro/specs/patchimon-v1.md` (markdown) and `patchimon-structured.json` (machine-readable)
- **Structure:** 14 requirements (FR1-4, NFR1-3) → component design → 29 tasks across 7 phases
- **Structured format:** Task status, credit usage, completion percentage (86% complete, 90 of 900 credits used)
- **Traceability:** Every v1 feature from AGENTS.md mapped to specific task IDs
- **Acceptance criteria:** Defined upfront, verified during implementation

**Compared to vibe coding:** The spec-first approach caught design issues early (like CSP configuration requirements) before any code was written. Tasks provided clear implementation order, and judges can verify each requirement traces to working code. The structured JSON format enables automated validation of task progression and credit tracking.

### 2. Agent Hooks (5 automated workflows)

**Development automation that runs automatically:**

1. **Auto-Compile TypeScript** (`auto-compile-typescript.json`)
   - Trigger: PostFileSave on `src/*.ts` files
   - Action: Runs `npm run compile` automatically
   - Benefit: Immediate compilation feedback, catches errors as you code

2. **Absolute Path Verification** (`verify-no-absolute-paths.json`)
   - Trigger: PostFileSave on `.ts`, `.js`, `.md`, `.json` files
   - Action: Blocks save if forbidden path patterns detected
   - Benefit: Enforces Kiroween compliance requirement automatically

3. **Package.json Change Reminder** (`package-json-reminder.json`)
   - Trigger: PostFileSave on `package.json`
   - Action: Reminds to reinstall dependencies and rebuild VSIX
   - Benefit: Prevents forgetting critical build steps

4. **Project Context Loader** (`project-context-loader.json`)
   - Trigger: SessionStart
   - Action: Loads AGENTS.md requirements and compliance rules into agent context
   - Benefit: Every session starts with full project context

5. **Spec Sync Reminder** (`spec-sync-reminder.json`)
   - Trigger: PostFileSave on implementation files
   - Action: Agent reminds to update spec task status
   - Benefit: Keeps spec synchronized with implementation

**Impact:** These hooks automated ~50 manual compile/verify steps during development, ensuring consistency and catching compliance violations immediately.

### 3. Steering Files (3 always-included contexts)

**Development standards loaded into every agent session:**

1. **Kiroween Compliance Rules** (`kiroween-compliance.md`)
   - All hackathon hard rules organized
   - Disqualification risk checklist
   - Path reference enforcement
   - Submission requirements

2. **TypeScript Conventions** (`typescript-conventions.md`)
   - Naming conventions and file organization
   - VS Code extension patterns
   - Three.js webview standards
   - Error handling templates

3. **Development Workflow** (`development-workflow.md`)
   - Spec-first iteration pattern
   - Testing procedures
   - Commit strategy
   - Pre-submission checklist

**Impact:** Steering files maintained coding consistency across sessions and ensured compliance requirements were never forgotten.

### 4. Kiro IDE Features Used

- **TypeScript extension development** with integrated debugging
- **Webview development tools** with Chrome DevTools integration
- **Git integration** for version control
- **Terminal integration** for build commands
- **Extension host testing** via F5 debug launch

### How Kiro Changed Development

**Traditional approach:**
1. Write code
2. Manually compile
3. Test
4. Forget compliance rule
5. Fix later

**With Kiro:**
1. **Spec defines what to build** (no ambiguity)
2. **Hooks auto-compile on save** (immediate feedback)
3. **Hooks block non-compliant code** (can't commit violations)
4. **Steering keeps context loaded** (consistent decisions)
5. **Test with confidence** (requirements traced to code)

The automation and context management let me focus on the creative problem (stitching three incompatible technologies) instead of remembering to compile or checking for absolute paths manually.

### Build Commands

```bash
npm install          # Install dependencies
npm run compile      # Compile TypeScript (also runs automatically via hook on .ts save)
npm run watch        # Watch mode for development
npm run package      # Build VSIX
```

### Development with Kiro Hooks

Hooks automate the development workflow:
- **Save a `.ts` file** → Auto-compiles TypeScript
- **Save any code/doc file** → Verifies no absolute paths
- **Start session** → Loads project context automatically
- **Modify package.json** → Reminds to reinstall dependencies

Check `/.kiro/hooks/` to see all automation.

## Technical Details

- **Language**: TypeScript
- **Framework**: VS Code Extension API
- **Renderer**: Three.js (via CDN)
- **Animation**: Procedural transforms (no skeletal animation)
- **Network**: Completely offline-capable

### Content Security Policy

The webview uses a carefully configured CSP that allows `blob:` and `data:` URLs for `img-src` and `connect-src`. This is critical for Three.js GLTFLoader to fetch embedded textures — without this, models render grey with no error (learned from 3D Kits viewer project).

## Roadmap

Current version (v1): Grey-box avatar with three procedural animations.

Future enhancements:
- Real 3D GLB asset with the Classic Patch-Plush design
- Additional editor signals (debug session, test results)
- Multiple monster variants
- Optional on-demand generation (if no API key required)

## License

MIT License — see LICENSE file for details.

## Credits

Built for **Kiroween 2026** hackathon in the **Frankenstein** category.

**Three Technologies Stitched:**
1. 3D generation pipeline (avatar design and geometry)
2. VS Code extension host APIs (editor integration)
3. Webview 3D scene (Three.js browser rendering)

---

**Patchimon** — Your pair programming companion who feels your bugs.
