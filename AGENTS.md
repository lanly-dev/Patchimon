# AGENTS.md — Patchimon

Kiroween 2026 entry — **Frankenstein**. Read this file first in every session on this project.

## Status
- Name **Patchimon** — **DECIDED 2026-11-11** (final pick after the cute/plush naming rounds; Patchy / Patchie / Patzie were the other finalists). Collision check run 2026-11-11: no exact-name software product found. **Watch-outs accepted knowingly with the pick:** PatchMon (no *i*) is an active open-source Linux patch-monitoring platform and is near-identical when spoken; the *-mon* suffix evokes Pokémon/Digimon — never use any third-party monster-franchise trademarks, names, or assets in the app, art, or video; the near-identical Japanese term Pachimon means 'fake monsters,' a connotation to keep out of all copy.
- Repo `lanly-dev/patchimon` — **not yet created**. Do not create it, register anything, or request credits until given the go in this project's side chat.
- Deadline: **Fri Dec 4, 2026, 2:00 PM PT**. This is the board's highest-variance entry and the designated cut candidate at the Nov 28 checkpoint — build it so a shippable version exists early.

## What this is
An extension for the Kiro IDE (VS Code-based, so a standard VS Code extension) with a **3D-generated monster avatar** living in a webview panel as a pair-programming companion. The avatar watches the editor and reacts: it flinches when errors appear, celebrates when things go green, idles while you think. Frankenstein stitching: 3D generation pipeline + extension host APIs + a webview 3D scene, three incompatible worlds sewn into one creature.

## Category fit
Frankenstein: stitch a chimera of seemingly incompatible technologies into one unexpectedly powerful app. Name the three stitched parts explicitly in every description and the write-up — judges score the seam-work.

## Hard rules (Kiroween)
- New project, built during the window, core implementation built by **Kiro, spec-first**: spec committed in `/.kiro` before implementation code.
- `/.kiro` at repo root, never gitignored. MIT license at repo top.
- Other agents may plan / prototype / document / generate art assets; Kiro implements the core extension code. Carried-over code gets a one-line Devpost disclosure.
- Kiro credit budget for this entry: **~900** of the shared 4,000, with the board-wide reserve untouched by this entry.
- **No absolute paths (standing rule, 2026-11-07).** Nothing that leaves this machine — code, comments, specs, docs, commit messages, READMEs, screenshots, Devpost text — may contain an absolute local path (no `/home/<user>/...`, no `~/workspace/...`, no `C:\Users\...`). Reference files by repo-relative path only (e.g. `src/extension.ts`, `/.kiro/specs/...`). The local directory layout is private and must never leak into the public repo or the submission.
- **Judges must be able to run it with zero setup**: no API keys, no GPU, no accounts. The preset avatar ships inside the VSIX. Anything requiring external 3D-gen services is an optional extra, never the core path.

## Kiroween 2026 — official compliance requirements (extracted from Devpost, 2026-11-11)

Sources: the hackathon overview, the Official Rules, and the Resources tab at kiroween.devpost.com. If anything in this file conflicts with the Official Rules, the Official Rules win. Rules may be amended during the window — re-verify before submitting.

### Dates (all Pacific Time)
- **Submission Period: Oct 30, 2026, 9:00 AM – Fri Dec 4, 2026, 2:00 PM.** No extensions; late submissions are not accepted.
- **Judging Period: Dec 16, 2026 – Jan 29, 2027.** The project must remain available **free of charge and without any restriction** for judge testing until the Judging Period ends; failure to provide access when requested may result in disqualification.
- Winners announced on or around Feb 3, 2027.

### Eligibility / entry shape
- Teams of at most 3. An individual may make multiple submissions, but each must be **unique and substantially different** from the entrant's others (not reskins or splits) — determined at Sponsor/Devpost discretion.
- One **main category** per submission; bonus prizes may stack on it. A project can win **one Overall OR one Category prize, plus any number of Bonus prizes**.
- All submission materials must be in English, or include an English translation.

