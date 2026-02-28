import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import z from 'zod'

const router = Router()

const createHabitSchema = z.object({
  name: z.string(),
})
const createParamsSchema = z.object({
  id: z.string().max(3),
})

router.get('/', (req, res) => {
  res.json({ message: 'Habits' })
})
router.get('/:id', (req, res) => {
  res.json({ message: 'Got one habit' })
})
// 201 means your POST request was good
router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.status(201).json({ message: 'Created Habit' })
})
router.delete('/:id', (req, res) => {
  res.status(201).json({ message: 'Deleted habit' })
})

router.post(
  '/:id/complete',
  validateParams(createParamsSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.status(201).json({ message: 'Completed Habit' })
  },
)

export default router
