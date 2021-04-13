# Simple PHP CS Fixer README

A simple extension for using php-cs-fixer in VS Code.

If no .php_cs.dist file (or other configuration) is found, it will use the default configuration for the Laravel project: https://gist.github.com/laravel-shift/cab527923ed2a109dda047b97d53c200

Now includes support for docker container-based php-cs-fixer!

![Demo Gif](demo.gif)

---

## The Command:
`simple-php-cs-fixer.fix`

---

## Config:

- **executablePath** - The path to your php-cs-fixer (make sure you've installed with composer)

  `"simple-php-cs-fixer.executablePath": "php-cs-fixer"`

- **useConfig** - Look for a custom project specific config file?

  `"simple-php-cs-fixer.useConfig": true`

- **config** - The path to that config file. (relative to the project root)

  `"simple-php-cs-fixer.config": ".php_cs.dist"`

- **save** - Run the fixer on save?

  `"simple-php-cs-fixer.save": false`

- **usingCache** - Whether php-cs-fixer should be using a cache

  `"simple-php-cs-fixer.usingCache": false`

- **rules** - A comma separated list of rules to be used by php-cs-fixer

  `"simple-php-cs-fixer.rules": "@PSR1,@PSR2,trailing_comma_in_multiline_array"`

---

## Config for Docker

If running PHP/php-cs-fixer in a docker container, you can use these configuration options.


- **hostPath** - The absolute path to your project on your host machine. Eg. "/Users/you/code/project". Filling this out will help replace it with your dockerPath.

  `"simple-php-cs-fixer.hostPath": "/path-to-your-project-in-host-machine"`

- **dockerPath** - The absolute path to your project on your docker container. Eg. "/var/www/project". This will help with replacing your hostPath with this dockerPath so that your paths are relative to your docker's php-cs-fixer.

  `"simple-php-cs-fixer.dockerPath": "/path-to-your-project-in-docker-container"`

- **executablePath** - Use the executablePath to point to docker exec wrapped in script. Eg. "/Users/you/code/project/docker-php-cs-fixer"

  `"simple-php-cs-fixer.executablePath": "/path-to-script-on-host-machine"`

  For example, you could create a script in your project called `docker-php-cs-fixer` with following contents:

  ```
  #!/bin/bash

  docker exec -t "yourcontainer" /var/www/your-project/vendor/bin/php-cs-fixer $@
  ```

  Note: `chmod +x yourscript` to make executable.
  
---

\- Enjoy!
