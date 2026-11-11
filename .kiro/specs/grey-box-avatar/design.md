# Design Document

## Overview

Patchimon is a VS Code extension that creates a reactive 3D monster avatar companion for pair programming in the Kiro IDE. The extension stitches together three incompatible technologies (Frankenstein seams) into a single cohesive application:

1. **VS Code Extension Host APIs (Node.js)** - Extension activation, command registration, and editor event monitoring
2. **Message Bridge (IPC)** - postMessage protocol for communication between isolated contexts
3. **Webview 3D Scene (Three.js/Browser)** - WebGL rendering and procedural animation

The avatar watches the editor through the VS Code Diagnostics API and reacts to coding events: flinching when errors appear, celebrating when errors are cleared, and acknowledging file saves with subtle idle motion.

**Key Design Goals:**
- Zero external setup (no API keys, GPU, or accounts required)
- Complete offline operation after initial load
- Smooth animations with sub-200ms transitions
- Judge-friendly installation via VSIX package
- Credit budget conscious (~900 Kiro credits)

## Introduction

This document describes the architecture, components, interfaces, and technical decisions required to implement the requirements specified in requirements.md. The design emphasizes simplicity, testability, and compliance with Kiroween 2026 submission requirements.

## Architecture

### System Overview

Patchimon uses a three-tier architecture that spans three distinct execution contexts, each representing a Frankenstein seam:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Patchimon Extension                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SEAM 1: Extension Host (Node.js Process)                │  │
│  │  ────────────────────────────────────────────────────────│  │
│  │  ┌────────────────┐  ┌─────────────────────────────┐    │  │
│  │  │  extension.ts   │  │  diagnosticsMonitor.ts      │    │  │
│  │  │                │  │                             │    │  │
│  │  │  • Activation   │  │  • Listen to diagnostics   │    │  │
│  │  │  • Commands     │  │  • Track error state       │    │  │
│  │  │  • Provider     │  │  • Translate to animations │    │  │
│  │  └────────┬───────┘  └───────────┬─────────────────┘    │  │
│  │           │                       │                       │  │
│  │           └───────────┬───────────┘                       │  │
│  │                       │                                   │  │
│  │           ┌───────────▼───────────┐                       │  │
│  │           │  patchyViewProvider.ts│                       │  │
│  │           │                        │                       │  │
│  │           │  • Webview lifecycle  │                       │  │
│  │           │  • HTML generation    │                       │  │
│  │           │  • CSP configuration  │                       │  │
│  │           │  • Message bridge     │                       │  │
│  │           └───────────┬───────────┘                       │  │
│  └───────────────────────┼───────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │  SEAM 2: Message Bridge (IPC)                             │  │
│  │  ──────────────────────────────────────────────────────── │  │
│  │                                                            │  │
│  │  webview.postMessage({command: 'animate', state: 'flinch'})│  │
│  │                                                            │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │  SEAM 3: Webview (Browser Context)                        │  │
│  │  ──────────────────────────────────────────────────────── │  │
│  │                                                            │  │
│  │  ┌──────────────────────┐  ┌────────────────────────┐   │  │
│  │  │  Avatar Renderer     │  │  Animation Controller  │   │  │
│  │  │                      │  │                        │   │  │
│  │  │  • Three.js scene    │  │  • State machine       │   │  │
│  │  │  • Camera/lighting   │  │  • Procedural anims    │   │  │
│  │  │  • Grey-box geometry │◄─┤  • requestAnimFrame    │   │  │
│  │  │  • Part pivots       │  │  • Message handler     │   │  │
│  │  └──────────────────────┘  └────────────────────────┘   │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Frankenstein Seams

The three stitched technologies and their boundaries:

1. **Seam 1: VS Code Extension Host APIs (Node.js)**
   - Technology: Node.js process with VS Code extension API
   - Components: extension.ts, diagnosticsMonitor.ts, patchyViewProvider.ts
   - Responsibilities: Lifecycle management, editor event monitoring, command registration
   - Boundary: Cannot directly access DOM or WebGL; must communicate via messages

