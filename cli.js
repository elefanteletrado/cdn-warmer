#!/usr/bin/env node

'use strict';

const Table = require('cli-table');
const Warmer = require('./index.js');
const colors = require('colors');
const dateformat = require('dateformat');
const fs = require('fs');
const program = require('commander');

const DATE_FORMAT = 'yyyy/mm/dd hh:MM:ss'

program
  .version('1.0.0')
  .arguments('<cdnPrefix>')
  .action((cdnPrefix) => {
    let baseDirectory = process.cwd();

    // Set verbosity
    process.env.verbose = !!program.verbose;

    let options = {};

    if (program.chunk) {
      options.chunkSize = program.chunk;
    }

    let warmer = new Warmer(cdnPrefix, baseDirectory, options);

    warmer.warm((error, report) => {
      if (error) {
        console.error(error.red.bold);

        return;
      }

      if (program.report) {
        saveReport(report, (error) => {
          if (error) {
            console.error(error);
          }
        });
      }

      if (process.env.verbose) {
        printReport(report);
      }
    })
  })
  .option('-v, --verbose', 'Set verbosity')
  .option('-c, --chunk [size]', 'Number of files to be downloaded simultaneously')
  .option('-r, --report', 'Save a report in JSON format')
  .parse(process.argv);

const printReport = (report) => {
  let table = new Table({
    style: {
      head: ['cyan'],
      border: ['white']
    }
  });

  table.push({
    'Start': dateformat(report.started, DATE_FORMAT)
  }, {
    'End': dateformat(report.ended, DATE_FORMAT)
  }, {
    'Elapsed time': `${report.elapsedTime}s`
  }, {
    'Files': report.files.length
  }, {
    'Hits': report.hits
  }, {
    'Misses': report.misses
  }, {
    'Errors': report.errors.length
  }, {
    'Hit rate': `${report.hitRate}%`
  }, {
    'Miss rate': `${report.missRate}%`
  }, {
    'Error rate': `${report.errorRate}%`
  });

  console.log(table.toString());
};

const saveReport = (report, callback) => {
  let content = JSON.stringify(report, null, 2);

  fs.writeFile('report.json', content, (error) => {
    if (typeof callback === 'function') {
      callback(error);
    }
  });
};
