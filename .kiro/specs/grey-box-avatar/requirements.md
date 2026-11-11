# Requirements Document

## Introduction

Patchimon is a VS Code extension for the Kiro IDE that provides a reactive 3D monster avatar companion for pair programming. The extension stitches together three incompatible technologies (3D generation pipeline + VS Code Extension Host APIs + Webview 3D Scene with Three.js) into a Frankenstein-style application. The avatar watches the editor and reacts to coding events by flinching when errors appear and celebrating when errors are cleared.

## Glossary

- **Extension**: The Patchimon VS Code extension
- **Avatar**: The 3D monster character displayed in the webview panel
- **Webview**: The VS Code webview panel that displays the avatar
- **Diagnostics**: VS Code API diagnostics representing code errors and warnings
- **Animation_Controller**: The Three.js-based system that manages avatar animations
- **Classic_Patch_Plush**: The specific monster design with segmented patches and visible stitches
- **Extension_Host**: The Node.js process running the VS Code extension
- **Three_Scene**: The Three.js WebGL rendering context in the webview
- **VSIX**: Visual Studio Code extension package format

## Requirements

### Requirement 1: Extension Activation and Command Registration

**User Story:** As a developer, I want to activate the Patchimon extension with a command, so that I can see my coding companion when I need it.

#### Acceptance Criteria

1. WHEN the user executes the "Patchimon: Show Avatar" command, THE Extension SHALL activate and display the webview panel
2. THE Extension SHALL register the activation command during extension initialization
3. THE Extension SHALL activate without requiring API keys, GPU hardware, or external accounts
4. THE Extension SHALL activate successfully on a fresh Kiro IDE installation

### Requirement 2: Webview Panel Management

**User Story:** As a developer, I want the avatar panel to integrate smoothly with my IDE, so that it doesn't disrupt my workflow.

#### Acceptance Criteria

1. WHEN the Extension activates, THE Extension SHALL create a webview panel in the sidebar
2. THE Webview SHALL retain its context when hidden to preserve state
3. THE Webview SHALL load and display content within 2 seconds of activation
4. THE Webview SHALL apply a Content Security Policy that allows blob: and data: for img-src and connect-src

### Requirement 3: Avatar Geometry and Rendering

**User Story:** As a developer, I want to see a cute patch-plush monster avatar, so that my coding companion has visual appeal.

#### Acceptance Criteria

1. THE Three_Scene SHALL render the Classic_Patch_Plush avatar with 7 distinct body parts: head, left arm, right arm, left foot, right foot, belly patch, and bolt
2. THE Avatar SHALL display mismatched patch colors: mint, lavender, mustard, and dusty pink
3. THE Three_Scene SHALL render the Avatar with visible colors within 2 seconds of webview load
4. THE Avatar SHALL use segmented body parts where visible seams serve as animation pivot points

### Requirement 4: Animation State Machine

**User Story:** As a developer, I want the avatar to show different animations, so that it feels alive and responsive.

#### Acceptance Criteria

1. THE Animation_Controller SHALL support three animation states: idle, celebrate, and flinch
2. WHILE in idle state, THE Animation_Controller SHALL apply a breathing sway motion to the Avatar body
3. WHILE in idle state, THE Animation_Controller SHALL apply an occasional twitch motion to the bolt
4. WHEN transitioning to celebrate state, THE Animation_Controller SHALL rotate the Avatar arms upward and translate the body upward in a hop motion
5. WHEN transitioning to flinch state, THE Animation_Controller SHALL scale the Avatar body downward and move the arms to cover the face
6. THE Animation_Controller SHALL complete animation transitions within 200 milliseconds of receiving a state change command

### Requirement 5: Diagnostic Event Monitoring

**User Story:** As a developer, I want the avatar to react when errors appear in my code, so that I get immediate visual feedback.

#### Acceptance Criteria

1. THE Extension SHALL subscribe to the VS Code diagnostics API change events
2. WHEN error-level diagnostics appear in any open document, THE Extension SHALL detect the error state transition
3. WHEN error-level diagnostics are cleared from all open documents after errors existed, THE Extension SHALL detect the error-cleared transition
4. THE Extension SHALL track the previous error state to distinguish new errors from existing errors

### Requirement 6: Flinch Reaction

**User Story:** As a developer, I want the avatar to flinch when I introduce errors, so that I know something went wrong.

#### Acceptance Criteria

1. WHEN error-level diagnostics appear AND no errors existed previously, THE Extension SHALL send a flinch animation command to the Webview
2. THE Webview SHALL receive the flinch command and trigger the flinch animation within 200 milliseconds

### Requirement 7: Celebration Reaction

**User Story:** As a developer, I want the avatar to celebrate when I fix all errors, so that I get positive reinforcement.

#### Acceptance Criteria

1. WHEN all error-level diagnostics are cleared AND errors existed previously, THE Extension SHALL send a celebrate animation command to the Webview
2. THE Webview SHALL receive the celebrate command and trigger the celebrate animation within 200 milliseconds

### Requirement 8: File Save Acknowledgment

**User Story:** As a developer, I want the avatar to acknowledge when I save files, so that it feels responsive to my actions.

#### Acceptance Criteria

1. WHEN the user saves a text document, THE Extension SHALL detect the save event
2. WHEN a save event is detected, THE Extension SHALL send an idle acknowledgment to the Animation_Controller
3. THE Animation_Controller SHALL display a subtle acknowledgment motion without leaving idle state

### Requirement 9: Message Protocol

**User Story:** As a developer, I want reliable communication between the extension and webview, so that avatar reactions work consistently.

#### Acceptance Criteria

