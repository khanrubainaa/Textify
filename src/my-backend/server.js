const express = require('express');

const app = express();

app.use(express.json());

let users = [
  { id: 1, name: 'Aliza' },
  { id: 2, name: 'Ayla' }
];

// GET - Retrieve users
app.get('/users', (req, res) => {
  res.json(users);
});

// POST - Add a user
app.post('/users', (req, res) => {
  const newUser = req.body;
  users.push(newUser);

  res.json({
    message: 'User added successfully!',
    users: users
  });
});

// PUT - Update a user
app.put('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(user => user.id === id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name;

  res.json(user);
});

// DELETE - Remove a user
app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);

  users = users.filter(user => user.id !== id);

  res.json({
    message: 'User deleted successfully!',
    users: users
  });
});

app.listen(5001, () => {
  console.log('Server running on port 5001');
});
