import * as vscode from 'vscode';
import { PatchyViewProvider } from './patchyViewProvider';
import { DiagnosticsMonitor } from './diagnosticsMonitor';

/**
 * Extension activation entry point.
 * Frankenstein seam 1: VS Code Extension Host APIs - Node.js process managing extension lifecycle
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Patchimon extension activating...');

    // Create webview provider (seam bridge to Three.js rendering context)
    const provider = new PatchyViewProvider(context.extensionUri);

    // Register webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            PatchyViewProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // Register command to show avatar panel
    context.subscriptions.push(
        vscode.commands.registerCommand('patchimon.showAvatar', () => {
            // Focus the webview
            vscode.commands.executeCommand('workbench.view.extension.patchimon-sidebar');
        })
    );

    // Initialize diagnostics monitor (watches editor events, controls avatar reactions)
    const diagnosticsMonitor = new DiagnosticsMonitor(provider);
    context.subscriptions.push(diagnosticsMonitor);

    console.log('Patchimon extension activated');
}

export function deactivate() {
    console.log('Patchimon extension deactivated');
}
