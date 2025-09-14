import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    name: vine.string(),
  })
)
