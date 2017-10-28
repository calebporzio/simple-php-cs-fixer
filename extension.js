const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');

let willFixOnSave = undefined;

function PhpCsFixer() {
    //
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

    if (this.runOnSave && ! willFixOnSave) {
        willFixOnSave = vscode.workspace.onDidSaveTextDocument(document => {
            this.fix(document);
        });
    } else if (!this.runOnSave && willFixOnSave) {
        willFixOnSave.dispose();
        willFixOnSave = undefined;
    }
}

function activate(context) {
    const phpCsFixer = new PhpCsFixer;

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        phpCsFixer.loadConfig();
    }));

    phpCsFixer.loadConfig();

    vscode.commands.registerTextEditorCommand('simple-php-cs-fixer.fix', (textEditor) => {
        phpCsFixer.fix(textEditor.document);
    });
}
exports.activate = activate;

function deactivate() {
    if (willFixOnSave) {
        willFixOnSave.dispose();
        willFixOnSave = undefined;
    }
}
exports.deactivate = deactivate;