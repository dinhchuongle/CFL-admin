const fakeUsers = [
  { id: "1", username: "admin", password: "123456", role: "admin" },
  { id: "2", username: "teacher", password: "abc123", role: "teacher" }
];

function findByUsername(username) {
  return Promise.resolve(fakeUsers.find(u => u.username === username));
}

function findById(id) {
  return Promise.resolve(fakeUsers.find(u => u.id === id));
}

module.exports = {
  findByUsername,
  findById
};
