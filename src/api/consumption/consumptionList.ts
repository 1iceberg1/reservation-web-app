import ApiResponseHandler from '../apiResponseHandler';
import ConsumptionService from '../../services/consumptionService';

export default async (req, res, next) => {
  try {
    const payload = await new ConsumptionService(req).findAndCountAll(
      req.query
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
