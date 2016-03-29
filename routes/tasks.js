//typo was 'completed' vs 'complete'

var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

//This gets called for any routes with url parameters
//...

router.param('task_id', function(req, res, next, taskId){
	console.log("params being extracted from URL for " + taskId );
	//Request task matching this ID, limit to one result.
	req.db.tasks.find( {_id: ObjectID(taskId) }).limit(1).toArray(function(error, task){
		if (error) {
			console.log('param error ' + error);
			return next(error);
		}
		if (task.length != 1) {
			return next(new Error(task.length + ' tasks found, should be 1'));
		}
		req.task = task[0];
		return next();
	});
});

module.exports = router;

// All incomplete tasks
// Creates a list of all tasks which are not completed
router.get('/', function(req, res, next){

	req.db.tasks.find({
		completed:false
	}).toArray(function(error, tasklist){
		if (error) {
			return next(error);
		}
		/* tasks: tasks || []
		if tasklist true, set tasks to tasklist; else set to empty array []*/
		//TODO why are we doing this?
		var allTasks = tasklist || [];
		res.render('tasks', {title: "TODO", tasks: allTasks });
	});
});


//*** Add a new task to the database then redirect to task list */
router.post('/addtask', function(req, res, next){

	if (!req.body || !req.body.task_name) {
		return next(new Error('no data provided'));
	}

	req.db.tasks.save({ name: req.body.task_name, completed: false }, function(error, task){
		if (error) {
			return next(error);
		}
		if (!task) {
			return next(new Error('error saving new task'));
		}
		res.redirect('/tasks'); //redirect to list of tasks
	});
});

/* Get all of the completed tasks */
router.get('/completed', function(req, res, next){

	req.db.tasks.find({completed:true}).toArray(function(error, tasklist){
		if (error) {
			return next(error);
		}
		res.render('tasks_completed', { title:'Completed', tasks: tasklist || [] })
	});
});





/*Complete a task. POST to /tasks/task_id
Set task with specific ID to completed = true */
router.post('/:task_id', function(req, res, next){

	if (!req.body.completed) {
		return next(new Error('body missing parameter?'))
	}

	req.db.tasks.updateOne({_id: ObjectID(req.task._id)}, {$set :{completed:true}}, function(error, result){
		if (error) {
			return next(error);
		}
		res.redirect('/tasks')
	});
});


//**Set all tasks to complted, display empty tasklist */
router.post('/alldone', function(req, res, next){

	req.db.tasks.updateMany({completed: false }, {$set: { completed:true }}, function(error, count) {
		if (error) {
			console.log('error ' + error);
			return next(error);
		}
		res.redirect('/tasks');
	});
});


/*deleteTask
Delete task by ID from database with Ajax */
router.delete('/:task_id', function(req, res, next) {

	req.db.tasks.remove({_id: ObjectID(req.task._id)}, function(error, result){
		if (error) {
			return next(error);
		}
		res.sendStatus(200); //send success to Ajax call
	});
});

