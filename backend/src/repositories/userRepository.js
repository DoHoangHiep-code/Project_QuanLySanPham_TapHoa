import { User } from '../models/User.js';

export class UserRepository {
  static async create(userData) {
    return await User.create(userData);
  }

  static async findById(id) {
    return await User.findById(id);
  }

  static async findByUsername(username) {
    return await User.findOne({ username });
  }

  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  static async findByUsernameOrEmail(identifier) {
    return await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });
  }

  static async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  static async removeRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken: null },
      { new: true }
    );
  }

  static async findAll(query = {}) {
    return await User.find(query).select('-password -refreshToken');
  }
}

