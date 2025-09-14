/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
const TasksController = () => import('#controllers/tasks_controller')

import router from '@adonisjs/core/services/router'
router.get('/', async ({ response }) => {
  return response.redirect('/tasks')
})
router.resource('tasks', TasksController).only(['index', 'store', 'update'])
