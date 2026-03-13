import { Router } from 'express'
import { authenticatedToken } from '../middleware/auth.ts'


const router = Router()
router.use(authenticatedToken)
router.get('/', (req, res) =>  {
  res.json({ message: 'Users' })
})

router.get('/:id', (req, res) => {
  res.json({ message: 'Get User' })
})

router.put('/:id', (req, res) => {
  res.json({ message: 'User updated' })
})

router.delete('/:id', (req, res) => {
  res.json({ message: 'User deleted' })
})

export default router
