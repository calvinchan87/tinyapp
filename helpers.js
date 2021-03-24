const generateRandomString = function() {
  let randomSix   = '';
  let chars       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charsLength = chars.length;
  for (let i = 0; i < 6; i++) {
    randomSix += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return randomSix;
};

const getUserByEmail = function(input, database) {
  for (const x in database) {
    if (database[x].email === input) {
      return database[x]; // refactoring ideas from @wesley-wong and @berk-ozer
    }
  }
  return false;
};

const urlsForUser = function(input, database) {
  let customURLs = {};
  for (const x in database) {
    if (database[x].userID === input) {
      customURLs[x] = database[x];
    }
  }
  return customURLs;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };