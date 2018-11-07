#!/usr/bin/env node
const opn = require("opn");
const fs = require("fs");
const findUp = require("find-up");

const parseURL = rawString => {
  const urlWithDotGit = rawString.split("=")[1].trim();
  return urlWithDotGit.substring(0, urlWithDotGit.length - 4);
};

const parseUsername = rawUsername => {
  const dotComIndex = rawUsername.indexOf(".com");
  rawUsername = rawUsername.slice(dotComIndex + 5);
  const indexOfSlash = rawUsername.indexOf("/");
  return rawUsername.slice(0, indexOfSlash);
};

const getUsersPrUrlForRepo = (url, username) =>
  `${url}/pulls?utf8=%E2%9C%93&q=+is%3Apr+author%3A${username}+`;

const findDotGitPath = () => findUp(".git");

const execute = () => {
  findDotGitPath().then(path => {
    if (!path) {
      console.error(`Cannot find .git file`);
    } else {
      fs.readFile(`${path}/config`, "utf-8", function(err, data) {
        const lines = data.split("\n");

        const indexOfUpstreamUrl =
          lines.findIndex(string => string.includes("upstream")) + 1;
        const url = parseURL(lines[indexOfUpstreamUrl]);

        const indexOfOriginUrl =
          lines.findIndex(string => string.includes("origin")) + 1;
        const username = parseUsername(lines[indexOfOriginUrl]);

        opn(getUsersPrUrlForRepo(url, username));
        process.exit(0);
      });
    }
  });
};

execute();
