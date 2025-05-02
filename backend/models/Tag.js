const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  tagName: { type: String, unique: true },
});

module.exports = mongoose.model('Tag', tagSchema, 'todoList.tags');