2. **Seam 2: Message Bridge (IPC)**
   - Technology: postMessage protocol between Node.js and browser contexts
   - Components: Message serialization/deserialization logic in provider
   - Responsibilities: Command serialization, context bridging, event translation
   - Boundary: Asynchronous communication, JSON-serializable data only

3. **Seam 3: Webview 3D Scene (Three.js/Browser)**
   - Technology: Three.js WebGL rendering in sandboxed browser context
   - Components: Webview inline JavaScript for scene and animation
   - Responsibilities: 3D rendering, procedural animation, visual feedback
   - Boundary: Cannot access VS Code APIs; isolated security context with CSP

### Data Flow

```
User writes code with error
         │
         ▼
VS Code Diagnostics API emits change event
         │
         ▼
diagnosticsMonitor detects error transition (none → errors)
         │
         ▼
diagnosticsMonitor calls provider.animate('flinch')
         │
         ▼
patchyViewProvider.animate() sends postMessage
         │
         ▼
Webview receives message {command: 'animate', state: 'flinch'}
         │
         ▼
Animation Controller transitions to flinch state
         │
         ▼
requestAnimationFrame loop applies procedural transforms
         │
         ▼
Avatar squashes down, arms cover face (rendered in Three.js)
```

## Components and Interfaces

### Component 1: Extension Entry Point (extension.ts)

**Seam:** Seam 1 (Extension Host)

**Purpose:** Entry point for the extension, handles activation, command registration, and initialization of the webview provider and diagnostics monitor.

**Responsibilities:**
- Register the `patchimon.showAvatar` command
- Create and register the PatchyViewProvider
- Create and initialize the DiagnosticsMonitor
- Manage disposable resources in context.subscriptions

**Interfaces:**

```typescript
export function activate(context: vscode.ExtensionContext): void {
  // Register webview provider
  const provider = new PatchyViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('patchimon.avatarView', provider)
  );
  
  // Register command
  context.subscriptions.push(
    vscode.commands.registerCommand('patchimon.showAvatar', () => {
      vscode.commands.executeCommand('patchimon.avatarView.focus');
    })
  );
  
  // Initialize diagnostics monitor
  const monitor = new DiagnosticsMonitor(provider);
  context.subscriptions.push(monitor);
}

export function deactivate(): void {
  // Cleanup handled by disposables
}
```

**Key Design Decisions:**
- Use `registerWebviewViewProvider` for sidebar integration rather than custom panel
- Store provider reference to pass to diagnostics monitor for message sending
- All event subscriptions added to context.subscriptions for automatic cleanup

### Component 2: Webview Provider (patchyViewProvider.ts)

**Seam:** Seam 1 (Extension Host) + Seam 2 (Message Bridge)

**Purpose:** Manages the webview lifecycle, generates HTML content with proper CSP, and provides the message bridge to the webview context.

**Responsibilities:**
- Implement WebviewViewProvider interface
- Generate HTML with Three.js scene setup
- Configure Content Security Policy to allow blob: and data: URLs
- Send animation commands to webview via postMessage
- Handle webview visibility and context retention

**Class Interface:**

```typescript
export class PatchyViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  
  constructor(private readonly _extensionUri: vscode.Uri) {}
  
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void {
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }
  
  public animate(state: 'idle' | 'celebrate' | 'flinch'): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: 'animate',
        state: state
      });
    }
  }
  
  public acknowledgeSave(): void {
    // Send idle acknowledgment without changing state
    if (this._view) {
      this._view.webview.postMessage({
        command: 'acknowledge'
      });
    }
  }
  
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Generate HTML with Three.js scene and animation controller
    // See HTML structure section below
  }
}
```

**Message Protocol:**

Extension → Webview messages:
```typescript
type AnimateMessage = {
  command: 'animate';
  state: 'idle' | 'celebrate' | 'flinch';
};

type AcknowledgeMessage = {
  command: 'acknowledge';
};

type WebviewMessage = AnimateMessage | AcknowledgeMessage;
```

**HTML Structure:**

The generated HTML includes:
1. Content Security Policy meta tag
2. Three.js CDN script tag
3. Inline JavaScript for scene setup and animation
4. Canvas element for WebGL rendering

