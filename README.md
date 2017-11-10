# simple-php-cs-fixer README

None of the other php-cs-fixer extensions worked the way I wanted them to. I basically want something that runs php-cs-fixer exactly as I would from the command line, but with an option for custom config, and running on save.

![Demo Gif](demo.gif)

---

## The Command:
`simple-php-cs-fixer.fix`

---

## Config:

Look for a custom project specific config file?

`"simple-php-cs-fixer.useConfig": true`

The path to that config file. (relative to the project root)

`"simple-php-cs-fixer.config": ".php_cs.dist"`

Run the fixer on save?

`"simple-php-cs-fixer.save": false`

Whether php-cs-fixer should be using a cache

`"simple-php-cs-fixer.usingCache": false`

A comma separated list of rules to be used by php-cs-fixer

`"simple-php-cs-fixer.rules": "@PSR1,@PSR2,trailing_comma_in_multiline_array"`

---

\- Enjoy!
