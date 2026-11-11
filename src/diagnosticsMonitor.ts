import * as vscode from 'vscode';
import { PatchyViewProvider } from './patchyViewProvider';

/**
 * Monitors editor diagnostics and file events to trigger avatar reactions.
 * Frankenstein seam bridge: translates VS Code editor events into avatar animation commands.
 */
export class DiagnosticsMonitor implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];
    private hasErrors: boolean = false;

    constructor(private readonly provider: PatchyViewProvider) {
        // Listen to diagnostics changes
        this.disposables.push(
            vscode.languages.onDidChangeDiagnostics(this.onDiagnosticsChanged.bind(this))
        );

        // Listen to file save events
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(this.onFileSaved.bind(this))
        );

        console.log('DiagnosticsMonitor initialized');
    }

    /**
     * Handle diagnostics change events.
     * Triggers flinch on error appearance, celebrate on error clearing.
     */
    private onDiagnosticsChanged(event: vscode.DiagnosticChangeEvent) {
        // Count errors across all changed URIs
        let errorCount = 0;
        
        for (const uri of event.uris) {
            const diagnostics = vscode.languages.getDiagnostics(uri);
            const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
            errorCount += errors.length;
        }

        const hasErrorsNow = errorCount > 0;

        // State transition logic
        if (hasErrorsNow && !this.hasErrors) {
            // Errors appeared: flinch
            console.log('Errors detected, triggering flinch');
            this.provider.animate('flinch');
        } else if (!hasErrorsNow && this.hasErrors) {
            // Errors cleared after having errors: celebrate
            console.log('Errors cleared, triggering celebrate');
            this.provider.animate('celebrate');
        }

        this.hasErrors = hasErrorsNow;
    }

    /**
     * Handle file save events.
     * Sends acknowledgment to avatar (small motion within idle).
     */
    private onFileSaved(document: vscode.TextDocument) {
        console.log('File saved, acknowledging');
        this.provider.acknowledgeSave();
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
