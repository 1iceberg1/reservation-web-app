import ApiResponseHandler from '../apiResponseHandler';
import PaymentService from '../../services/paymentService';

export default async (req, res, next) => {
  try {
    const payload = await new PaymentService(req).findLatestReservation();

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
