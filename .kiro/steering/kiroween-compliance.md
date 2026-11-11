# Kiroween 2026 Compliance Rules

**Project:** Patchimon  
**Category:** Frankenstein  
**Deadline:** Friday, December 4, 2026, 2:00 PM PT

## Hard Rules (Always Enforced)

### Repository & Licensing
- ✅ `/.kiro` directory at repo root — **NEVER add to .gitignore**
- ✅ MIT license file at repo root
- ✅ Public GitHub repo (not GitLab/BitBucket)
- ✅ All source code, assets, and installation instructions in repo
- ✅ License must be detectable in GitHub's "About" section

### Path References
- ❌ **NO absolute local paths anywhere**
  - Not in code
  - Not in comments
  - Not in specs or docs
  - Not in commit messages
  - Not in README or screenshots
  - Not in Devpost submission text
- ✅ Use repo-relative paths only (e.g., `src/extension.ts`, `/.kiro/specs/...`)
- 🚫 Forbidden patterns: `/home/<user>/...`, `~/workspace/...`, `C:\Users\...`

### Intellectual Property
- ❌ **NO third-party monster-franchise trademarks**
  - No Pokémon names, assets, or references
  - No Digimon names, assets, or references
  - No other monster-franchise IP
- ✅ Original "Patchimon" branding only
- ✅ Disclose any pre-existing or incorporated code in Devpost submission
- ✅ Keep all third-party assets properly licensed and attributed

### Judge Accessibility
- ✅ **Zero setup required for judges**
  - No API keys
  - No GPU requirements
  - No account creation
  - No external services
- ✅ Preset avatar ships inside VSIX
- ✅ Extension works completely offline
- ✅ Network-independent operation

### Kiro Usage Evidence
- ✅ Core implementation built by Kiro
- ✅ Spec committed in `/.kiro` before implementation code
- ✅ Use specs, hooks, and steering (visible in `/.kiro` for judges)
- ✅ Write the repo so automated analysis finds the evidence
- ⚠️ "Insufficient use of Kiro will result in disqualification"

### Credit Budget
- 💰 **~900 Kiro credits allocated for this entry**
- 💰 Shared pool of 4,000 total across all entries
- 💰 Board-wide reserve must remain untouched by this project
- ⚠️ Be economical — no gold-plating

## Submission Requirements

### Required Materials
1. **Category:** Frankenstein
2. **App URL:** GitHub repo with VSIX release/download
3. **Text description:** Features and functionality
4. **Demo video:**
   - Under 3 minutes (judges stop watching at 3:00)
   - Public YouTube upload
   - Show app working on intended device (Kiro IDE)
   - No copyrighted music or third-party trademarks
5. **Kiro usage write-up:** Spec-driven development, hooks, steering, etc.

### Bonus Prizes (Optional)
- **Bonus Blog Prize:** Public blog post on third-party platform mentioning Kiroween 2026
- **Social Blitz Prize:** Social post starting with `#KiroweenHackathon26`

### Video Content Must Show
- Extension installed in Kiro
- Avatar panel opening
- Typing a syntax error → avatar flinches
- Fixing the error → diagnostics clear → avatar celebrates
- The reactions ARE the demo

## Judging Criteria

### Stage 1: Compliance (Pass/Fail)
- Project fits the Frankenstein theme (three incompatible technologies stitched together)
- Required tools applied reasonably

### Stage 2: Scoring (10 points each)
1. **Potential Impact** — usefulness, audience, scalability
2. **Technological Implementation** — how thoroughly/skillfully Kiro was used
3. **Design** — UX, visual design, polish
4. **Innovation** — originality, creativity
5. **Presentation** — clarity of video, description, write-up

### Frankenstein-Specific
- **Name the three stitched parts explicitly** in every description
  - 3D generation pipeline
  - VS Code extension host APIs
  - Webview 3D scene (Three.js)
- Judges score the seam-work

## Project Availability
- ✅ Must remain **free and unrestricted** until January 29, 2027
- ✅ Provide access when judges request during Judging Period (Dec 16 - Jan 29)
- ❌ Failure to provide access may result in disqualification

## Technical Constraints

### CSP Requirement (Critical)
- ⚠️ **GLTFLoader fetches embedded textures from `blob:` URLs**
- ✅ Webview CSP must allow `blob:` and `data:` for img-src and connect-src
- ❌ Without this, models render grey with no error (learned lesson from 3D Kits viewer)
- ✅ Set CSP correctly at scaffold time
- ✅ Verify with rendered screenshot, not just code reading

### Extension Requirements
- ✅ Standard TypeScript VS Code extension
- ✅ Compatible with Kiro IDE (VS Code-based)
- ✅ Packages as VSIX for installation
- ✅ 3-step installation: install VSIX → open panel → code something broken

## Disqualification Risks

❌ These will disqualify the submission:
- Gitignoring `/.kiro` directory
- Insufficient use of Kiro (judge discretion)
- Absolute local paths in public materials
- Project not functional as depicted in video
- Using unlicensed third-party IP
- Late submission (after Dec 4, 2026, 2:00 PM PT)
- Not providing judge access during Judging Period
- Not being a new project built during Submission Period

## Development Workflow

### Order of Work (From AGENTS.md)
1. ✅ Extension shell + grey-box avatar reacting to diagnostics FIRST
2. ✅ Real avatar assets SECOND (after reaction loop works)
3. ✅ Polish LAST
4. ❌ **Never start assets before the reaction loop works**

### Plan → Work → Assess → Compound
- Lessons learned update AGENTS.md immediately
- Decisions recorded in "Open decisions" section same session
- Build so a shippable version exists early (Nov 28 checkpoint)

## This Entry's Specific Decisions

- **Name:** Patchimon (final, decided 2026-11-11)
- **Monster:** Classic Patch-Plush, 1 preset avatar only at v1
- **Scope:** Extension shell + grey-box reactive avatar first
- **Non-goals:** Marketplace publishing, chat/LLM features, multiple monsters at v1

---

**Compliance Checkpoint:** Before any commit, verify no absolute paths leak into the public repo.
