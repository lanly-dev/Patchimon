# Patchimon Development Workflow

**Automation & Best Practices**

## Session Start

When starting a new Kiro session on this project:

1. **SessionStart hook loads context** — AGENTS.md + compliance rules
2. **Review current phase** — Check `.kiro/specs/patchimon-v1.md` for task status
3. **Check open decisions** — AGENTS.md "Open decisions" section
4. **Review recent changes** — `git log --oneline -5`

## File Save Automation

### TypeScript Files (`.ts`)
**Hooks triggered:**
1. **Auto-compile** — `npm run compile` runs automatically
2. **Spec sync check** — Agent reminds to update spec tasks
3. **Absolute path verification** — Blocks save if forbidden paths found

**Manual actions after save:**
- Review compilation output for errors
- Test changed functionality
- Update corresponding spec task status if feature complete

### Configuration Files
**package.json:**
- Hook reminds to run `npm install` if dependencies changed
- Hook reminds to rebuild VSIX: `npm run package`

**Other configs:**
- Absolute path verification runs on `.json` and `.md` files
- Manually verify changes don't break build

## Development Cycle

### Spec-First Approach (Kiroween Requirement)

1. **Before implementing:**
   - Update `.kiro/specs/patchimon-v1.md` with requirements/design
   - Structured format at `.kiro/specs/patchimon-structured.json` tracks task status
   - Commit spec changes
   - Verify tasks are defined

2. **During implementation:**
   - Code follows spec design
   - Hooks auto-compile on save
   - Console shows immediate feedback
   - Update task status in interactive spec

3. **After implementation:**
   - Mark spec tasks complete (status: "completed")
   - Record actual credits used
   - Test acceptance criteria
   - Document lessons in AGENTS.md

### Iteration Pattern

```
Spec → Code → Compile (auto) → Test → Update Spec → Commit
```

**Hooks automate:** Compile step  
**Developer does:** Spec updates, testing, commits

## Testing Workflow

### Local Testing (Development Host)
```bash
# In VS Code/Kiro
F5 or "Run Extension" → Opens Extension Development Host
# Test in that window
```

### VSIX Testing (Judge Simulation)
```bash
npm run package
# Install patchimon-x.x.x.vsix in clean Kiro instance
# Verify acceptance checks
```

### Acceptance Checks (from AGENTS.md)
- [ ] Fresh install → panel opens
- [ ] Avatar colored (not grey)
- [ ] Syntax error → flinch
- [ ] Fix error → celebrate
- [ ] Works offline
- [ ] No API keys needed

## Build Process

### Automated by Hooks
- TypeScript compilation on `.ts` save
- Immediate error feedback in terminal

### Manual Steps
1. **Version bump** (when ready for release):
   ```bash
   # Edit package.json version
   npm run package
   ```

2. **VSIX creation:**
   ```bash
   npm run package
   # Generates: patchimon-x.x.x.vsix
   ```

3. **Installation test:**
   - Install VSIX in clean Kiro
   - Run through all acceptance checks
   - Take screenshot for documentation

## Commit Strategy

### What to Commit
- **Spec first:** `.kiro/specs/*.md` before implementation
- **Implementation:** `src/*.ts` after spec committed
- **Hooks:** `.kiro/hooks/*.json` when workflow automation added
- **Steering:** `.kiro/steering/*.md` when patterns documented
- **Build artifacts:** `.gitignore` excludes `node_modules`, `dist`, but VSIX can be committed for judge access

### Commit Messages
```
Spec: Add avatar animation requirements
Impl: Create procedural animation system for grey-box avatar
Hook: Add auto-compile on TypeScript save
Docs: Update README with installation instructions
```

**Format:** `<Type>: <Description>`  
**Types:** Spec, Impl, Hook, Steering, Docs, Fix, Test

### Never Commit
- Absolute local paths (hook blocks this)
- `node_modules/`
- Compiled output (`dist/`) — regenerated on build
- Personal IDE settings (`.vscode/` gitignored)

## Debugging

### Extension Host Debugging
- **Console:** Check Extension Host output in Kiro
- **Breakpoints:** Set in `.ts` files, F5 to debug
- **Logs:** `console.log()` in extension code

### Webview Debugging
- **Developer Tools:** Right-click webview → Inspect
- **Console:** Three.js errors appear here
- **Network:** Verify CSP not blocking resources

### Common Issues

**Avatar renders grey:**
- CSP misconfigured (check blob:/data: allowed)
- Texture loading blocked
- Material setup incorrect

**Diagnostics not triggering:**
- Event subscription not added to disposables
- State tracking logic error
- Error severity filter wrong

**Hook not running:**
- Matcher regex incorrect
- Hook file syntax error (validate JSON)
- Requires session restart to activate

## Pre-Submission Checklist

### Code Quality
- [ ] All hooks functional and documented
- [ ] No absolute paths (verification hook ensures this)
- [ ] Spec tasks map to implementation
- [ ] Comments explain Frankenstein seams

### Testing
- [ ] All acceptance checks pass
- [ ] Screenshot shows colored avatar
- [ ] Offline test passed
- [ ] Clean VSIX install works

### Documentation
- [ ] README has 3-step installation
- [ ] Three Frankenstein technologies named
- [ ] "Built with Kiro" section complete
- [ ] Devpost write-up drafted

### Repository
- [ ] `.kiro/` visible (not gitignored)
- [ ] MIT LICENSE at root
- [ ] No absolute paths anywhere
- [ ] VSIX available for download

## Kiro Usage Evidence (For Judges)

### What Judges See in `.kiro/`

**Specs:**
- Requirements → Design → Tasks structure
- 29 tasks mapped to implementation
- Acceptance criteria defined

**Hooks (5 total):**
1. Absolute path verification (PostFileSave)
2. Auto-compile TypeScript (PostFileSave)
3. Package.json reminder (PostFileSave)
4. Project context loader (SessionStart)
5. Spec sync reminder (PostFileSave)

**Steering (3 files):**
1. Kiroween compliance rules (always included)
2. TypeScript conventions (always included)
3. Development workflow (always included — this file)

### Narrative for Devpost Write-Up

**How Kiro was used:**

1. **Spec-driven development:**
   - Full requirements/design/tasks spec created first
   - Implementation followed spec design
   - Tasks traced to features for judge validation

2. **Agent hooks:**
   - 5 hooks automating development workflow
   - Auto-compilation catches errors immediately
   - Path verification enforces compliance
   - Context loading ensures consistent sessions

3. **Steering files:**
   - Coding standards always-included in context
   - Compliance rules guide every decision
   - Workflow automation documented

4. **Kiro IDE:**
   - Primary development environment
   - TypeScript extension development
   - Integrated debugging and testing

**Compared to vibe coding:** Spec-first approach caught design issues early, hooks automated repetitive tasks, steering files maintained consistency across sessions.

---

**This workflow demonstrates thorough, skillful, and varied use of Kiro for judge evaluation.**
