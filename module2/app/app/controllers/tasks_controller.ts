import Task from '#models/task'
import { createTaskValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'

export default class TasksController {
  public async index({ view }: HttpContext) {
    const tasks = await Task.all()
    return view.render('tasks', { tasks })
  }

  public async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createTaskValidator)
    await Task.create(data)
    return response.redirect().toRoute('tasks.index')
  }

  public async update({ request, response }: HttpContext) {
    const task = await Task.findOrFail(request.param('id'))
    task.done = true
    await task.save()
    return response.redirect().toRoute('tasks.index')
  }
}
