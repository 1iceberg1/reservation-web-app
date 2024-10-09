import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import PaymentService from '../../services/paymentService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.paymentEdit);

    const payload = await new PaymentService(req).update(
      req.params.id,
      req.body
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
