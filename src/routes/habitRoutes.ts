// Never add a middleware (next) function inside a route handler.

import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import z from 'zod'
import { authenticatedToken } from '../middleware/auth.ts'
import {
  createHabit,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'

const router = Router()

// everything will run through the middleware first on the route whichis /api/habits.
router.use(authenticatedToken)

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})
const createParamsSchema = z.object({
  id: z.string().max(3),
})

router.get('/', getUserHabits)
router.get('/:id', (req, res) => {
  res.json({ message: 'Got one habit' })
})
// 201 means your POST request was good
router.post('/', validateBody(createHabitSchema), createHabit)
router.patch('/:id', updateHabit)
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
