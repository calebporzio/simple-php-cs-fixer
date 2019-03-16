const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

let willFixOnSave = undefined;

let configFileExists = function(path) {
    return fs.existsSync(path);
}

let showError = function(err) {
    vscode.window.showErrorMessage(err);
}

let setStatusMessage = function(err, code) {
    vscode.window.setStatusBarMessage(err, code);
}

function PhpCsFixer() {
   //
}

PhpCsFixer.prototype.shouldFix = function(document) {
   if (document.languageId !== 'php') {
       return false;
   }

   if (this.runOnSave === 'auto') {
       if ( ! this.configFile ) {
           showError(`Simple PHP CS Fixer: 'auto' mode can only be used by specifying a config file.`);
           return false;
       }

       if ( configFileExists(this.getConfigFilePath()) ) {
           return true;
       }

       return false;
   } else if (this.runOnSave === true) {
       return true;
   }

   return false;
}

PhpCsFixer.prototype.getConfigFilePath = function() {
    if (this.configFile) {
        return path.join(vscode.workspace.rootPath, this.configFile);
    }

    return false;
}

PhpCsFixer.prototype.fix = function (document) {
    if ( ! this.shouldFix(document)) {
        return;
    }

    const process = cp.spawn('php-cs-fixer', this.getArgs(document));

    this.handleProcessOutput(process);
}

PhpCsFixer.prototype.getArgs = function (document) {
    let args = ['fix', document.fileName];

    if (this.useConfigFile) {
        const configFilePath = this.getConfigFilePath();

        if (configFileExists(configFilePath)) {
            args.push('--config=' + configFilePath);
        } else {
            showError(`Simple PHP CS Fixer: Can't find config file: [${this.configFile}]`);
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
                setStatusMessage('Simple PHP CS Fixer: Fixed all files!', 2500);
            },
            16: () => {
                showError('Simple PHP CS Fixer: Config error.');
            },
            32: () => {
                showError('Simple PHP CS Fixer: Fixer error.');
            },
            'fallback': () => {
                showError('Simple PHP CS Fixer: Unknown error.');
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
