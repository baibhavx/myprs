const opn = require("opn");
const os = require("os");
const fs = require("fs");
const findUp = require("find-up");

const findDotGitPath = () => findUp(".git");

const removeDotGit = url => url.slice(0, url.length - 4);

const getUsersPrUrlForRepo = (url, username) =>
  `${url}/pulls?utf8=%E2%9C%93&q=+is%3Apr+author%3A${username}+`;

const displayUrlsAndOpenPrsInBrowser = ({
  username,
  originUrl,
  upstreamUrl
}) => {
  console.log(`
  **
    Username: ${username}
    Origin URL: ${originUrl}
    Upstream URL: ${upstreamUrl} 
  **`);
  opn(getUsersPrUrlForRepo(upstreamUrl, username));
};

const createUsersJSONFileIfDoesNotExist = cb => {
  const homeDir = os.homedir();
  const usersJsonFilePath = `${homeDir}/.myprsusers.json`;
  if (!fs.existsSync(usersJsonFilePath)) {
    const initialData = {
      users: [
        {
          username: "add username 1",
          name: "add name 1"
        },
        {
          username: "add username 2",
          name: "add name 2"
        }
      ]
    };
    fs.writeFile(usersJsonFilePath, JSON.stringify(initialData), function(err) {
      if (err) {
        console.log(`Error creating local user file`);
      }
      cb();
    });
  } else {
    cb();
  }
};

module.exports = {
  findDotGitPath,
  removeDotGit,
  getUsersPrUrlForRepo,
  displayUrlsAndOpenPrsInBrowser,
  createUsersJSONFileIfDoesNotExist
};