**Critical CSP Configuration:**

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               script-src 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'unsafe-inline'; 
               img-src blob: data:; 
               connect-src blob: data:;">
```

**Rationale:** GLTFLoader (and potentially other Three.js loaders) fetch embedded textures from `blob:` URLs. Without `img-src` and `connect-src` allowing `blob:` and `data:`, textures are silently stripped and models render grey with no error. This lesson was learned from the 3D Kits viewer project.

### Component 3: Diagnostics Monitor (diagnosticsMonitor.ts)

**Seam:** Seam 1 (Extension Host)

**Purpose:** Listens to VS Code diagnostics API events, tracks error state transitions, and translates them into animation commands.

**Responsibilities:**
- Subscribe to `vscode.languages.onDidChangeDiagnostics` event
- Track previous error state to detect transitions
- Identify none→errors transition (trigger flinch)
- Identify errors→none transition (trigger celebrate)
- Send animation commands to webview provider
- Implement Disposable for cleanup

**Class Interface:**

```typescript
export class DiagnosticsMonitor implements vscode.Disposable {
  private _hasErrors: boolean = false;
  private _disposables: vscode.Disposable[] = [];
  
  constructor(private readonly _provider: PatchyViewProvider) {
    // Subscribe to diagnostics changes
    this._disposables.push(
      vscode.languages.onDidChangeDiagnostics(this._onDiagnosticsChanged, this)
    );
    
    // Subscribe to file save events
    this._disposables.push(
      vscode.workspace.onDidSaveTextDocument(this._onFileSaved, this)
    );
  }
  
  private _onDiagnosticsChanged(event: vscode.DiagnosticChangeEvent): void {
    const currentHasErrors = this._checkForErrors();
    
    // Detect transitions
    if (currentHasErrors && !this._hasErrors) {
      // none → errors: flinch
      this._provider.animate('flinch');
    } else if (!currentHasErrors && this._hasErrors) {
      // errors → none: celebrate
      this._provider.animate('celebrate');
    }
    
    this._hasErrors = currentHasErrors;
  }
  
  private _checkForErrors(): boolean {
    // Check all diagnostics for error-severity issues
    const allDiagnostics = vscode.languages.getDiagnostics();
    for (const [uri, diagnostics] of allDiagnostics) {
      if (diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Error)) {
        return true;
      }
    }
    return false;
  }
  
  private _onFileSaved(document: vscode.TextDocument): void {
    // Send acknowledgment without changing animation state
    this._provider.acknowledgeSave();
  }
  
  dispose(): void {
    for (const disposable of this._disposables) {
      disposable.dispose();
    }
  }
}
```

**State Transition Logic:**

```
State: { hasErrors: boolean }

Initial: hasErrors = false

Transitions:
  hasErrors=false ─[errors detected]──> hasErrors=true  (trigger flinch)
  hasErrors=true  ─[no errors found]──> hasErrors=false (trigger celebrate)
  hasErrors=false ─[no errors found]──> hasErrors=false (no action)
  hasErrors=true  ─[errors detected]──> hasErrors=true  (no action)
```

**Key Design Decisions:**
- Only react to state transitions, not every diagnostics event
- Check all open documents for errors, not just the active document
- Use DiagnosticSeverity.Error level only (ignore warnings and info)
- Separate file save acknowledgment from error state transitions

### Component 4: Avatar Renderer (Webview Inline JavaScript)

**Seam:** Seam 3 (Webview 3D Scene)

**Purpose:** Sets up and manages the Three.js scene, camera, renderer, lighting, and grey-box avatar geometry.

**Responsibilities:**
- Initialize Three.js scene, camera, and WebGL renderer
- Create ambient and directional lighting
- Build grey-box avatar from primitive geometries
- Group body parts under pivot points for animation
- Apply patch colors to different segments
- Handle canvas resizing

**Scene Setup:**

```javascript
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e); // VS Code dark background

