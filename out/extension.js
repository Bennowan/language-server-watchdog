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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log("🐍 Python Language Server Watchdog activated.");
    const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const doc = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
            if (!doc || doc.languageId !== 'python') {
                console.log("📄 No active Python document – skipping check.");
                return;
            }
            const symbols = yield vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri);
            if (!symbols || symbols.length === 0) {
                console.warn("⚠️ No symbols found – Language Server might be frozen.");
                yield restartPylance();
            }
            else {
                console.log("✅ Language Server is responding.");
            }
        }
        catch (err) {
            console.error("❌ Error during Language Server check:", err);
            yield restartPylance();
        }
    }), 2 * 60 * 1000); // every 2 minutes
    context.subscriptions.push({
        dispose() {
            clearInterval(interval);
            console.log("🛑 Watchdog deactivated.");
        }
    });
}
function deactivate() {
    console.log("🛑 Watchdog deactivated.");
}
function restartPylance() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('python.analysis');
        const current = config.get('typeCheckingMode') || 'off';
        const temp = current === 'off' ? 'basic' : 'off';
        console.log(`🔄 Restarting Pylance by toggling 'typeCheckingMode' from '${current}' → '${temp}' → back.`);
        yield config.update('typeCheckingMode', temp, vscode.ConfigurationTarget.Global);
        yield new Promise(resolve => setTimeout(resolve, 1000));
        yield config.update('typeCheckingMode', current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("🐍 Python Language Server has been restarted.");
    });
}
//# sourceMappingURL=extension.js.map