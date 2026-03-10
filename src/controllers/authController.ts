import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db/connection.ts'
import { users, type NewUser } from '../db/schema.ts'

import { generateToken } from '../utils/jwt.ts'
import { comparePasswords, hashPassword } from '../utils/passwords.ts'
import { eq } from 'drizzle-orm'

export const register = async (
  req: Request<any, any, NewUser>,
  res: Response,
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password)
    const [user] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.email,
    })
    return res.status(201).json({
      message: 'User created',
      user,
      token,
    })
  } catch (e) {
    // at this point problem is on our side, so we send 500.
    return res.status(500).json({ error: 'Failed to create user.' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    // if any error our responsibility
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    // if we do if(user) then we would have to nest the conditions, so it better to do if(!user)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }
    // if any error our responsibility
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    // if any error our responsibility
    const token = await generateToken({
      email: user.email,
      id: user.id,
      username: user.username,
    })
    return res
      .json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      })
      .status(201)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login' })
  }
}
