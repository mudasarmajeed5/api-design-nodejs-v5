import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import db from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body
    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user.id,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()
      if (tagIds && tagIds.length > 0) {
        const [habitTagValues] = tagIds.map((tagId) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagValues)
      }
      // whatever we return here will go to result, at line 10.
      return newHabit
    })
    return res
      .json({
        message: 'Habit Created',
        habit: result,
      })
      .status(201)
  } catch (error) {
    console.error('Create habit error', error)
    res.status(500).json({ error: 'Failed to create Habit' })
  }
}
