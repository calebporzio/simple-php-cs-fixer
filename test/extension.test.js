const assert = require('node:assert/strict');
const test = require('node:test');

const manifest = require('../package.json');

test('declares the extension entry point and command', () => {
    assert.equal(manifest.main, './extension');
    assert.ok(manifest.contributes.commands.some(command => {
        return command.command === 'simple-php-cs-fixer.fix';
    }));
});
