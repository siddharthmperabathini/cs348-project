require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const Tag = require('./models/Tag');
const TagRel = require('./models/TagRel');

const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const express = require('express');
const app = express();

app.use(express.json());
app.use(cors());
app.use(mongoSanitize());

const MONGO_URI = process.env.MONGO_URI;
const TXN_OPTS = {
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' }
};

app.get('/', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);
    res.json({ mssg: 'Hello world' });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch root' });
  } finally {
    session.endSession();
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const deletedTask = await Task.findByIdAndDelete(id, { session });
    if (!deletedTask) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Task does not exist' });
    }

    const tagRels = await TagRel.find({ task_id: id }).session(session);
    const tagsDelete = tagRels.map(rel => rel.tag_id);
    if (tagsDelete.length > 0) {
      await Tag.deleteMany({ _id: { $in: tagsDelete } }).session(session);
    }
    await TagRel.deleteMany({ task_id: id }).session(session);

    await session.commitTransaction();
    res.json({ message: 'Task successfully deleted', task: deletedTask });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to delete task' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks', async (req, res) => {
  const { user_id } = req.query;
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tasks = await Task
      .find({ user_id: new mongoose.Types.ObjectId(user_id) })
      .session(session);

    await session.commitTransaction();
    res.json(tasks);
  } catch (err) {
    console.error('get tasks', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Get Tasks' });
  } finally {
    session.endSession();
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const data_update = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'invalid task id' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      data_update,
      { new: true, session }
    );
    if (!updatedTask) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'task does not exist' });
    }

    await session.commitTransaction();
    res.json(updatedTask);
  } catch (err) {
    console.error('error updating task:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'update failed' });
  } finally {
    session.endSession();
  }
});

app.get('/users', async (req, res) => {
  const { email } = req.query;
  console.log('🔍 /users route hit with query:', req.query);
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const user = await User.findOne({ email }).session(session);
    await session.commitTransaction();
    if (user) {
      return res.json({ user_id: user._id });
    } else {
      return res.json({ user_id: 0 });
    }
  } catch (err) {
    console.error('get users', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'get users' });
  } finally {
    session.endSession();
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    const savedUser = await user.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email
    });
  } catch (err) {
    console.error('❌ error creating user:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.post('/tasks', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const { title, description, due_date, priority, status, user_id, tags } = req.body;
    const task = new Task({ title, description, due_date, priority, status, user_id, tags });
    const saveTask = await task.save({ session });

    await session.commitTransaction();
    res.status(201).json(saveTask);
  } catch (err) {
    console.error('error creating task:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'create task' });
  } finally {
    session.endSession();
  }
});

app.post('/tasks/:id/tags', async (req, res) => {
  const { id: taskId } = req.params;
  let { tags } = req.body;
  if (typeof tags !== 'string') {
    return res.status(400).json({ error: 'tags must be a comma-separated string' });
  }

  const cleanedTags = tags.split(',').map(t => t.trim()).filter(t => t.length);
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const addedTags = [];
    for (const tagName of cleanedTags) {
      let tag = await Tag.findOne({ tagName }).session(session);
      if (!tag) {
        tag = (await Tag.create([{ tagName }], { session }))[0];
      }
      const existingRel = await TagRel
        .findOne({ task_id: taskId, tag_id: tag._id })
        .session(session);
      if (!existingRel) {
        await TagRel.create([{ task_id: taskId, tag_id: tag._id }], { session });
        addedTags.push(tagName);
      }
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'tags made', added: addedTags });
  } catch (err) {
    console.error('error adding tags:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to add tags' });
  } finally {
    session.endSession();
  }
});

