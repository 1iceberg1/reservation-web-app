import ApiResponseHandler from '../apiResponseHandler';
import ReservationService from '../../services/reservationService';

export default async (req, res, next) => {
  try {
    const payload = await new ReservationService(req).findAndCountAll(
      req.query
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