### Project requirements (hard)
- A **working software application built using Kiro** (IDE, CLI, Web, and/or Kiro Crew). *"Insufficient use of Kiro will result in disqualification at the Judges' sole discretion."*
- **New projects only** — built during the Submission Period. Frameworks, libraries, and starter templates are allowed; **any other pre-existing code or work incorporated into the project must be disclosed** in the submission.
- **Functionality:** the project must be capable of being successfully installed and run consistently on the platform it is intended for, and must function as depicted in the video and text description.
- Third-party SDKs, APIs, and data may be used only when the entrant is authorized and complies with their terms/licenses.
- The submission must be the entrant's original work, solely owned, and must not violate any third party's IP or other rights.

### Repository requirements (hard)
- **Public GitHub repo** (NOT GitLab or BitBucket) containing **all** source code, assets, and instructions required for the project to be functional.
- An **open-source license file**, detectable and visible at the top of the repo page (About section).
- **`/.kiro` directory at the root of the project**, showing usage of specs, hooks, and steering. **Do NOT add the `/.kiro` directory or sub-folders to `.gitignore`, as this could disqualify the submission.**
- **Skeleton Crew only:** the repo must contain **2 separate repo folders for the 2 separate applications** (applies to the SkeleTeller entry, not this one).

### Submission package (all items required)
- The category selected, plus any bonus prizes being claimed.
- **URL to the working app.** Any login credentials judges need go in the Devpost submission form (private, shown to judges only).
- **Text description** explaining the features and functionality of the project.
- **Demo video:** under **3 minutes** (judges are not required to watch beyond 3), uploaded to **YouTube and public**, showing the project working **on the device it was built for**, with **no third-party trademarks, copyrighted music, or other copyrighted material** unless the entrant has permission.
- **A write-up on how Kiro was used**, covering as applicable: Kiro IDE vs CLI vs Web vs Crew (and how they differed); custom agents; agent hooks (which workflows were automated and how they helped); spec-driven development (how specs were structured, and how it compared to vibe coding); steering docs; MCP; property-based testing; Kiro powers.

### How judging works (compliance → score)
- **Stage 1 is pass/fail:** the project reasonably fits the theme and reasonably applies the required tools.
- Judging **may use expert panels, peer review, and/or automated AI-driven analysis** of submissions — write the repo and `/.kiro` so a machine reader finds the evidence (real specs mapped to features, steering, hooks).
- **Stage 2:** five equally weighted criteria, **10 points each** — Potential Impact / Technological Implementation (how thoroughly, skillfully, and variously Kiro was used) / Design / Innovation / Presentation.

### Bonus prizes (exact requirements)
- **Bonus Blog Prize** — 2,000 Kiro credits, 100 winners, awarded to the **100 highest-scoring** qualifying submissions: a **public blog post about Kiro and the project on a third-party blog platform**, published **during the Submission Period**, that **mentions it is part of the Kiroween 2026 hackathon**; post URL added to the submission form.
- **Social Blitz Prize** — 3-month Kiro Pro+, 5 winners: a post on any social platform **during the Submission Period** that **starts with `#KiroweenHackathon26`**, shares your favorite thing about Kiro and how it changed how you approach development; URL added to the submission form. The Kiro team judges content quality — **original thoughts vs AI writing**, insights/learnings, and asset quality.
- **Best Demo** — $1,000, no extra steps: highest Presentation score among submissions in the **top 10% of overall scores**.
- **Best Student Project** — **NOT eligible for this entrant** (every team member must be a student). Do not claim it.
- **Best Startup / Best Ghost of Kiroween Past / Best Kiro Crew App** — claim only if their specific conditions are genuinely met (startup founder + LinkedIn + startup website / registered for Kiroween 2025 and verified / a separate public Kiro Crew app repo on GitHub).

### Credits
- The 4,000 free Kiro credits are a **one-time grant, one per entrant** (already obtained for these entries; ID verification via Didit was required). Request deadline Dec 1, 2026, 12:00 PM PT; **codes must be redeemed by Dec 4, 2026**; **redeemed credits expire Dec 31, 2026, 11:59 PM PT**.

### Code-level reminders for any agent working in this repo
- Never gitignore `/.kiro`; commit specs, steering, and hooks as the real work happens — they are judging evidence.
- Disclose any pre-existing or incorporated code in the submission text; keep third-party assets licensed and attributed in the repo.
- No unlicensed copyrighted material (music, trademarks, assets) in the shipped app or the demo video.
- The app must install and run on its intended platform exactly as the video and description depict — no vaporware features.
- Keep the project free and unrestricted for judges through Jan 29, 2027.

