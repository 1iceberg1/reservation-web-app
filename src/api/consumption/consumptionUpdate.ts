import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ConsumptionService from '../../services/consumptionService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.consumptionEdit);

    const payload = await new ConsumptionService(req).update(
      req.params.id,
      req.body
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
