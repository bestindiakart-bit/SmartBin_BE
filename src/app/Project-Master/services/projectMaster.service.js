import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Project } from "../models/projectMaster.model.js";
import { User } from "../../CustomerMaster/models/userMaster.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";

export class ProjectMasterService {
  async create(data, loggedInUser) {
    console.log(loggedInUser);
    try {
      const {
        projectName,
        projectHead,
        projectManager,
        startDate,
        endDate,
        projectDescription,
      } = data;

      if (!projectName || !projectHead || !projectManager || !startDate) {
        return {
          success: false,
          data: { message: "Required fields missing" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (
        !mongoose.Types.ObjectId.isValid(projectHead) ||
        !mongoose.Types.ObjectId.isValid(projectManager)
      ) {
        return {
          success: false,
          data: { message: "Invalid user ID format" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (endDate && new Date(startDate) > new Date(endDate)) {
        return {
          success: false,
          data: { message: "End date cannot be before start date" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      console.log(projectHead, projectManager);

      const users = await User.find({
        _id: { $in: [projectHead, projectManager] },
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      })
        .select("_id userName")
        .lean();

      console.log(users);

      if (users.length !== 2) {
        return {
          success: false,
          data: { message: "Invalid project head or manager" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const headUser = users.find((u) => u._id.toString() === projectHead);

      const managerUser = users.find(
        (u) => u._id.toString() === projectManager,
      );

      //  SIMPLE AUTO INCREMENT LOGIC
      const lastProject = await Project.findOne({
        customerId: loggedInUser.customerId,
      })
        .sort({ createdAt: -1 })
        .select("projectId")
        .lean();

      let nextNumber = 1;

      if (lastProject && lastProject.projectId) {
        const lastNumber = parseInt(lastProject.projectId.split("-")[1]);
        nextNumber = lastNumber + 1;
      }

      const padded = String(nextNumber).padStart(3, "0");
      const projectId = `SBPROJECT-${padded}`;

      const project = await Project.create({
        customerId: loggedInUser.customerId,
        projectId,
        projectName,
        projectHead: headUser.userName,
        projectManager: managerUser.userName,
        startDate,
        endDate,
        projectDescription,
        status: STATUS.ACTIVE,
        createdBy: loggedInUser.userName,
      });

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Project",
        entityId: project._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created project ${project.projectName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          projectId: project.projectId,
          projectName: project.projectName,
          projectHead: project.projectHead,
          projectManager: project.projectManager,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async get(query, loggedInUser) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      };

      const [projects, total] = await Promise.all([
        Project.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Project.countDocuments(filter),
      ]);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          page,
          limit,
          projects,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid project ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      const allowedFields = [
        "projectName",
        "startDate",
        "endDate",
        "projectDescription",
        "manualEntry",
      ];

      for (const key of allowedFields) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      // Date validation
      if (
        updateData.startDate &&
        updateData.endDate &&
        new Date(updateData.startDate) > new Date(updateData.endDate)
      ) {
        return {
          success: false,
          data: { message: "End date cannot be before start date" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // If projectHead is updated (ObjectId → convert to name)
      if (data.projectHead) {
        if (!mongoose.Types.ObjectId.isValid(data.projectHead)) {
          return {
            success: false,
            data: { message: "Invalid project head ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const headUser = await User.findOne({
          _id: data.projectHead,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        })
          .select("userName")
          .lean();

        if (!headUser) {
          return {
            success: false,
            data: { message: "Invalid project head" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        updateData.projectHead = headUser.userName;
      }

      // If projectManager is updated
      if (data.projectManager) {
        if (!mongoose.Types.ObjectId.isValid(data.projectManager)) {
          return {
            success: false,
            data: { message: "Invalid project manager ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const managerUser = await User.findOne({
          _id: data.projectManager,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        })
          .select("userName")
          .lean();

        if (!managerUser) {
          return {
            success: false,
            data: { message: "Invalid project manager" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        updateData.projectManager = managerUser.userName;
      }

      const updated = await Project.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        },
        updateData,
        { new: true },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Project not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Project",
        entityId: updated._id,
        actionType: "Updated",
        description: `${loggedInUser.userName} updated project ${updated.projectName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: updated,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(id, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid project ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const deleted = await Project.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        },
        {
          status: STATUS.INACTIVE,
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { message: "Project not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Project",
        entityId: deleted._id,
        actionType: "Deleted",
        description: `${loggedInUser.userName} deleted project ${deleted.projectName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Project deleted successfully" },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
