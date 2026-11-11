import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Webview provider for Patchimon avatar panel.
 * Frankenstein seam 2: Bridge between Extension Host (Node.js) and Webview (browser context)
 * Manages the webview lifecycle and message passing to the Three.js scene.
 */
export class PatchyViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'patchimon.avatarView';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        // Configure webview options
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Set webview HTML content
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Initialize avatar on load
        this.sendMessage({ command: 'init' });
    }

    /**
     * Send animation command to webview.
     * @param state Animation state: 'idle', 'celebrate', or 'flinch'
     */
    public animate(state: 'idle' | 'celebrate' | 'flinch') {
        this.sendMessage({ command: 'animate', state });
    }

    /**
     * Send file save acknowledgment to webview (triggers idle pulse).
     */
    public acknowledgeSave() {
        this.sendMessage({ command: 'save' });
    }

    /**
     * Send message to webview.
     */
    private sendMessage(message: any) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    /**
     * Generate HTML for webview with Three.js scene.
     * Frankenstein seam 3: Webview 3D Scene - Three.js rendering in browser context
     * 
     * CRITICAL: CSP allows blob: and data: for img-src and connect-src
     * (GLTFLoader fetches embedded textures from blob: URLs - learned from 3D Kits viewer)
     */
    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; 
                   script-src 'unsafe-inline' https://cdn.jsdelivr.net; 
                   style-src 'unsafe-inline'; 
                   img-src blob: data:; 
                   connect-src blob: data:;">
    <title>Patchimon Avatar</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: linear-gradient(180deg, #1e1e1e 0%, #2d2d30 100%);
        }
        #avatar-container {
            width: 100vw;
            height: 100vh;
        }
        #status {
            position: absolute;
            top: 10px;
            left: 10px;
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            background: rgba(0, 0, 0, 0.5);
            padding: 5px 10px;
            border-radius: 4px;
            z-index: 100;
        }
    </style>
</head>
<body>
    <div id="status">Patchimon is watching... 👁️</div>
    <div id="avatar-container"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js"></script>
    <script>
        ${this._getAvatarScript()}
    </script>
