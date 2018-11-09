#!/usr/bin/env node
const parse = require("parse-git-config");
const getGitUsername = require("git-username");
const {
  findDotGitPath,
  removeDotGit,
  displayUrlsAndOpenPrsInBrowser,
  createUsersJSONFileIfDoesNotExist
} = require("./utils.js");

const init = () => {
  createUsersJSONFileIfDoesNotExist(() => {
    findDotGitPath().then(path => {
      if (!path) {
        console.error(`Cannot find .git file`);
      } else {
        const gitConfig = parse.sync({ path: `${path}/config` });
        const gitRemotes = Object.keys(gitConfig).reduce((remotes, key) => {
          if (key.includes("remote")) {
            const remoteName = key.split(" ")[1].replace(/"/g, "");
            remotes[remoteName] = gitConfig[key];
          }
          return remotes;
        }, {});

        if (gitRemotes.origin && gitRemotes.upstream) {
          const username = process.argv[2] || getGitUsername(path);
          const originUrl = removeDotGit(gitRemotes.origin.url);
          const upstreamUrl = removeDotGit(gitRemotes.upstream.url);
          displayUrlsAndOpenPrsInBrowser({ username, originUrl, upstreamUrl });
        } else {
          console.error(`
            **
            Your use case is not supported yet.
            Remotes "origin" & "upstream" are required.
            **`);
        }
      }
      process.exit(0);
    });
  });
};

init();