// Camera
const camera = new THREE.PerspectiveCamera(
  50,                                    // FOV
  window.innerWidth / window.innerHeight, // Aspect
  0.1,                                   // Near
  1000                                   // Far
);
camera.position.set(0, 1.5, 5);
camera.lookAt(0, 1, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
```

**Avatar Geometry (Grey-Box):**

The avatar consists of 7 segmented parts using Three.js primitives:

```javascript
const colors = {
  mint: 0xb2f7ef,
  lavender: 0xc8b6ff,
  mustard: 0xffd93d,
  dustyPink: 0xf4a4a4,
  metalGrey: 0x808080
};

// Head (main body)
const headGeometry = new THREE.SphereGeometry(1, 32, 32);
const headMaterial = new THREE.MeshPhongMaterial({ color: colors.mint });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1;

// Belly patch
const bellyGeometry = new THREE.PlaneGeometry(0.8, 0.8);
const bellyMaterial = new THREE.MeshPhongMaterial({ color: colors.dustyPink });
const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
belly.position.set(0, 1, 1.05);

// Left arm (with pivot at shoulder)
const leftArmPivot = new THREE.Group();
leftArmPivot.position.set(-1, 1, 0); // Shoulder position
const leftArmGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8);
const leftArmMaterial = new THREE.MeshPhongMaterial({ color: colors.lavender });
const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
leftArm.position.y = -0.4; // Offset from pivot
leftArmPivot.add(leftArm);

// Right arm (with pivot at shoulder)
const rightArmPivot = new THREE.Group();
rightArmPivot.position.set(1, 1, 0); // Shoulder position
const rightArmGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8);
const rightArmMaterial = new THREE.MeshPhongMaterial({ color: colors.mustard });
const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
rightArm.position.y = -0.4; // Offset from pivot
rightArmPivot.add(rightArm);

// Left foot
const leftFootGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.6);
const leftFootMaterial = new THREE.MeshPhongMaterial({ color: colors.dustyPink });
const leftFoot = new THREE.Mesh(leftFootGeometry, leftFootMaterial);
leftFoot.position.set(-0.4, 0.1, 0);

// Right foot
const rightFootGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.6);
const rightFootMaterial = new THREE.MeshPhongMaterial({ color: colors.lavender });
const rightFoot = new THREE.Mesh(rightFootGeometry, rightFootMaterial);
rightFoot.position.set(0.4, 0.1, 0);

// Bolt (neck bolt as ear)
const boltGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3);
const boltMaterial = new THREE.MeshPhongMaterial({ color: colors.metalGrey });
const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
bolt.position.set(1.2, 1, 0);
bolt.rotation.z = Math.PI / 2;

// Avatar group
const avatar = new THREE.Group();
avatar.add(head);
avatar.add(belly);
avatar.add(leftArmPivot);
avatar.add(rightArmPivot);
avatar.add(leftFoot);
avatar.add(rightFoot);
avatar.add(bolt);
scene.add(avatar);
```

**Design Principle: "The seams are the joints"**

The avatar's color patches create visible seams that double as animation pivot points. Each limb is grouped under a pivot point at its attachment to the body, allowing rotation and translation without complex skeletal rigging.

**Resize Handling:**

```javascript
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### Component 5: Animation Controller (Webview Inline JavaScript)

**Seam:** Seam 3 (Webview 3D Scene)

**Purpose:** Manages the animation state machine, applies procedural transforms to avatar parts, and handles incoming animation commands.

**Responsibilities:**
- Maintain animation state: idle, celebrate, or flinch
- Apply procedural transformations using requestAnimationFrame
- Handle state transitions with duration tracking
- Listen for animation messages from extension
- Implement idle breathing and bolt twitch
- Implement celebrate arm raise and hop
- Implement flinch squash and arm cover

**State Machine:**

```javascript
const animationState = {
  current: 'idle',  // 'idle' | 'celebrate' | 'flinch'
  startTime: null,
  duration: 0
};

const CELEBRATE_DURATION = 1000; // 1 second
const FLINCH_DURATION = 500;     // 0.5 seconds
```

**Animation Loop:**

