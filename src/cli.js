#!/usr/bin/env node
import program  from 'commander'
import process from 'process';
program
  .version('1.0.0')
  .command('build', 'build your project')
  .parse(process.argv);


const command = process.argv[2]; // "build:abc"

if (command.startsWith('build:')) {
  const args = command.slice('build:'.length); // "abc"
  console.log(args);
}