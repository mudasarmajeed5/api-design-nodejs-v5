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

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((habitTag) => habitTag.tag),
      habitTags: undefined,
    }))
    res.json({ habits: habitsWithTags })
  } catch (error) {
    console.error('Get habit error', error)
    res.status(500).json({ error: 'Failed to fetch Habits' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id
    const { tagIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      // set method just applies the partial updates instead of updating the whole table.
      // here authorization in where clause we only want to update the habit when we are owner of it.
      const [updatedHabit] = await tx
        .update(habits)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(habitTags.id, id), eq(habits.userId, id)))
        .returning()
      if (!updatedHabit) {
        // if anything doesn't matches in where clause drizzle returns undefined.
        return res.status(401).end()
      }
      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagValues)
        }
      }
      return updateHabit
    })

    res.json({
      message: 'Habit was updated',
      habit: result,
    })
  } catch (error) {
    console.error('Update habit error', error)
    res.status(500).json({ error: 'Failed to update Habit' })
  }
}
