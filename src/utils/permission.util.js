import { MODULES } from "../constants/modules.js";

export const buildPermissionsFromRequest = (requestedPermissions = []) => {
  return MODULES.map((moduleName) => {
    const found = requestedPermissions.find((p) => p.module === moduleName);

    return {
      module: moduleName,
      create: found ? !!found.create : false,
      view: found ? !!found.view : false,
      edit: found ? !!found.edit : false,
      delete: found ? !!found.delete : false,
    };
  });
};
