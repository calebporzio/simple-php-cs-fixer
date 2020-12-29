const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

let willFixOnSave = undefined;

function PhpCsFixer() {
    //
}

PhpCsFixer.prototype.fix = function (document) {
    if (document.languageId !== 'php') {
        return;
    }

    const process = cp.spawn('php-cs-fixer', this.getArgs(document), {cwd: vscode.workspace.rootPath});

    this.handleProcessOutput(process);
}

PhpCsFixer.prototype.getArgs = function (document) {
    let args = ['fix', document.fileName];

    if (this.useConfigFile) {
        const configFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.path, this.configFile);
        const fallbackConfigPath = path.resolve(__dirname, '.php_cs.dist');

        if (fs.existsSync(configFilePath)) {
            args.push('--config=' + configFilePath);
        } else if (fs.existsSync(fallbackConfigPath)) {
            args.push('--config=' + fallbackConfigPath)
        } else {
            vscode.window.showErrorMessage(`Simple PHP CS Fixer: Can't find config file: [${this.configFile}]`);
        }
    }

    if (!this.usingCache) {
        args.push('--using-cache=no');
    }

    if (this.rules) {
        args.push('--rules=' + this.rules)
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
    this.usingCache = config.get('usingCache');
    this.rules = config.get('rules');

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

    vscode.commands.registerTextEditorCommand

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
