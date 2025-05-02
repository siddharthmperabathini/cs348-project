CS 348 Project - Siddharth Perabathini

To Do List Application

MERN Stack

Database Design
Users(user_id, name, email)
Tasks(task_id, title, description, due_date, priority, status, tags, user_id)
Tag(tag_id, tag_name)
TagRel(task_id,tag_id)

Users(user_id: primary key, name: String , email: unique String)

Tasks(task_id: primary key, title: String, description: String, due_date: Date, priority: String(“LOW”, “MEDIUM”,
“HIGH”), status: String(“TODO”, “IN_PROGRESS”,”DONE”), user_id: Foreign Key)

Tag(tag_id: Primary Key, tag_name: String)

TagRel(task_id,tag_id)

Primary Key; (task_id,tag_id)
Foreign Key: task_id
Foreign Key: tag_id

Features:

Login with username and email address with a Logout Button

Home Page to View all Tasks and ability to Delete a Task

Create Task Page to Create a Task

Edit Task Page to Edit an Existing Task

Reports Page:
Dropdown with

Overall Summary of Tasks:
Gives the overall summary of tasks. Completied Tasks, Incomplete Tasks, Overdue Tasks, Completion Percentage, and Average Days Overdue

Tasks by Due Date Range
User can select a date range and will see complete, incomplete tasks in that range. They will also see the completion percentage, total tasks to complete until due date, and average days until due.

Tasks by Tag
This shows how many tags the user used, average amount of tasks per tag, and the most used tag. If the user selects a tag, the user can see all the tasks with tag, the Tag Rank in most used tags, and the average priority for tasks with the tag.





















# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
