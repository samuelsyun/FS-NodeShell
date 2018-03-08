'use strict'

const fs = require('fs');
const request = require('request');
const async = require('async');

const createFileReadingCommand = generateOutput => {
  return (stdin, fileName, done) => {
    if (stdin) done(null, generateOutput(stdin));
    else {
      fs.readFile(__dirname + '/' + fileName, (err, contents) => {
        if (err) return done(err);

        done(null, generateOutput(contents.toString()));
      });
    }
  };
};

module.exports = {
  pwd: (stdin, file, done) => done(null, process.cwd()),

  date: (stdin, file, done) => done(null, new Date().toString()),

  ls: (stdin, file, done) => {
    fs.readdir(__dirname, (err, files) => {
      if (err) return done(err);

      done(null, files.join('\n'));
    });
  },

  echo: (stdin, value, done) => done(null, stdin ? stdin : value),

  cat: createFileReadingCommand(contents => contents),

  head: createFileReadingCommand(contents => contents.split('\n').slice(0, 5).join('\n')),

  tail: createFileReadingCommand(contents => contents.split('\n').slice(-5).join('\n')),

  sort: createFileReadingCommand(contents => {
    let lines = contents.split('\n');
    let sortedLines = lines.sort((lineA, lineB) => lineA > lineB ? 1 : -1);

    return sortedLines.join('\n');
  }),

  wc: createFileReadingCommand(contents => {
    let lines = contents.split('\n');

    return lines.length.toString();
  }),

  uniq: createFileReadingCommand(contents => {
    let lines = contents.split('\n');
    let uniqueLines = lines.reduce((lines, currentLine) => {
      if (currentLine !== lines[lines.length - 1]) {
        lines = lines.concat([currentLine]);
      }

      return lines;
    }, []);

    return uniqueLines.join('\n');
  }),

  curl: (stdin, url, done) => {
    request.get(stdin ? stdin : url, (err, response) => {
      if (err) return done(err);

      done(null, response.body);
    });
  },

  grep: (stdin, term, done) => {
    if (!stdin) return done(null, '');

    let lines = stdin.split('\n');
    let matchingLines = lines.filter(line => line.indexOf(term) !== -1);

    done(null, matchingLines.join('\n'));
  },

  find: (stdin, path, done) => {
    const readDirRecursive = (dirName, readDone) => {
      fs.readdir(dirName, (err, files) => {
        if (err) return readDone(err);

        async.map(files, (file, done) => {
          let foundFiles = [dirName + '/' + file];

          fs.stat(dirName + '/' + file, (err, stat) => {
            if (err) return readDone(err);

            if (stat.isDirectory()) {
              readDirRecursive(dirName + '/' + file, (err, moreFiles) => {
                if (err) return readDone(err);

                foundFiles = foundFiles.concat(moreFiles);
                done(null, foundFiles);
              });
            } else done(null, foundFiles);
          });
        }, (err, mappedFiles) => {
          if (err) return readDone(err);

          readDone(null, mappedFiles);
        });
      });
    };
  }

};