```javascript
function animate() {
  requestAnimationFrame(animate);
  
  const now = Date.now();
  const elapsed = animationState.startTime ? now - animationState.startTime : 0;
  
  if (animationState.current === 'idle') {
    applyIdleAnimation(now);
  } else if (animationState.current === 'celebrate') {
    if (elapsed < CELEBRATE_DURATION) {
      applyCelebrateAnimation(elapsed / CELEBRATE_DURATION);
    } else {
      transitionToIdle();
    }
  } else if (animationState.current === 'flinch') {
    if (elapsed < FLINCH_DURATION) {
      applyFlinchAnimation(elapsed / FLINCH_DURATION);
    } else {
      transitionToIdle();
    }
  }
  
  renderer.render(scene, camera);
}

animate();
```

**Idle Animation:**

```javascript
function applyIdleAnimation(time) {
  // Breathing sway: sinusoidal Y-axis motion
  const breathingSpeed = 0.001;
  const breathingAmplitude = 0.05;
  avatar.position.y = Math.sin(time * breathingSpeed) * breathingAmplitude;
  
  // Bolt twitch: occasional rotation
  const twitchFrequency = 3000; // Every 3 seconds
  if (time % twitchFrequency < 100) {
    const twitchProgress = (time % twitchFrequency) / 100;
    bolt.rotation.y = Math.sin(twitchProgress * Math.PI * 2) * 0.2;
  } else {
    bolt.rotation.y = 0;
  }
}
```

**Celebrate Animation:**

```javascript
function applyCelebrateAnimation(progress) {
  // Reset to neutral position first
  resetAvatarTransforms();
  
  // Arms rotate upward (0 to π/2)
  const armRotation = progress * Math.PI / 2;
  leftArmPivot.rotation.z = -armRotation;
  rightArmPivot.rotation.z = armRotation;
  
  // Body hops up and down (parabolic motion)
  const hopHeight = 0.5;
  const parabola = 4 * progress * (1 - progress); // Peaks at 0.5
  avatar.position.y = parabola * hopHeight;
}
```

**Flinch Animation:**

```javascript
function applyFlinchAnimation(progress) {
  // Reset to neutral position first
  resetAvatarTransforms();
  
  // Body squashes down (scale Y decreases)
  const squashAmount = 0.7;
  const squash = 1 - (progress * (1 - squashAmount));
  head.scale.y = squash;
  
  // Arms move to cover face
  const coverRotation = progress * Math.PI / 3;
  leftArmPivot.rotation.z = -Math.PI / 4 - coverRotation;
  rightArmPivot.rotation.z = Math.PI / 4 + coverRotation;
  
  // Arms move forward
  leftArmPivot.position.z = progress * 0.5;
  rightArmPivot.position.z = progress * 0.5;
}
```

**State Transitions:**

```javascript
function transitionToState(state) {
  if (animationState.current === state) return;
  
  animationState.current = state;
  animationState.startTime = Date.now();
  
  if (state === 'celebrate') {
    animationState.duration = CELEBRATE_DURATION;
  } else if (state === 'flinch') {
    animationState.duration = FLINCH_DURATION;
  }
}

function transitionToIdle() {
  resetAvatarTransforms();
  animationState.current = 'idle';
  animationState.startTime = null;
}

function resetAvatarTransforms() {
  // Reset all transforms to neutral position
  avatar.position.y = 0;
  head.scale.set(1, 1, 1);
  leftArmPivot.rotation.set(0, 0, 0);
  rightArmPivot.rotation.set(0, 0, 0);
  leftArmPivot.position.z = 0;
  rightArmPivot.position.z = 0;
  bolt.rotation.y = 0;
}
```

**Message Handler:**

```javascript
window.addEventListener('message', (event) => {
  const message = event.data;
  
  switch (message.command) {
    case 'animate':
      transitionToState(message.state);
      break;
    case 'acknowledge':
      // Small pulse without leaving idle state
      if (animationState.current === 'idle') {
        head.scale.set(1.05, 1.05, 1.05);
        setTimeout(() => head.scale.set(1, 1, 1), 100);
      }
      break;
  }
});
```

## Data Models

### Animation State

