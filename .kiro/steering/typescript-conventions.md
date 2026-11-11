# TypeScript & VS Code Extension Conventions

**Project:** Patchimon  
**Purpose:** Development standards and patterns for extension code

## TypeScript Standards

### File Organization
- **Entry point:** `src/extension.ts` — activation, command registration
- **Providers:** `src/*Provider.ts` — webview, tree views, etc.
- **Monitors/Listeners:** `src/*Monitor.ts` — event subscribers
- **Utilities:** `src/utils/*.ts` — shared helpers

### Naming Conventions
- **Classes:** PascalCase (e.g., `PatchyViewProvider`)
- **Interfaces:** PascalCase with `I` prefix for pure interfaces (e.g., `IAnimationState`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `CELEBRATE_DURATION`)
- **Functions/Methods:** camelCase (e.g., `onDiagnosticsChanged`)
- **Private members:** camelCase with `_` prefix (e.g., `_view`)

### Code Documentation
- **Frankenstein seams:** Always document which seam/technology a component belongs to
  - Seam 1: Extension Host APIs (Node.js)
  - Seam 2: Message Bridge (IPC)
  - Seam 3: Webview 3D Scene (Three.js/Browser)
- **Public methods:** JSDoc comments with `@param` and purpose
- **Complex logic:** Inline comments explaining "why," not "what"

### Type Safety
- **Strict mode enabled:** No implicit `any`, strict null checks
- **Message types:** Define explicit types for extension ↔ webview messages
- **Avoid `any`:** Use `unknown` and type guards instead
- **Event handlers:** Type parameters for event objects

## VS Code Extension Patterns

### Activation
```typescript
export function activate(context: vscode.ExtensionContext) {
    // Register all disposables on context.subscriptions
    // This ensures cleanup on deactivation
}
```

### Webview Management
- **Retain context:** Set `retainContextWhenHidden: true` for panels
- **CSP:** Always configure Content Security Policy for security
- **Message passing:** Use structured commands, not loose strings
- **Resource URIs:** Use `webview.asWebviewUri()` for local resources

### Event Subscriptions
- **Always dispose:** Add all event subscriptions to `disposables` array
- **Implement Disposable:** Classes with subscriptions should implement `vscode.Disposable`
- **Error handling:** Wrap event handlers in try-catch, log errors

### Diagnostics API
- **Listen to changes:** `vscode.languages.onDidChangeDiagnostics`
- **Filter by severity:** Use `DiagnosticSeverity.Error` for errors only
- **Track state:** Maintain previous state to detect transitions
- **Performance:** Debounce rapid changes if needed

## Three.js in Webview

### Scene Setup
- **CDN loading:** Use jsdelivr CDN for Three.js (offline-capable via cache)
- **Initialization:** Set up scene, camera, renderer in IIFE
- **Lighting:** Ambient + directional for good visibility
- **Camera position:** Position to frame the avatar well

### Animation
- **Procedural only:** No skeletal animation or GLTF clips in v1
- **RequestAnimationFrame:** Use for smooth 60fps loop
- **State machine:** Clear states with transition logic
- **Timing:** Use `Date.now()` for duration-based animations

### Performance
- **Geometry reuse:** Create geometry once, reuse for instances
- **Simple shapes:** Use primitives (sphere, cylinder, box) for grey-box
- **Minimal draw calls:** Group static objects
- **Resize handling:** Update camera aspect ratio and renderer size

## Error Handling

### Extension Host
```typescript
try {
    // Risky operation
} catch (error) {
    console.error('Patchimon error:', error);
    vscode.window.showErrorMessage(`Patchimon: ${error.message}`);
}
```

### Webview
```typescript
try {
    // Three.js operation
} catch (error) {
    console.error('Avatar rendering error:', error);
    // Show status in UI element
}
```

## Testing Approach

### Manual Testing (v1)
- **Install fresh:** Test VSIX installation on clean Kiro
- **Visual verification:** Screenshot confirms rendering (not grey)
- **Event testing:** Trigger diagnostics, save events manually
- **Offline test:** Disable network, verify still works

### Future Automated Testing
- Unit tests for diagnostics monitor logic
- Integration tests for message passing
- Visual regression tests for avatar rendering

## Build & Package

### Development Workflow
1. `npm run compile` — Compile TypeScript (or use watch mode)
2. Test in Extension Development Host
3. `npm run package` — Build VSIX for distribution

### VSIX Contents
- Include: `dist/`, `media/`, `.kiro/`, `LICENSE`, `package.json`
- Exclude: `src/`, `node_modules/.bin`, `*.ts`, `*.map` (via `.vscodeignore`)

### Version Bumping
- Update `package.json` version
- Rebuild VSIX with new version number
- Tag release in git

## Compliance Reminders

### No Absolute Paths
- Never hardcode local paths (verified by hook)
- Use repo-relative paths in all code
- Extension API provides `extensionUri` for resources

### CSP Requirements
- Allow `blob:` and `data:` for img-src and connect-src
- Required for GLTFLoader texture loading
- Verify with rendered screenshot, not code inspection

### Offline Operation
- No external API calls
- CDN resources cached by browser
- Avatar geometry embedded or bundled

---

**These conventions ensure code quality, maintainability, and compliance with Kiroween requirements.**