</body>
</html>`;
    }

    /**
     * Three.js avatar scene and animation controller.
     * Grey-box implementation: segmented colored primitives with procedural animation.
     */
    private _getAvatarScript() {
        return `
        (function() {
            const container = document.getElementById('avatar-container');
            const statusEl = document.getElementById('status');
            
            // Three.js scene setup
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                50,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            );
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true
            });
            
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setClearColor(0x1e1e1e, 1);
            container.appendChild(renderer.domElement);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(2, 3, 4);
            scene.add(directionalLight);
            
            // Camera position
            camera.position.set(0, 1, 4);
            camera.lookAt(0, 1, 0);
            
            // Patch colors (mint, lavender, mustard, dusty pink)
            const colors = {
                mint: 0x98ff98,
                lavender: 0xe6e6fa,
                mustard: 0xffdb58,
                dustyPink: 0xd8a7b1,
                grey: 0x808080
            };
            
            // Avatar construction (grey-box with patch colors)
            const avatarGroup = new THREE.Group();
            
            // Head (main body) - round with patches
            const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
            const headMaterial = new THREE.MeshPhongMaterial({ 
                color: colors.mint,
                flatShading: false
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.2;
            avatarGroup.add(head);
            
            // Belly patch (dusty pink)
            const bellyGeometry = new THREE.CircleGeometry(0.3, 32);
            const bellyMaterial = new THREE.MeshPhongMaterial({ 
                color: colors.dustyPink,
                side: THREE.DoubleSide
            });
            const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
            belly.position.set(0, 1.1, 0.6);
            avatarGroup.add(belly);
            
            // Left arm (lavender)
            const leftArmGroup = new THREE.Group();
            const armGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.5, 16);
            const leftArmMaterial = new THREE.MeshPhongMaterial({ color: colors.lavender });
            const leftArm = new THREE.Mesh(armGeometry, leftArmMaterial);
            leftArm.position.y = -0.25;
            leftArmGroup.add(leftArm);
            leftArmGroup.position.set(-0.5, 1.2, 0);
            avatarGroup.add(leftArmGroup);
            
            // Right arm (mustard)
            const rightArmGroup = new THREE.Group();
            const rightArmMaterial = new THREE.MeshPhongMaterial({ color: colors.mustard });
            const rightArm = new THREE.Mesh(armGeometry, rightArmMaterial);
            rightArm.position.y = -0.25;
            rightArmGroup.add(rightArm);
            rightArmGroup.position.set(0.5, 1.2, 0);
            avatarGroup.add(rightArmGroup);
            
            // Left foot (dusty pink)
            const footGeometry = new THREE.BoxGeometry(0.25, 0.1, 0.35);
            const leftFootMaterial = new THREE.MeshPhongMaterial({ color: colors.dustyPink });
            const leftFoot = new THREE.Mesh(footGeometry, leftFootMaterial);
            leftFoot.position.set(-0.25, 0.5, 0);
            avatarGroup.add(leftFoot);
            
            // Right foot (lavender)
            const rightFootMaterial = new THREE.MeshPhongMaterial({ color: colors.lavender });
            const rightFoot = new THREE.Mesh(footGeometry, rightFootMaterial);
            rightFoot.position.set(0.25, 0.5, 0);
            avatarGroup.add(rightFoot);
            
            // Bolt (grey metallic)
            const boltGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16);
            const boltMaterial = new THREE.MeshPhongMaterial({ 
                color: colors.grey,
                metalness: 0.8,
                roughness: 0.2
            });
            const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
            bolt.rotation.z = Math.PI / 2;
            bolt.position.set(0.6, 1.3, 0);
            avatarGroup.add(bolt);
            
            scene.add(avatarGroup);
            
            // Animation state
            let currentState = 'idle';
            let animationTime = 0;
            let celebrateStartTime = 0;
            let flinchStartTime = 0;
            
            const CELEBRATE_DURATION = 1000; // ms
            const FLINCH_DURATION = 500; // ms
            
            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                animationTime += 0.016; // ~60fps
                
                const now = Date.now();
                
                // Reset transforms
                avatarGroup.rotation.set(0, 0, 0);
                avatarGroup.position.set(0, 0, 0);
                avatarGroup.scale.set(1, 1, 1);
                leftArmGroup.rotation.set(0, 0, 0);
                rightArmGroup.rotation.set(0, 0, 0);
                
                if (currentState === 'celebrate') {
                    const elapsed = now - celebrateStartTime;
                    if (elapsed < CELEBRATE_DURATION) {
                        const progress = elapsed / CELEBRATE_DURATION;
                        const hopHeight = Math.sin(progress * Math.PI * 2) * 0.3;
                        avatarGroup.position.y = Math.max(0, hopHeight);
                        
                        // Arms up
                        const armAngle = Math.sin(progress * Math.PI) * 0.8;
                        leftArmGroup.rotation.z = armAngle;
                        rightArmGroup.rotation.z = -armAngle;
                    } else {
                        currentState = 'idle';
                        statusEl.textContent = 'Patchimon is happy! ✨';
                    }
                } else if (currentState === 'flinch') {
                    const elapsed = now - flinchStartTime;
                    if (elapsed < FLINCH_DURATION) {
                        const progress = elapsed / FLINCH_DURATION;
                        // Squash down
                        const squash = 1 - Math.sin(progress * Math.PI) * 0.3;
                        avatarGroup.scale.y = squash;
                        avatarGroup.position.y = -(1 - squash) * 0.3;
                        
                        // Arms cover face
                        const coverAngle = Math.sin(progress * Math.PI) * 1.2;
                        leftArmGroup.rotation.z = coverAngle;
                        rightArmGroup.rotation.z = -coverAngle;
                    } else {
                        currentState = 'idle';
                        statusEl.textContent = 'Patchimon is watching... 👁️';
                    }
                } else {
                    // Idle: breathing sway
                    const breathe = Math.sin(animationTime) * 0.05;
                    avatarGroup.position.y = breathe;
                    
                    // Bolt twitch occasionally
                    if (Math.sin(animationTime * 0.5) > 0.95) {
                        bolt.rotation.y = Math.sin(animationTime * 10) * 0.2;
                    } else {
                        bolt.rotation.y = 0;
                    }
                }
                
                renderer.render(scene, camera);
            }
            
            animate();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            });
            
            // Message handler from extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'init':
                        console.log('Patchimon avatar initialized');
                        break;
                    case 'animate':
                        const state = message.state;
                        currentState = state;
                        
                        if (state === 'celebrate') {
                            celebrateStartTime = Date.now();
                            statusEl.textContent = 'Patchimon celebrates! 🎉';
                        } else if (state === 'flinch') {
                            flinchStartTime = Date.now();
                            statusEl.textContent = 'Patchimon flinches! 😱';
                        } else if (state === 'idle') {
                            statusEl.textContent = 'Patchimon is watching... 👁️';
                        }
                        break;
                    case 'save':
                        // Small pulse on save (part of idle, not a new state)
                        const currentY = avatarGroup.position.y;
                        avatarGroup.position.y = currentY + 0.1;
                        setTimeout(() => {
                            if (currentState === 'idle') {
                                // Restore if still idle
                            }
                        }, 100);
                        break;
                }
            });
        })();
        `;
    }
}