```typescript
interface AnimationState {
  current: 'idle' | 'celebrate' | 'flinch';
  startTime: number | null;
  duration: number;
}
```

### Diagnostic State

```typescript
interface DiagnosticState {
  hasErrors: boolean;
}
```

### Message Types

```typescript
// Extension → Webview
type AnimateMessage = {
  command: 'animate';
  state: 'idle' | 'celebrate' | 'flinch';
};

type AcknowledgeMessage = {
  command: 'acknowledge';
};

type WebviewMessage = AnimateMessage | AcknowledgeMessage;
```

### Avatar Geometry References

```typescript
interface AvatarParts {
  head: THREE.Mesh;
  belly: THREE.Mesh;
  leftArmPivot: THREE.Group;
  leftArm: THREE.Mesh;
  rightArmPivot: THREE.Group;
  rightArm: THREE.Mesh;
  leftFoot: THREE.Mesh;
  rightFoot: THREE.Mesh;
  bolt: THREE.Mesh;
  avatar: THREE.Group; // Container for all parts
}
```

## Error Handling

### Extension Host Error Handling

**Activation Errors:**

```typescript
export function activate(context: vscode.ExtensionContext): void {
  try {
    // Initialization code
  } catch (error) {
    console.error('Patchimon activation error:', error);
    vscode.window.showErrorMessage(`Patchimon: Failed to activate - ${error.message}`);
  }
}
```

**Diagnostics Event Errors:**

```typescript
private _onDiagnosticsChanged(event: vscode.DiagnosticChangeEvent): void {
  try {
    const currentHasErrors = this._checkForErrors();
    // Transition logic...
  } catch (error) {
    console.error('Patchimon diagnostics error:', error);
    // Don't show user message for non-critical errors
  }
}
```

**Message Sending Errors:**

```typescript
public animate(state: 'idle' | 'celebrate' | 'flinch'): void {
  try {
    if (this._view) {
      this._view.webview.postMessage({
        command: 'animate',
        state: state
      });
    }
  } catch (error) {
    console.error('Patchimon message error:', error);
  }
}
```

### Webview Error Handling

**Three.js Initialization Errors:**

```javascript
try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(/* ... */);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // Scene setup...
} catch (error) {
  console.error('Avatar rendering error:', error);
  document.body.innerHTML = '<p style="color: white; padding: 20px;">Failed to initialize 3D scene. Please reload the panel.</p>';
}
```

**Animation Errors:**

```javascript
function animate() {
  try {
    requestAnimationFrame(animate);
    // Animation logic...
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Animation error:', error);
    // Continue animation loop despite error
  }
}
```

**Message Handler Errors:**

```javascript
window.addEventListener('message', (event) => {
  try {
    const message = event.data;
    
    switch (message.command) {
      case 'animate':
        if (['idle', 'celebrate', 'flinch'].includes(message.state)) {
          transitionToState(message.state);
        } else {
          console.warn('Invalid animation state:', message.state);
        }
        break;
      case 'acknowledge':
        // Acknowledgment logic...
        break;
      default:
        console.warn('Unknown command:', message.command);
    }
  } catch (error) {
    console.error('Message handler error:', error);
  }
});
```

### Error Recovery Strategies

1. **Non-critical errors:** Log to console, continue operation
2. **Critical initialization errors:** Show user message, prevent further action
3. **Animation errors:** Continue animation loop, avoid cascading failures
4. **Invalid messages:** Log warning, ignore message
5. **State corruption:** Reset to idle state as fallback

## Correctness Properties

**Property-Based Testing Assessment:** Property-based testing is NOT applicable to this feature.

**Rationale:**

Patchimon is primarily a UI rendering and event-driven system with the following characteristics that make it unsuitable for property-based testing:

1. **UI Rendering and Animation** - The core functionality is 3D avatar rendering and visual animations. These are best tested with visual regression tests and manual verification, not universal properties.

2. **Event-Driven Side Effects** - The extension reacts to VS Code events (diagnostics, file saves) by sending messages and triggering animations. These are side-effect-only operations with no return value to assert properties on.

