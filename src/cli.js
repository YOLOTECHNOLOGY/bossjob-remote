#!/usr/bin/env node
/* eslint-disable no-fallthrough */
import { spawn } from 'child_process';
import process from 'process';

const args = process.argv.slice(2);
const command = args[0];
let env = args[1] || 'development';
let cmd, script;

switch (command) {
  case 'build':
    cmd = 'node';
    script = './node_modules/bossjob-remote/dist/build.js';
    break;
  case 'dev':
    cmd = 'node';
    script = './node_modules/bossjob-remote/dist/server-dev.js';
    env = null; // dev命令不需要环境变量
    break;
  case 'start':
    cmd = 'node';
    script = './node_modules/bossjob-remote/dist/index.js';
    env = null; // start命令不需要环境变量
    break;
  case '-h':
  case '--help':
    console.log(`
      Usage: bossjob [command] [env]

      Commands:
        build [env]  执行构建 env默认development
        dev          执行启动开发服务器
        start        启动已经构建的包
    `);
    process.exit(0);
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}

const child = spawn(cmd, env ? [script, env] : [script]);

child.stdout.on('data', (data) => {
  console.log(`${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`${data}`);
});

child.on('error', (error) => {
  console.error(`执行的错误: ${error}`);
});