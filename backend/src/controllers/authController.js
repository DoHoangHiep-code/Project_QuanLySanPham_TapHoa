import { AuthService } from '../services/authService.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Username và password là bắt buộc'
          }
        });
      }
      
      // Kiểm tra JWT_SECRET đã được cấu hình chưa
      if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        console.error('❌ JWT secrets not configured. Please check .env file');
        return res.status(500).json({
          success: false,
          error: {
            message: 'Server configuration error. Please contact administrator.'
          }
        });
      }
      
      const result = await AuthService.login(username, password);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      
      res.status(200).json({
        success: true,
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const result = await AuthService.logout(req.user._id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