3. **Infrastructure and Configuration** - Much of the extension is VS Code infrastructure setup, CSP configuration, and webview lifecycle management. These are configuration validation concerns, not algorithmic logic.

4. **One-to-One Event Mapping** - The system has deterministic, specific reactions: error appears → flinch, error clears → celebrate. These are best verified with example-based tests, not randomized property tests.

**Alternative Testing Strategy:**

Instead of property-based testing, Patchimon uses:
- **Unit tests** for state transition logic and event detection
- **Integration tests** for message passing and component interaction
- **Manual visual testing** for animation quality and rendering correctness
- **Acceptance tests** simulating the judge experience (install VSIX → trigger reactions)

This approach provides comprehensive coverage appropriate for a UI-focused, event-driven extension.

## Testing Strategy

### Unit Tests

Unit tests verify specific examples, edge cases, and error conditions:

**Extension Tests:**
- Command registration and activation
- Webview provider initialization
- Message sending with valid and invalid states
- Disposal and cleanup

**Diagnostics Monitor Tests:**
- Error detection from diagnostics API
- State transition detection (none→errors, errors→none)
- File save event handling
- Disposal and cleanup

**Example Test Cases:**
- When diagnostics contain errors, monitor detects error state
- When diagnostics cleared, monitor detects clear state
- When file saved, acknowledgment sent
- When invalid animation state requested, error logged

### Integration Tests

Integration tests verify component interactions:

**Extension Host Integration:**
- Extension activation triggers provider registration
- Diagnostics monitor receives provider reference
- Provider sends messages to webview
- All disposables cleaned up on deactivation

**Webview Integration:**
- Webview receives animation messages
- Animation state machine transitions correctly
- Three.js scene renders without errors
- Message handler processes all command types

**Example Integration Scenarios:**
1. User introduces syntax error → diagnostics event → flinch animation
2. User fixes error → diagnostics cleared → celebrate animation
3. User saves file → save event → idle acknowledgment

### Manual Testing

Manual testing verifies the complete user experience:

**Acceptance Checks:**
1. Fresh Kiro install + VSIX installation
2. Execute "Patchimon: Show Avatar" command
3. Verify avatar panel opens in sidebar
4. Verify avatar renders with colors (not grey)
5. Introduce syntax error → verify flinch animation
6. Fix syntax error → verify celebrate animation
7. Save file → verify idle acknowledgment
8. Disable network → verify extension still works
9. Restart IDE → verify extension activates without errors

**Visual Verification:**
- Avatar colors are vibrant (mint, lavender, mustard, dusty pink)
- Idle animation shows smooth breathing sway
- Celebrate animation shows arms raising and hopping
- Flinch animation shows squashing and arm covering
- Transitions between states are smooth (under 200ms)

### Performance Testing

Performance tests verify efficiency requirements:

**Metrics to Measure:**
- Webview load time (target: < 2 seconds)
- Animation transition time (target: < 200ms)
- CPU usage during idle animation (target: minimal)
- Memory usage (target: < 50MB for extension + webview)

**Performance Test Scenarios:**
1. Time from command execution to avatar visible
2. Time from diagnostic event to animation start
3. CPU usage during 5 minutes of idle animation
4. Memory growth over 1 hour of usage

## Design Decisions and Rationale

### Decision 1: Grey-Box Before Real Asset

**Decision:** Implement procedural grey-box avatar geometry before investing in 3D asset generation.

**Rationale:**
- Test the complete reaction loop (diagnostics → animation → rendering) with simple geometry first
- Avoid wasting credits on asset generation if the core loop doesn't work
- Simple primitives are easier to debug than complex GLB models
- Validates animation system with pivot-based transforms before committing to asset design

**Source:** AGENTS.md "How we work" section

### Decision 2: CSP Configuration for Blob URLs

**Decision:** Configure Content Security Policy to allow `blob:` and `data:` for img-src and connect-src.

**Rationale:**
- GLTFLoader fetches embedded textures from blob: URLs generated by the browser
- Without this CSP configuration, textures are silently stripped
- Models render grey with no error message, making debugging difficult
- This lesson was learned from the 3D Kits viewer project (2026-10)