app.delete('/tasks/:id/tags', async (req, res) => {
  const { id: taskId } = req.params;
  const { tagName } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tag = await Tag.findOne({ tagName }).session(session);
    if (!tag) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'tag not found' });
    }

    const tagRelDeleted = await TagRel.findOneAndDelete(
      { task_id: taskId, tag_id: tag._id },
      { session }
    );
    if (!tagRelDeleted) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'tag does not have task' });
    }

    await Tag.deleteOne({ _id: tag._id }).session(session);
    await TagRel.deleteMany({ tag_id: tag._id }).session(session);

    await session.commitTransaction();
    res.json({ message: 'tag has been removed from task', tagName });
  } catch (err) {
    console.error('error deleting tag:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'failed to delete tag' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/:id/tags', async (req, res) => {
  const { id: taskId } = req.params;
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tagRels = await TagRel
      .find({ task_id: taskId })
      .populate('tag_id', 'tagName')
      .session(session);

    const tags = tagRels
      .filter(rel => rel.tag_id && rel.tag_id.tagName)
      .map(rel => rel.tag_id.tagName);

    await session.commitTransaction();
    res.json({ taskId, tags });
  } catch (err) {
    console.error('error getting tags:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'failed to get tags' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/completed', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid or missing user_id' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tasks = await Task
      .find({ user_id: new mongoose.Types.ObjectId(user_id), status: 'DONE' })
      .session(session);

    await session.commitTransaction();
    res.json(tasks);
  } catch (err) {
    console.error('error fetching completed tasks:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch completed tasks' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/incomplete', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid or missing user_id' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tasks = await Task
      .find({ user_id: new mongoose.Types.ObjectId(user_id), status: { $ne: 'DONE' } })
      .session(session);

    await session.commitTransaction();
    res.json(tasks);
  } catch (err) {
    console.error('error fetching incomplete tasks:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch incomplete tasks' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/overdue', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid or missing user_id' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = await Task
      .find({
        user_id: new mongoose.Types.ObjectId(user_id),
        due_date: { $lt: today },
        status: { $ne: 'DONE' }
      })
      .session(session);

    await session.commitTransaction();
    res.json(overdueTasks);
  } catch (err) {
    console.error('error fetching overdue tasks:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/completedByDate', async (req, res) => {
  const { user_id, startDate, endDate } = req.query;
  if (!user_id || !startDate || !endDate || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tasks = await Task
      .find({
        user_id: new mongoose.Types.ObjectId(user_id),
        status: 'DONE',
        due_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
      .session(session);

    await session.commitTransaction();
    res.json(tasks);
  } catch (err) {
    console.error('error fetching completed tasks by date:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch completed tasks by date' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/incompleteByDate', async (req, res) => {
  const { user_id, startDate, endDate } = req.query;
  if (!user_id || !startDate || !endDate || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tasks = await Task
      .find({
        user_id: new mongoose.Types.ObjectId(user_id),
        status: { $ne: 'DONE' },
        due_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
      .session(session);

    await session.commitTransaction();
    res.json(tasks);
  } catch (err) {
    console.error('error fetching incomplete tasks by date:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch incomplete tasks by date' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/completionPercentageByDate', async (req, res) => {
  const { user_id, startDate, endDate } = req.query;
  if (!user_id || !startDate || !endDate || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const result = await Task.aggregate([
      { $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          due_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      { $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] }
          }
        }
      },
      { $project: {
          _id: 0,
          completionPercentage: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }
            ]
          }
        }
      }
    ]).session(session);

    await session.commitTransaction();
    if (result.length) {
      res.json({ completionPercentage: Math.round(result[0].completionPercentage) });
    } else {
      res.json({ completionPercentage: 0 });
    }
  } catch (err) {
    console.error('error calculating completion percentage by date:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to calculate completion percentage by date' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/countUntilDueDate', async (req, res) => {
  const { user_id, endDate } = req.query;
  if (!user_id || !endDate || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const count = await Task.countDocuments({
      user_id: new mongoose.Types.ObjectId(user_id),
      status: { $ne: 'DONE' },
      due_date: { $lte: new Date(endDate) }
    }).session(session);

    await session.commitTransaction();
    res.json({ totalTasksToComplete: count });
  } catch (err) {
    console.error('Error fetching count of tasks until due date:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch tasks count' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/averageDaysUntilDue', async (req, res) => {
  const { user_id, endDate } = req.query;
  if (!user_id || !endDate || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const today = new Date();
    const result = await Task.aggregate([
      { $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          status: { $ne: 'DONE' },
          due_date: { $lte: new Date(endDate) }
        }
      },
      { $project: {
          daysUntilDue: {
            $divide: [
              { $subtract: ["$due_date", today] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $group: {
          _id: null,
          averageDaysUntilDue: { $avg: "$daysUntilDue" }
        }
      }
    ]).session(session);

    await session.commitTransaction();
    if (result.length) {
      res.json({ averageDaysUntilDue: Math.round(result[0].averageDaysUntilDue) });
    } else {
      res.json({ averageDaysUntilDue: 0 });
    }
  } catch (err) {
    console.error('Error calculating average days until due:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to calculate average days until due' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/averageTasksPerTag', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const result = await TagRel.aggregate([
      { $lookup: {
          from: 'todoList.tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'task'
        }
      },
      { $unwind: '$task' },
      { $match: { 'task.user_id': new mongoose.Types.ObjectId(user_id) } },
      { $group: { _id: '$tag_id', taskCount: { $sum: 1 } } },
      { $group: { _id: null, averageTasksPerTag: { $avg: '$taskCount' } } }
    ]).session(session);

    await session.commitTransaction();
    if (result.length) {
      res.json({ averageTasksPerTag: parseFloat(result[0].averageTasksPerTag.toFixed(2)) });
    } else {
      res.json({ averageTasksPerTag: 0 });
    }
  } catch (err) {
    console.error('Error calculating average tasks per tag:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to calculate average tasks per tag' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/mostUsedTag', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const pipeline = [
      { $lookup: {
          from: 'todoList.tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'task'
      }},
      { $unwind: '$task' },
      { $match: { 'task.user_id': new mongoose.Types.ObjectId(user_id) } },

      { $group: {
          _id: '$tag_id',
          usageCount: { $sum: 1 }
      }},
      { $sort: { usageCount: -1 } },

      { $lookup: {
          from: 'todoList.tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tag'
      }},
      { $unwind: '$tag' },
      { $match: { 'tag.tagName': { $nin: [ null, 'None' ] } } },

      { $limit: 1 },

      { $project: {
          _id: 0,
          tagName: '$tag.tagName',
          usageCount: 1
      }}
    ];

    const result = await TagRel.aggregate(pipeline).session(session);

    await session.commitTransaction();
    if (result.length) {
      res.json(result[0]);
    } else {
      res.json({ message: 'No tags found for this user' });
    }
  } catch (err) {
    console.error('Error fetching most used tag:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch most used tag' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/tagRank', async (req, res) => {
  const { user_id, tagName } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id) || !tagName) {
    return res.status(400).json({ error: 'Invalid user ID or tag name' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tagDoc = await Tag.findOne({ tagName }).session(session);
    if (!tagDoc || tagDoc.tagName === 'None') {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Tag not found or invalid' });
    }

    const tagsRank = await TagRel.aggregate([
      { $lookup: {
          from: 'todoList.tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'task'
      }},
      { $unwind: '$task' },
      { $match: { 'task.user_id': new mongoose.Types.ObjectId(user_id) } },

      { $group: {
          _id: '$tag_id',
          usageCount: { $sum: 1 }
      }},

      { $lookup: {
          from: 'todoList.tags',
          localField: '_id',
          foreignField: '_id',
          as: 'tag'
      }},
      { $unwind: '$tag' },
      { $match: { 'tag.tagName': { $nin: [ null, 'None' ] } } },

      { $sort: { usageCount: -1 } }
    ]).session(session);

    await session.commitTransaction();

    const idx = tagsRank.findIndex(d => d._id.toString() === tagDoc._id.toString());
    if (idx === -1) {
      return res.json({ rank: null });  
    }
    res.json({ rank: idx + 1 });
  } catch (err) {
    console.error('Error fetching tag rank:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch tag rank' });
  } finally {
    session.endSession();
  }
});


app.get('/tasks/averagePriorityByTag', async (req, res) => {
  const { user_id, tagName } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id) || !tagName) {
    return res.status(400).json({ error: 'Invalid user ID or tag name' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tag = await Tag.findOne({ tagName }).session(session);
    if (!tag) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Tag not found' });
    }

    const result = await TagRel.aggregate([
      { $lookup: {
          from: 'todoList.tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'task' } },
      { $unwind: '$task' },
      { $match: {
          'task.user_id': new mongoose.Types.ObjectId(user_id),
          tag_id: tag._id } },
      { $addFields: {
          priorityValue: {
            $switch: {
              branches: [
                { case: { $eq: ["$task.priority", "LOW"] }, then: 1 },
                { case: { $eq: ["$task.priority", "MEDIUM"] }, then: 2 },
                { case: { $eq: ["$task.priority", "HIGH"] }, then: 3 }
              ],
              default: 0
            }
          }
        }
      },
      { $group: { _id: null, avgPriority: { $avg: '$priorityValue' } } }
    ]).session(session);

    await session.commitTransaction();
    if (result.length) {
      res.json({ averagePriority: parseFloat(result[0].avgPriority.toFixed(2)) });
    } else {
      res.json({ averagePriority: 0 });
    }
  } catch (err) {
    console.error('Error fetching average priority:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch average priority' });
  } finally {
    session.endSession();
  }
});

app.get('/tasks/byTag', async (req, res) => {
  const { user_id, tagName } = req.query;
  if (!user_id || !mongoose.Types.ObjectId.isValid(user_id) || !tagName) {
    return res.status(400).json({ error: 'Invalid user ID or tag name' });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction(TXN_OPTS);

    const tag = await Tag.findOne({ tagName }).session(session);
    if (!tag) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Tag not found' });
    }

    const result = await TagRel.aggregate([
      { $match: { tag_id: tag._id } },
      { $lookup: {
          from: 'todoList.tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'task' } },
      { $unwind: '$task' },
      { $match: { 'task.user_id': new mongoose.Types.ObjectId(user_id) } },
      { $project: {
          _id: 0,
          task_id: '$task._id',
          title: '$task.title',
          description: '$task.description',
          due_date: '$task.due_date',
          priority: '$task.priority',
          status: '$task.status'
        }
      }
    ]).session(session);

    await session.commitTransaction();
    res.json(result);
  } catch (err) {
    console.error('Error fetching tasks by tag:', err.message);
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to fetch tasks by tag' });
  } finally {
    session.endSession();
  }
});


const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' MongoDB connection failed:', error);
    process.exit(1); 
  }
}

startServer();