/*
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const yeoman = require('yeoman-generator');
const chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({

  initializing() {
    // Yeoman replaces dashes with spaces. We want dashes.
    this.appname = this.appname.replace(/\s+/g, '-');
  },

  prompting() {
    var done = this.async();

    var _this = this;

    var prompts = [
      {
        type: 'list',
        name: 'project-style',
        message: `Is this an application or element project?\n` +
          chalk.reset.green(
            `  Element projects place elements at the top level ` +
              `for easy import into other projects.\n` +
              `  Application projects have a src/ directory that contain ` +
              `application-specific elements and other sources, and ` +
              `index.html at the top-level.\n`),
        choices: ['element', 'application'],
      },
      {
        when(answers) {
          return answers['project-style'] === 'application';
        },
        name: 'applicationName',
        type: 'input',
        message: `Application name (${this.appname})`,
        default() {
          return _this.appname;
        }
      },
      {
        type: 'input',
        name: 'name',
        message: (answers) => {
          if (answers['project-style'] === 'application') {
            return `Main element name (${this.appname}-app)`;
          } else if (answers['project-style'] === 'element') {
            let elementName = _this.appname.includes('-')
                ? _this.appname
                : `${_this.appname}-element`;
            return `Element name (${elementName})`;
          } else {
            throw new Error(
              `unknown project-style: ${answers['project-style']}`);
          }
        },
        default: (answers) => {
          if (answers['project-style'] === 'application') {
            return `${_this.appname}-app`;
          } else if (answers['project-style'] === 'element') {
            return _this.appname.includes('-')
                ? _this.appname
                : `${_this.appname}-element`;
          } else {
            throw new Error(
              `unknown project-style: ${answers['project-style']}`);
          }
        },
        validate(name) {
          let nameContainsHyphen = name.includes('-');
          if (!nameContainsHyphen) {
            _this.log('\nUh oh, custom elements must include a hyphen in '
              + 'their name. Please try again.');
          }
          return nameContainsHyphen;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: (answers) => {
          if (answers['project-style'] === 'application') {
            return 'Brief description of application';
          } else if (answers['project-style'] === 'element') {
            return 'Brief description of element';
          } else {
            throw new Error(
              `unknown project-style: ${answers['project-style']}`);
          }
        },
      },
    ];

    this.prompt(prompts, (props) => {
      this.props = props;
      done();
    });
  },

  writing() {
    let projectStyle = this.props['project-style'];
    let elemenentName = this.props.name;
    let isElement = projectStyle === 'element';

    let props = Object.create(this.props);
    // TODO(justinfagnani): package dir is depth dependent, fix:
    props['packageDir'] = isElement ? '../' : '../../';

    let copyAll = (from) => this.fs.copyTpl([
        `${this.templatePath()}/${from}/**/*`,
        `${this.templatePath()}/${from}/**/.*`,
        `!**/_*`,
      ],
      this.destinationPath(),
      props);

    copyAll('common');
    copyAll(projectStyle);

    let elementProps = Object.create(this.props);
    elementProps['packageDir'] = isElement ? '../' : '../../bower_components/';
    this.fs.copyTpl(
      this.templatePath('_element.html'),
      isElement
        ? `${elemenentName}.html`
        : `src/${elemenentName}/${elemenentName}.html`,
      elementProps);
    this.fs.copyTpl(
      this.templatePath('_element_test.html'),
      isElement
        ? `test/${elemenentName}_test.html`
        : `test/${elemenentName}/${elemenentName}_test.html`,
      elementProps);
  },

  install() {
    this.log(chalk.bold('\nProject generated!'));
    this.log('Installing dependencies...');
    this.bowerInstall();
  },

  end() {
    this.log(chalk.bold('\nSetup Complete!'));
    this.log('Check out your new project README for information about what to do next.\n');
  },
});
