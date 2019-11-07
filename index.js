#!/usr/bin/env node
// 处理用户输入的命令
const program = require('commander');
// node 文件模块
const fs = require('fs');
// 显示提示图标
const symbols = require('log-symbols');
// 字体加颜色
const chalk = require('chalk');
// 问题交互
const inquirer = require('inquirer');
// 动画效果
const ora = require('ora');
// 下载模板
const download = require('download-git-repo');
// 填充信息至文件
const handlebars = require('handlebars');
// 命令行操作
var shell = require("shelljs");

program.version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt([
        {
          name: 'description',
          message: 'Input the object description'
        },
        {
          name: 'author',
          message: 'Input the object author'
        }
      ]).then(answer => {
        const spinner = ora('Downloading...');
        spinner.start();
        download('forijk/handlebars', name, err => {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
          } else {
            spinner.succeed();
            const fileName = `${name}/package.json`;
            const meta = {
              name,
              description: answer.description,
              author: answer.author
            };
            if (fs.existsSync(fileName)) {
              const content = fs.readFileSync(fileName).toString();
              const result = handlebars.compile(content)(meta);
              fs.writeFileSync(fileName, result);
            }
            console.log(symbols.success, chalk.green('The vue object has downloaded successfully!'));
            inquirer.prompt([
              {
                type: 'confirm',
                name: 'ifInstall',
                message: 'Are you want to install dependence now?',
                default: true
              }
            ]).then(answer => {
              if (answer.ifInstall) {
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'installWay',
                    message: 'Choose the tool to install',
                    choices: [
                      'npm', 'cnpm'
                    ]
                  }
                ]).then(ans => {
                  if (ans.installWay === 'npm') {
                    let spinner = ora('Installing...');
                    spinner.start();
                    // 命令行操作安装依赖
                    shell.exec("cd " + name + " && npm i", function (err, stdout, stderr) {
                      if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                      }
                      else {
                        spinner.succeed();
                        console.log(symbols.success, chalk.green('The object has installed dependence successfully!'));
                        process.exit(0);
                      }
                    });
                  } else {
                    let spinner = ora('Installing...');
                    spinner.start();
                    shell.exec("cd " + name + " && cnpm i", function (err, stdout, stderr) {
                      if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                      }
                      else {
                        spinner.succeed();
                        console.log(symbols.success, chalk.green('The object has installed dependence successfully!'));
                      }
                    })
                  }
                })
              } else {
                console.log(symbols.success, chalk.green('You should install the dependence by yourself!'));
                process.exit(0);
              }
            })
          }
        })
      })
    } else {
      console.log(symbols.error, chalk.red('The object has exist.'));
      process.exit(1);
    }
  });
  program.parse(process.argv);
