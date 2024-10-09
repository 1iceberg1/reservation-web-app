import { createRateLimiter } from '../apiRateLimiter';

export default app => {
  const loginRateLimiter = createRateLimiter({
    max: 200,
    windowMs: 15 * 60 * 1000,
    message: 'errors.429',
  });

  app.post(`/auth/login`, loginRateLimiter, require('./authLogin').default);

  const registerRateLimiter = createRateLimiter({
    max: 20,
    windowMs: 60 * 60 * 1000,
    message: 'errors.429',
  });

  app.post(
    `/auth/register`,
    registerRateLimiter,
    require('./authRegister').default
  );

  app.put(`/auth/profile`, require('./authUpdateProfile').default);

  app.put(`/auth/change-password`, require('./authPasswordChange').default);

  app.get(`/auth/me`, require('./authMe').default);

  app.delete(`/auth/profile`, require('./authRemoveProfile').default);
};
