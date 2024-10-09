import PermissionChecker from '../../services/user/permissionChecker';
import ApiResponseHandler from '../apiResponseHandler';
import Permissions from '../../security/permissions';
import ReservationService from '../../services/reservationService';

export default async (req, res, next) => {
  try {
    new PermissionChecker(req).validateHas(Permissions.values.reservationEdit);

    const payload = await new ReservationService(req).update(
      req.params.id,
      req.body
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
