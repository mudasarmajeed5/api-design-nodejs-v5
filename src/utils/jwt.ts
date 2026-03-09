import { SignJWT, type JWTPayload as JoseJWTPayload } from 'jose'
import { createSecretKey } from 'crypto'
import env from '../../env.ts'

// put identifying traits here.
export interface JWTPayload extends JoseJWTPayload {
  id: string
  email: string
  username: string
}

export const generateToken = (payload: JWTPayload) => {
  const secret = env.JWT_SECRET
  const secretKey = createSecretKey(Buffer.from(secret))

  return new SignJWT(payload).setProtectedHeader({alg: 'HS256'})
  .setIssuedAt()
  .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
  .sign(secretKey)
}
