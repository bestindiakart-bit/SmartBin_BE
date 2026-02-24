import { authorize } from "./permission.middleware.js";

export const dynamicAuthorize = (req, res, next) => {
  const rawModule = req.params.module;

  // Convert ItemMaster → item_master
  const moduleName = rawModule
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();

  const methodActionMap = {
    GET: "view",
    POST: "create",
    PUT: "edit",
    PATCH: "edit",
    DELETE: "delete",
  };

  const action = methodActionMap[req.method];

  return authorize(moduleName, action)(req, res, next);
};
