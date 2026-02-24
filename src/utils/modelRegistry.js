import { Customer } from "../app/CustomerMaster/models/customerMaster.model.js";
import { ItemMaster } from "../app/Item-Master/models/itemMaster.model.js";
import { User } from "../app/CustomerMaster/models/userMaster.model.js";
import { BinMaster } from "../app/Bin/models/binConfiguration.model.js";
import { Project } from "../app/Project-Master/models/projectMaster.model.js";

export const modelRegistry = {
  customerMaster: Customer,
  itemMaster: ItemMaster,
  userMaster: User,
  binMaster: BinMaster,
  projectMaster: Project,
};
