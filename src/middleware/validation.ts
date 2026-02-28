import type { Request, Response, NextFunction } from 'express'
import { type ZodType, ZodError } from 'zod'
export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body)
      req.body = validatedData
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: e.issues.map((error) => {
            return { field: error.path.join('.'), message: error.message }
          }),
        })
      }
      next(e)
    }
  }
}

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()

    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Invlaid Paramters',
          details: e.issues.map((error) => {
            return { field: error.path.join('.'), message: error.message }
          }),
        })
      }
      next(e)
    }
  }
}



export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
      
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid Query paramaters.',
          details: e.issues.map((error) => {
            return { field: error.path.join('.'), message: error.message }
          }),
        })
      }
      next(e)
    }
  }
}
