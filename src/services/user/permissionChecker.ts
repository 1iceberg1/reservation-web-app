import assert from 'assert';
import Error403 from '../../errors/Error403';
import Permissions from '../../security/permissions';

export default class PermissionChecker {
  language;
  currentUser;

  constructor({ language, currentUser }) {
    this.language = language;
    this.currentUser = currentUser;
  }

  /**
   * Validates if the user has a specific permission
   * and throws a Error403 if it doesn't.
   */
  validateHas(permission) {
    if (!this.has(permission)) {
      throw new Error403(this.language);
    }
  }

  /**
   * Checks if the user has a specific permission.
   */
  has(permission) {
    assert(permission, 'permission is required');

    return this.hasRolePermission(permission);
  }

  /**
   * Validates if the user has access to a storage
   * and throws a Error403 if it doesn't.
   */
  validateHasStorage(storageId) {
    if (!this.hasStorage(storageId)) {
      throw new Error403(this.language);
    }
  }

  /**
   * Validates if the user has access to a storage.
   */
  hasStorage(storageId: string) {
    assert(storageId, 'storageId is required');
    return this.allowedStorageIds().includes(storageId);
  }

  hasRolePermission(permission) {
    return permission.allowedRoles.some(
      allowedRole => allowedRole === this.currentUserRoleId
    );
  }

  get currentUserRoleId() {
    if (!this.currentUser) {
      return [];
    }

    return this.currentUser.role;
  }

  allowedStorageIds() {
    let allowedStorageIds: Array<string> = [];

    Permissions.asArray.forEach(permission => {
      if (this.has(permission)) {
        allowedStorageIds = allowedStorageIds.concat(
          (permission.allowedStorage || []).map(storage => storage.id)
        );
      }
    });

    return [...new Set(allowedStorageIds)];
  }
}