**Source:** AGENTS.md "Earned lessons" section

**CSP Configuration:**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               script-src 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'unsafe-inline'; 
               img-src blob: data:; 
               connect-src blob: data:;">
```

### Decision 3: Parts-and-Pivots Animation

**Decision:** Use procedural animation with grouped parts and pivot points instead of skeletal animation.

**Rationale:**
- No skeletal animation or rigging required for non-humanoid monster
- The "seams are the joints" design principle: visible patch boundaries serve as natural pivot points
- Simpler implementation with Three.js Groups and transform hierarchies
- Easier to control procedurally with sinusoidal and time-based functions
- Lower complexity = fewer potential failure points

**Trade-offs:**
- Less sophisticated animation compared to skeletal rigging
- Limited to simple transforms (rotation, translation, scale)
- Acceptable trade-off for v1 grey-box scope

### Decision 4: Three.js via CDN

**Decision:** Load Three.js from jsdelivr CDN rather than bundling locally.

**Rationale:**
- Browser caching enables offline operation after first load
- Reduces VSIX package size
- Simpler webview HTML generation (no need to handle local resource URIs)
- Standard approach for webview content in VS Code extensions

**Trade-offs:**
- Requires network connection for first load
- Acceptable because browser cache makes it offline-capable afterward
- Judges will have network access for initial setup

### Decision 5: Sidebar Webview vs Custom Panel

**Decision:** Use `registerWebviewViewProvider` for sidebar integration instead of custom panel.

**Rationale:**
- Sidebar integration feels more natural for a companion avatar
- Retains context when hidden (important for animation state)
- Follows VS Code extension patterns for persistent views
- Easier for users to show/hide without losing state

### Decision 6: State Transition Detection

**Decision:** Track previous error state and only react to state transitions, not every diagnostics event.

**Rationale:**
- Avoids triggering animations on every keystroke when errors already exist
- Focuses on meaningful state changes: none→errors (flinch) and errors→none (celebrate)
- Reduces noise and makes avatar reactions more intentional
- Prevents animation spam during rapid editing

**Transition Logic:**
```
hasErrors=false → hasErrors=true  (trigger flinch)
hasErrors=true  → hasErrors=false (trigger celebrate)
hasErrors=false → hasErrors=false (no action)
hasErrors=true  → hasErrors=true  (no action)
```

### Decision 7: Procedural Animation Durations

**Decision:** Celebrate animation duration = 1 second, Flinch animation duration = 0.5 seconds.

**Rationale:**
- Celebrate is a positive event, deserves more screen time
- Flinch is negative feedback, should be quick and subtle
- Durations feel natural based on similar UI feedback patterns
- Both are long enough to be noticeable but short enough to not be annoying

**Future Tuning:** These durations can be adjusted based on user feedback during testing.

### Decision 8: Single Preset Avatar at v1

**Decision:** Ship exactly one preset avatar at v1, not three.

**Rationale:**
- Focus on proving the reaction loop works before expanding scope
- Conserve credit budget (~900 credits allocated)
- Reduce testing surface area for initial release
- Additional monsters can be added post-v1 after validation

**Source:** AGENTS.md "Scope v1" section (decided 2026-11-11)

## Future Enhancements

These features are explicitly out of scope for v1 but may be considered for future versions:

1. **Real 3D GLB Asset:** Replace grey-box with actual Patch-Plush GLB model generated from the design prompt
2. **Multiple Monsters:** Add additional preset avatars beyond Classic Patch-Plush
3. **On-Demand Generation:** Allow users to generate custom avatars from prompts (only if no API key required)
4. **Additional Editor Signals:** React to debug session start/stop, test results, git operations
5. **Animation Refinements:** More sophisticated procedural animations, particle effects, sound
6. **User Configuration:** Allow users to customize colors, animation speeds, trigger sensitivity
7. **Chat Integration:** Add LLM-powered chat features (explicitly non-goal for v1)

---

**Design Version:** 1.0  
**Last Updated:** 2026-11-11  
**Status:** Ready for Implementation
