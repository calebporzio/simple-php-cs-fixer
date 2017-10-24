const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');

function PhpCsFixer() {
    this.loadConfig();
}

PhpCsFixer.prototype.fix = function (document) {
    if (document.languageId !== 'php') {
        return;
    }

    const process = cp.spawn('php-cs-fixer', this.getArgs(document));

    this.handleProcessOutput(process);
}

PhpCsFixer.prototype.getArgs = function (document) {
    let args = ['fix', document.fileName];

    if (this.useConfigFile) {
        const configFilePath = vscode.workspace.rootPath + '/' + this.configFile;

        if (fs.existsSync(configFilePath)) {
            args.push('--config=' + configFilePath);
        } else {
            vscode.window.showErrorMessage(`Simple PHP CS Fixer: Can't find config file: [${this.configFile}]`);
        }
    }

    return args;
}

PhpCsFixer.prototype.handleProcessOutput = function (process) {
    process.stderr.on('data', buffer => {
        console.log(buffer.toString());
    });

    process.on('close', (code) => {
        let codeHandlers = {
            0: () => {
                vscode.window.setStatusBarMessage('Simple PHP CS Fixer: Fixed all files!', 2500);
            },
            16: () => {
                vscode.window.showErrorMessage('Simple PHP CS Fixer: Config error.');
            },
            32: () => {
                vscode.window.showErrorMessage('Simple PHP CS Fixer: Fixer error.');
            },
            'fallback': () => {
                vscode.window.showErrorMessage('Simple PHP CS Fixer: Unknown error.');
            }
        };

        codeHandlers[code in codeHandlers ? code : 'fallback']();
    });
}

PhpCsFixer.prototype.loadConfig = function () {
    const config = vscode.workspace.getConfiguration('simple-php-cs-fixer');

    this.useConfigFile = config.get('useConfig');
    this.configFile = config.get('config');
    this.runOnSave = config.get('save');
}

function activate(context) {
    const phpCsFixer = new PhpCsFixer;

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        const disposeStatus = vscode.window.showStatusMessage('Simple PHP CS Fixer: Reloading config.');
        phpCsFixer.loadConfig();
        disposeStatus.dispose();
    }));

    if (phpCsFixer.runOnSave) {
        vscode.workspace.onDidSaveTextDocument(document => {
            phpCsFixer.fix(document);
        });
    }

    vscode.commands.registerTextEditorCommand('simple-php-cs-fixer.fix', (textEditor) => {
        phpCsFixer.fix(textEditor.document);
    });
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;