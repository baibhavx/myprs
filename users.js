#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const opn = require("opn");
const table = require("table").table;

const homeDir = os.homedir();
const usersJsonFilePath = `${homeDir}/.myprsusers.json`;

const init = () => {
  if (process.argv[2] === "add") {
    opn(usersJsonFilePath);
    process.exit(0);
  } else {
    fs.readFile(usersJsonFilePath, "utf-8", (err, data) => {
      if (err) {
        console.error("ERROR: Cannot read users.json");
      }
      let users = JSON.parse(data).users;
      console.log(
        table([
          ["Name", "Username"],
          ...users.map(user => [user.name, user.username])
        ])
      );
      console.log("Run `myprsusers add` to add users.\n");
    });
  }
};

init();
