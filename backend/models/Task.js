const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  due_date: Date,
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    default: 'TODO'
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  collection: 'todoList.tasks' 
});

taskSchema.index({ user_id: 1 });
taskSchema.index({ user_id: 1, status: 1 });
taskSchema.index({ user_id: 1, due_date: 1 });

taskSchema.index({ user_id: 1, tagName: 1 });

module.exports = mongoose.model('Task', taskSchema);
