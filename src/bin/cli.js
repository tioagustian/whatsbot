#!/usr/bin/env node

const { Command, Option } = require('commander');
const requireContext = require('require-context');

cli = new Command();
cli.description("Whatsapp Bot CLI");
cli.name("whatsbot");
cli.usage("<command>");
cli.addHelpCommand(true);
cli.helpOption(true);

const commands = requireContext("../../src/commands", false, /\.js$/);
commands.keys().forEach((key, value) => {
  const cmdList = commands(key).commands
  cmdList.forEach((cmd) => {
    let args = [];
    const exp = cli.command(cmd.name)
      .description(cmd.description);
    if (cmd.arguments) {
      cmd.arguments.forEach((arg) => {
        exp.argument(arg.name, arg.description);
        args.push(arg.name);
      });
    }
    if (cmd.options) {
      cmd.options.forEach((opt) => {
        
        if (opt.choices) {
          exp.addOption(new Option(opt.name, opt.description).default(opt.default).choices(opt.choices));
        } else {
          exp.addOption(new Option(opt.name, opt.description).default(opt.default));
        }
      });
    }

    exp.action(cmd.action);
  });
});
cli.parse(process.argv);