## Scope v1
- TypeScript VS Code extension; avatar panel as a webview with Three.js rendering a GLB.
- **Exactly 1 preset monster avatar at v1** — **DECIDED 2026-11-11** (cut from 3 to 1 for the first version). The single Patchimon is produced with the existing 3D pipeline as a static asset, segmented into named parts and procedurally animated (the parts+pivots approach — no skinning needed for non-humanoids). Additional monsters are a post-v1 expansion only, after the reaction loop ships.
- **Monster design — DECIDED 2026-11-11: Classic Patch-Plush.** A round plush Frankenstein: body sewn from mismatched fabric patches (mint, lavender, mustard, dusty pink) with visible stitches, one button eye and one round eye, a stitched scar across the forehead, a small metal neck-bolt as an ear, short arms in different colors, big flat feet. Named parts for segmentation: head, 2 arms, 2 feet, belly patch, bolt — the patches' color contrast gives the segmentation visible seams to follow; the design principle is *the seams are the joints*. Animation reads: idle = soft breathing sway + bolt twitch; celebrate = arms up + hop; flinch = squash down, arms cover face. Generation prompt seed: "chibi plush monster, full body, round body sewn from colorful mismatched fabric patches, visible stitches, one button eye and one round eye, stitched scar on forehead, small metal neck bolt, short arms in different colors, big feet, cute, soft toy, standing, clean silhouette".
- Animation set is capped: **idle, celebrate, flinch** — three states, procedural, no clip library.
- Reactions wired to real editor signals: diagnostics appearing/clearing (errors → flinch, all-clear after errors → celebrate), file save (small acknowledgment counts toward idle life, not a fourth state).
- Install for judges = VSIX file + 3-step README (install VSIX in Kiro, open panel, code something broken).

## Non-goals (scope caps)
- On-demand avatar generation from a prompt is a **stretch goal only**, behind the preset core, and only if it needs no key from the judge.
- No marketplace publishing required for the submission (VSIX + repo is the delivery).
- No chat/LLM features in the avatar at v1. It reacts; it does not talk.

## Earned lessons (apply from day one)
- **CSP vs GLB textures:** GLTFLoader fetches embedded textures from `blob:` URLs — a webview CSP of `default-src 'none'` without `img-src`/`connect-src` allowing `blob:`/`data:` silently strips every texture and the model renders grey with no error. Set the CSP correctly at scaffold time and verify with a rendered screenshot, not by reading loader code. (Learned on the 3D Kits viewer, 2026-10.)

## Acceptance checks
- [ ] Fresh Kiro install + VSIX from the repo → avatar panel opens, textured (not grey) avatar visible.
- [ ] Introduce a syntax error in a file → avatar flinches when diagnostics land. Fix it → celebrate on all-clear.
- [ ] The 1 v1 avatar loads, is textured, and animates all three states (idle / celebrate / flinch) in the panel.
- [ ] Extension works with network disabled and no API keys configured.

## Packaging checklist
- [ ] Public repo + MIT license + `/.kiro`; VSIX attached to the repo (release or committed per README instructions) + working "app URL" = the repo/release page with install steps.
- [ ] Demo video < 3 min, public YouTube, filmed inside Kiro: type a bug → flinch; fix it, tests/diagnostics clear → celebrate. The reactions ARE the demo.
- [ ] Devpost description + Kiro-usage write-up, the three stitched technologies named.
- [ ] Blog post (Bonus Blog prize) + one social post starting with `#KiroweenHackathon26`.

## Open decisions
1. ~~Name final?~~ **DECIDED 2026-11-11: Patchimon** (see Status for the accepted watch-outs).
2. ~~Which monster?~~ **DECIDED 2026-11-11: Classic Patch-Plush** (see Scope v1 for the full design spec and generation prompt seed).
3. Which signals beyond diagnostics/save are worth wiring at v1, if any (debug session start/stop is the candidate)?

## How we work
Plan → Work → Assess → Compound. Lessons earned go into this file immediately (the CSP lesson above is the model). Decisions land in Open decisions the same session. Order of work: extension shell + grey-box avatar reacting to diagnostics FIRST (end-to-end slice), real avatar assets second, polish last — never assets before the reaction loop works.
