import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  const payload = {
    userId: user.id || user.userId, // Handle different casing if needed
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

export const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id || user.userId,
    role: user.role
  };

  return jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};