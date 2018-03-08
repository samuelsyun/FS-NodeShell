'use strict'

const commands = require('./commands');
const chalk = require('chalk');

const prompt = chalk.blue('\nprompt > ');

process.stdout.write(prompt);

process.stdin.on('data', data => {
  let input = data.toString();
  let cmds = input.split('|').map(cmd => cmd.trim());

  const runCmd = prevOutput => {
    let cmdParts = cmds.shift().split(' ');

    commands[cmdParts[0]](prevOutput, cmdParts[1], (err, output) => {
      if (err) return console.error(err);

      if (cmds.length) runCmd(output);
      else {
        process.stdout.write(output);
        process.stdout.write(prompt)
      }
    })
  }

 runCmd();
})
