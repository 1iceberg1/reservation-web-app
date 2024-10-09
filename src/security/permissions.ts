import Roles from './roles';
import Storage from './storage';

const storage = Storage.values;
const roles = Roles.values;

class Permissions {
  static get values() {
    return {
      userCreate: {
        id: 'userCreate',
        allowedRoles: [roles.admin],
        allowedStorage: [storage.userAvatar],
      },
      userEdit: {
        id: 'userEdit',
        allowedRoles: [roles.admin],
        allowedStorage: [storage.userAvatar],
      },
      userRead: {
        id: 'userRead',
        allowedRoles: [roles.admin],
      },
      userDestroy: {
        id: 'userDestroy',
        allowedRoles: [roles.admin],
        allowedStorage: [storage.userAvatar],
      },
      userAutocomplete: {
        id: 'userAutocomplete',
        allowedRoles: [roles.admin],
      },
      reservationCreate: {
        id: 'reservationCreate',
        allowedRoles: [roles.admin, roles.guest],
      },
      reservationEdit: {
        id: 'reservationEdit',
        allowedRoles: [roles.admin, roles.guest],
      },
      reservationRead: {
        id: 'reservationRead',
        allowedRoles: [roles.admin, roles.guest],
      },
      reservationDestroy: {
        id: 'reservationDestroy',
        allowedRoles: [roles.admin],
      },
      reservationAutocomplete: {
        id: 'reservationAutocomplete',
        allowedRoles: [roles.admin, roles.guest],
      },
      consumptionCreate: {
        id: 'consumptionCreate',
        allowedRoles: [roles.admin],
      },
      consumptionEdit: {
        id: 'consumptionEdit',
        allowedRoles: [roles.admin],
      },
      consumptionRead: {
        id: 'consumptionRead',
        allowedRoles: [roles.admin, roles.guest],
      },
      consumptionDestroy: {
        id: 'consumptionDestroy',
        allowedRoles: [roles.admin],
      },
      consumptionAutocomplete: {
        id: 'consumptionAutocomplete',
        allowedRoles: [roles.admin, roles.guest],
      },
      paymentCreate: {
        id: 'paymentCreate',
        allowedRoles: [roles.admin, roles.guest],
      },
      paymentEdit: {
        id: 'paymentEdit',
        allowedRoles: [roles.admin, roles.guest],
      },
      paymentRead: {
        id: 'paymentRead',
        allowedRoles: [roles.admin, roles.guest],
      },
      paymentDestroy: {
        id: 'paymentDestroy',
        allowedRoles: [roles.admin, roles.guest],
      },
    };
  }

  static get asArray() {
    return Object.keys(this.values).map(value => {
      return this.values[value];
    });
  }
}

export default Permissions;
