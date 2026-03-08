import db from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'

const seed = async () => {
  console.log('🌱 Starting db seed')
  try {
    console.log('Clearing the previous database.')
    await db.delete(entries)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(users)
    await db.delete(tags)
    console.log('Creating demo users.')
    //this will get the first element in the array which is the demo user.
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'mudasarmajeed5@gcrpro.tech',
        password: '1234',
        username: 'mudasarmajeed5',
        firstName: 'Mudassar',
        lastName: 'Majeed',
      })
      .returning()
    console.log('creating tags')
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: 'health',
        color: '#f0f0f0',
      })
      .returning()

    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Do 50 pushups',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning()
    await db.insert(habitTags).values({
      habitId: exerciseHabit.id,
      tagId: healthTag.id,
    })

    console.log('Adding completion entries')
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
      })
    }
    console.log('✅ Database seeded')
    console.log(
      `- User credentials ${demoUser.email}\nusername: ${demoUser.username}\npassword: ${demoUser.password}`,
    )
  } catch (error) {
    console.error('❌ seed failed', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => process.exit(1))
}
export default seed
