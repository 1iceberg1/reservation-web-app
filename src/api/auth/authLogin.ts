import ApiResponseHandler from '../apiResponseHandler';
import AuthService from '../../services/authService';

export default async (req, res, next) => {
  try {
    const payload = await AuthService.login(
      req.body.email,
      req.body.password,
      req
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
