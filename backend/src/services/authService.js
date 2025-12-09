import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository.js';
import { AppError } from '../middlewares/errorHandler.js';

export class AuthService {
  static generateTokens(userId) {
    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new AppError('JWT_REFRESH_SECRET is not configured', 500);
    }

    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
  }

  static async login(username, password) {
    // Loại bỏ khoảng trắng ở đầu và cuối username
    const trimmedUsername = username?.trim();
    
    if (!trimmedUsername || !password) {
      throw new AppError('Username và password là bắt buộc', 400);
    }

    const user = await UserRepository.findByUsernameOrEmail(trimmedUsername);

    if (!user) {
      throw new AppError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản đã bị khóa', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    const { accessToken, refreshToken } = this.generateTokens(user._id);
    
    await UserRepository.updateRefreshToken(user._id, refreshToken);

    const userData = user.toJSON();

    return {
      user: userData,
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await UserRepository.findById(decoded.userId);

      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokens = this.generateTokens(user._id);
      await UserRepository.updateRefreshToken(user._id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401);
      }
      throw new AppError('Invalid refresh token', 401);
    }
  }

  static async logout(userId) {
    await UserRepository.removeRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  static async forgotPassword(email) {
    // TODO: Triển khai chức năng quên mật khẩu
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      // Không tiết lộ email có tồn tại hay không để bảo mật
      return { message: 'If email exists, password reset link has been sent' };
    }

    // TODO: Gửi email đặt lại mật khẩu
    return { message: 'If email exists, password reset link has been sent' };
  }
}

