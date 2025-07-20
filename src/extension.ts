"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let output;
function activate(context) {
    output = vscode.window.createOutputChannel("Language Server Watchdog");
    output.appendLine("--> Watchdog started.");
    const interval = setInterval(async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            output.appendLine("No active Python document – skipping check.");
            return;
        }
        try {
            const ok = await checkLanguageServerHealth(editor.document.uri);
            if (!ok) {
                output.appendLine("Health check failed – attempting passive restart...");
                await passiveRecovery(editor.document);
            }
            else {
                output.appendLine("Language Server is responsive.");
            }
        }
        catch (err) {
            output.appendLine(`Unexpected error: ${err}`);
        }
    }, 30000); // alle 30 Sekunden
    context.subscriptions.push({
        dispose() {
            clearInterval(interval);
            output.appendLine("Watchdog stopped.");
        }
    });
}
function deactivate() {
    output?.appendLine("Watchdog deactivated.");
    output?.dispose();
}
async function checkLanguageServerHealth(uri) {
    try {
        const result = await withTimeout(vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri), 3000);
        return !!(result && result.length >= 0);
    }
    catch (e) {
        output.appendLine(`⏱ Timeout or error during health check: ${e}`);
        return false;
    }
}
async function passiveRecovery(doc) {
    try {
        const dummyChange = new vscode.WorkspaceEdit();
        const pos = new vscode.Position(0, 0);
        dummyChange.insert(doc.uri, pos, "");
        await vscode.workspace.applyEdit(dummyChange);
        await delay(500);
        output.appendLine("Triggered passive restart via empty insert.");
    }
    catch (err) {
        output.appendLine(`Passive restart failed: ${err}`);
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
        promise.then(result => {
            clearTimeout(timeout);
            resolve(result);
        }, err => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}