1. THE Extension SHALL serialize animation commands as JSON messages with command and state fields
2. THE Webview SHALL deserialize incoming JSON messages and route them to the Animation_Controller
3. THE Extension SHALL send messages with command values: "animate" for state changes and "init" for initialization
4. WHEN sending animate commands, THE Extension SHALL include a state field with values: "idle", "celebrate", or "flinch"

### Requirement 10: Three.js Scene Setup

**User Story:** As a developer, I want the 3D scene to render correctly, so that the avatar is visible and properly lit.

#### Acceptance Criteria

1. THE Three_Scene SHALL initialize with a perspective camera positioned to frame the Avatar
2. THE Three_Scene SHALL include ambient lighting for overall illumination
3. THE Three_Scene SHALL include directional lighting for depth and shadows
4. THE Three_Scene SHALL use a WebGL renderer with proper canvas sizing
5. WHEN the webview is resized, THE Three_Scene SHALL update the camera aspect ratio and renderer size

### Requirement 11: Procedural Animation Implementation

**User Story:** As a developer, I want smooth procedural animations, so that the avatar movement looks natural.

#### Acceptance Criteria

1. THE Animation_Controller SHALL use requestAnimationFrame for the animation loop
2. THE Animation_Controller SHALL apply sinusoidal transforms for breathing motion during idle state
3. THE Animation_Controller SHALL use time-based animation with Date.now() for duration tracking
4. THE Animation_Controller SHALL animate segmented parts using pivot-based transformations without skeletal rigging

### Requirement 12: Offline Operation

**User Story:** As a developer, I want the extension to work without internet, so that I can code anywhere.

#### Acceptance Criteria

1. THE Extension SHALL operate without network connectivity
2. THE Webview SHALL load Three.js from a CDN with browser caching enabled for offline capability
3. THE Avatar SHALL render from embedded geometry without external asset requests
4. THE Extension SHALL not require authentication or external service calls

### Requirement 13: VSIX Packaging

**User Story:** As a hackathon judge, I want to install the extension from a VSIX file, so that I can test it easily.

#### Acceptance Criteria

1. THE Extension SHALL package as a VSIX file using standard VS Code extension packaging
2. THE VSIX SHALL include all source code, compiled JavaScript, and assets required for operation
3. THE VSIX SHALL exclude development-only files such as TypeScript source and node_modules binaries
4. WHEN installed from VSIX, THE Extension SHALL activate and function without additional setup steps

### Requirement 14: Installation Documentation

**User Story:** As a hackathon judge, I want clear installation instructions, so that I can quickly get the extension running.

#### Acceptance Criteria

1. THE Extension repository SHALL include a README file at the root
2. THE README SHALL document a 3-step installation process: install VSIX, open panel, code something broken
3. THE README SHALL use only repo-relative paths in all file references
4. THE README SHALL explicitly name the three stitched Frankenstein technologies

### Requirement 15: Repository Compliance

**User Story:** As a hackathon judge, I want to see the spec and development process, so that I can evaluate Kiro usage.

#### Acceptance Criteria

1. THE Extension repository SHALL contain a .kiro directory at the root
2. THE .kiro directory SHALL not be listed in .gitignore
3. THE Extension repository SHALL include an MIT LICENSE file at the root
4. THE Extension repository SHALL not contain absolute local file paths in any committed files
5. THE Extension repository SHALL use repo-relative paths for all file references

### Requirement 16: Performance Optimization

**User Story:** As a developer, I want the avatar to run smoothly, so that it doesn't slow down my IDE.

#### Acceptance Criteria

1. THE Animation_Controller SHALL minimize CPU usage during idle animation
2. THE Three_Scene SHALL reuse geometry instances rather than creating duplicates
3. THE Three_Scene SHALL use simple primitive shapes to minimize draw calls
4. THE Extension SHALL complete all animation transitions within 200 milliseconds

### Requirement 17: Error Handling

**User Story:** As a developer, I want the extension to handle errors gracefully, so that it doesn't crash my IDE.

#### Acceptance Criteria

1. WHEN the Extension encounters an error during activation, THE Extension SHALL log the error to the console
2. WHEN the Extension encounters an error during activation, THE Extension SHALL display an error message to the user
3. WHEN the Webview encounters a rendering error, THE Three_Scene SHALL log the error to the webview console
4. IF the Animation_Controller receives an invalid state command, THEN THE Animation_Controller SHALL ignore the command and remain in the current state

### Requirement 18: Trademark Compliance

**User Story:** As a hackathon organizer, I want the extension to respect intellectual property, so that it complies with contest rules.

#### Acceptance Criteria

1. THE Extension SHALL not use Pokémon names, assets, or trademarks
2. THE Extension SHALL not use Digimon names, assets, or trademarks
3. THE Extension SHALL not use any third-party monster-franchise intellectual property
4. THE Extension SHALL use only the original "Patchimon" branding

### Requirement 19: Credit Budget Management

**User Story:** As a hackathon entrant, I want to stay within the credit budget, so that I don't overspend on this entry.

#### Acceptance Criteria

1. THE Extension development SHALL remain within approximately 900 Kiro credits
2. THE Extension SHALL avoid gold-plating or unnecessary features to conserve credits
3. THE Extension development SHALL prioritize core functionality over polish

### Requirement 20: Three.js CDN Integration

**User Story:** As a developer, I want Three.js loaded reliably, so that the 3D scene works consistently.

#### Acceptance Criteria

1. THE Webview SHALL load Three.js from the jsdelivr CDN
2. THE Webview SHALL specify a fixed Three.js version for consistency
3. THE Webview SHALL allow the browser to cache the Three.js library for offline access
4. THE Webview Content Security Policy SHALL allow script loading from cdn.jsdelivr.net
