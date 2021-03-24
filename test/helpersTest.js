const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(user.id === expectedOutput, 'user.id should equal expectedOutput');
  });
  it('should return false due to non existant user', function() {
    const nonExistantUser = getUserByEmail("user3@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(nonExistantUser === false, 'nonExistantUser should return false');
  });
});