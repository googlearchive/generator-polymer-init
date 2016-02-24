'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

describe('generator-polymer-init:app', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        'project-style': 'element',
        'name': 'my-element',
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'index.html',
      'bower.json',
      'my-element.html',
      'demo/index.html',
      'test/my-element_test.html',
    ]);
  });
});
