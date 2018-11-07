#!/usr/bin/env node
const opn = require("opn");
const fs = require("fs");
const findUp = require("find-up");
const parse = require("parse-git-config");
const getGitUsername = require("git-username");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = parse.sync();

const getUsersPrUrlForRepo = (url, username) =>
  `${url}/pulls?utf8=%E2%9C%93&q=+is%3Apr+author%3A${username}+`;

const findDotGitPath = () => findUp(".git");

const removeDotGit = url => url.slice(0, url.length - 4);

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
        const remoteName = remoteElems.join("").trim();
        repoStats[remoteName] = gitConfig[key];
      }
      return repoStats;
    }, {});

    if (!gitConfigInfo["origin"]) {
      console.error("Cannot find origin");
      process.exit(0);
    }
    const originUrl = removeDotGit(gitConfigInfo["origin"].url);

    const remoteNames = Object.keys(gitConfigInfo);

    console.log(`**Found remotes: ${remoteNames.join(" ")}`);

    if (remoteNames.includes("upstream")) {
      const upstreamUrl = removeDotGit(gitConfigInfo["upstream"].url);

      console.log(`
      **
      Username:     ${username}
      Origin URL:   ${originUrl}
      Upstream URL: ${upstreamUrl} 
      **
      `);

      const prURL = getUsersPrUrlForRepo(upstreamUrl, username);
      opn(prURL);
      process.exit(0);
    } else {
      console.error(
        "Your use case is not supported yet. Remotes upstream and origin is required"
      );
    }
    process.exit(0);
  });
};

execute();
