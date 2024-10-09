import ApiResponseHandler from '../apiResponseHandler';
import AuthService from '../../services/authService';
import Error403 from '../../errors/Error403';

export default async (req, res, next) => {
  try {
    if (!req.currentUser || !req.currentUser.id) {
      throw new Error403();
    }

    const payload = await AuthService.updateProfile(req.body, req);

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
