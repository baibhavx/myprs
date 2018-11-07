#!/usr/bin/env node
const opn = require("opn");
const fs = require("fs");
const findUp = require("find-up");
const parse = require("parse-git-config");
const getGitUsername = require("git-username");
const readLine = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = parse.sync();

const forkRemote = "origin";
const teamRemote = "upstream";

// const parseURL = rawString => {
//   const urlWithDotGit = rawString.split("=")[1].trim();
//   return urlWithDotGit.substring(0, urlWithDotGit.length - 4);
// };

// const parseUsername = rawUsername => {
//   const dotComIndex = rawUsername.indexOf(".com");
//   rawUsername = rawUsername.slice(dotComIndex + 5);
//   const indexOfSlash = rawUsername.indexOf("/");
//   return rawUsername.slice(0, indexOfSlash);
// };

const getUsersPrUrlForRepo = (url, username) =>
  `${url}/pulls?utf8=%E2%9C%93&q=+is%3Apr+author%3A${username}+`;

const findDotGitPath = () => findUp(".git");

const openUsersPrInBrowser = (rawUrl, username) => {
  const url = rawUrl.substring(0, rawUrl.length - 4);
  let output = getUsersPrUrlForRepo(url, username);
  console.log(output);
};

const execute = () => {
  findDotGitPath().then(path => {
    if (!path) {
      console.error(`Cannot find .git file`);
    }
    const username = getGitUsername();
    const gitConfig = parse.sync({ path: `${path}/config` });
    // console.log(gitConfig);
    let gitConfigInfo = Object.keys(gitConfig).reduce((repoStats, key) => {
      if (key.includes("remote")) {
        let remoteElems = key.split(" ")[1];
        remoteElems = remoteElems.split("");
        remoteElems.pop();
        remoteElems.shift();
        const remoteName = remoteElems.join("");
        // console.log(remoteName);
        // console.log(repoStats);
        repoStats[remoteName] = gitConfig[key];
        // return repoStats;
      }
      return repoStats;
    }, {});

    if (gitConfigInfo["origin"] && gitConfigInfo["upstream"]) {
      console.log(`Username: ${username}`);
      console.log(`Fork Remote Name: ${forkRemote}`);
      console.log(`Parent Remote Name: ${teamRemote}`);
      rl.question("Proceed with this config (y/n)", answer => {
        if (answer.toLowerCase() === "y") {
          // open the repo in a new broswer
          openUsersPrInBrowser(gitConfigInfo["upstream"].url, username);
        }
      });
    }
    console.error(`ERR: Remotes "upstream" and "origin" is required.`);

    // console.log(gitConfigInfo);
    // console.log(username);

    process.exit(0);
    // else {
    // fs.readFile(`${path}/config`, "utf-8", function(err, data) {
    //   const lines = data.split("\n");

    //   const indexOfUpstreamUrl =
    //     lines.findIndex(string => string.includes("upstream")) + 1;
    //   const url = parseURL(lines[indexOfUpstreamUrl]);

    //   const indexOfOriginUrl =
    //     lines.findIndex(string => string.includes("origin")) + 1;
    //   const username = parseUsername(lines[indexOfOriginUrl]);

    //   opn(getUsersPrUrlForRepo(url, username));
    //   process.exit(0);
    // });
    // }
  });
};

// let output = {
//   core: {
//     repositoryformatversion: "0",
//     filemode: true,
//     bare: false,
//     logallrefupdates: true,
//     ignorecase: true,
//     precomposeunicode: true
//   },
//   'remote "origin"': {
//     url: "git@github.com:baibhavx/myprs.git",
//     fetch: "+refs/heads/*:refs/remotes/origin/*"
//   },
//   'branch "master"': { remote: "origin", merge: "refs/heads/master" }
// };

execute();
