import { Router } from 'express'
const router = Router()

// 201 means your POST request was good
router.post('/register', (req, res) => {
  res.status(201).json({ message: 'User signed up' })
})
router.post('/login', (req, res) => {
  res.status(201).json({ message: 'User logged in' })
})
export default router
