import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log("🐍 Python Language Server Watchdog activated.");

    const interval = setInterval(async () => {
        try {
            const doc = vscode.window.activeTextEditor?.document;
            if (!doc || doc.languageId !== 'python') {
                console.log("📄 No active Python document – skipping check.");
                return;
            }

            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                doc.uri
            );

            if (!symbols || symbols.length === 0) {
                console.warn("⚠️ No symbols found – Language Server might be frozen.");
                await restartPylance();
            } else {
                console.log("✅ Language Server is responding.");
            }
        } catch (err) {
            console.error("❌ Error during Language Server check:", err);
            await restartPylance();
        }
    }, 2 * 60 * 1000); // every 2 minutes

    context.subscriptions.push({
        dispose() {
            clearInterval(interval);
            console.log("🛑 Watchdog deactivated.");
        }
    });
}

export function deactivate() {
    console.log("🛑 Watchdog deactivated.");
}

async function restartPylance() {
    const config = vscode.workspace.getConfiguration('python.analysis');
    const current = config.get<string>('typeCheckingMode') || 'off';
    const temp = current === 'off' ? 'basic' : 'off';

    console.log(`🔄 Restarting Pylance by toggling 'typeCheckingMode' from '${current}' → '${temp}' → back.`);

    await config.update('typeCheckingMode', temp, vscode.ConfigurationTarget.Global);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await config.update('typeCheckingMode', current, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage("🐍 Python Language Server has been restarted.");
}
