'use strict'

const chalk = require('chalk');

const prompt = chalk.blue('\nprompt > ');

process.stdout.write(prompt);

process.stdin.on('data', function(data) {
  let cmd = data.toString().trim();

  process.stdout.write(`You typed: ${cmd}`);
  process.stdout.write(prompt);

})
