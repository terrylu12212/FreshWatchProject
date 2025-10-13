import jwt from 'jsonwebtoken'

export default function requireAuth(req, res, next) { 
  const auth = req.headers.authorization || ''        
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null 
  if (!token) return res.status(401).json({ error: 'Missing token' }) 
  try {                                               
    const payload = jwt.verify(token, process.env.SECRET) 
    req.userId = payload._id                          
    next()                                            
  } catch {                                           
    return res.status(401).json({ error: 'Invalid token' }) 
  }                                                   
}
