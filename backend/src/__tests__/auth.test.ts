import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Authentication Utilities', () => {
  it('should sign and verify JWT tokens cleanly', () => {
    const payload = { userId: 'user_12345', email: 'test@example.com' };
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '1h' });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, env.jwtSecret) as any;
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should reject invalid or tampered tokens', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature';
    expect(() => jwt.verify(invalidToken, env.jwtSecret)).toThrow();
  });
});
