import { allPermissions } from "../data/permissions.data";

/**
 *
 * @param permissionCode - Mã quyền hạn
 * @returns Thông tin quyền hạn
 */
const getPermissionInfo = (permissionCode: string) => {
  return allPermissions.find((p) => p.code === permissionCode);
};

export { getPermissionInfo };
