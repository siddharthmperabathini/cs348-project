const mongoose = require('mongoose');

const taskRelSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  tag_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true },
});
taskRelSchema.index({ task_id: 1, tag_id: 1 });
taskRelSchema.index({ tag_id: 1 });

module.exports = mongoose.model('TagRel', taskRelSchema, 'todoList.tagRel');
