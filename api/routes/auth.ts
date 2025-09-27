/**
 * User authentication API routes
 * Handle user registration, login, token management, etc.
 * Uses server-side Supabase client for secure operations
 */
import { Router, type Request, type Response } from 'express'
import { ServerAuthService, ServerDatabaseService } from '../lib/supabase.js'

const router = Router()

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
      return;
    }

    // Create user with server-side client
    const user = await ServerAuthService.createUser(email, password, { name });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
})

/**
 * Verify User Token
 * POST /api/auth/verify
 */
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Token is required'
      });
      return;
    }

    // Verify token with server-side client
    const user = await ServerAuthService.verifyToken(token);
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
})

/**
 * Get User Profile
 * GET /api/auth/profile/:userId
 */
router.get('/profile/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Get user by ID with server-side client
    const user = await ServerAuthService.getUserById(userId);
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
})

export default router
