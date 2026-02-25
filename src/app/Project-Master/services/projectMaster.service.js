import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Project } from "../models/projectMaster.model.js";
import { User } from "../../CustomerMaster/models/userMaster.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";

export class ProjectMasterService {
  async create(data, loggedInUser) {
    try {
      const {
        projectName,
        projectHead,
        projectManager,
        startDate,
        endDate,
        projectDescription,
        slug,
      } = data;

      if (
        !projectName ||
        !projectHead ||
        !projectManager ||
        !startDate ||
        !slug
      ) {
        return {
          success: false,
          data: { message: "Required fields missing" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const formattedSlug = slug.toLowerCase().trim();

      // Check slug existence
      const existingSlug = await Project.findOne({
        slug: formattedSlug,
        customerId: loggedInUser.customerId,
      }).lean();

      if (existingSlug && existingSlug.status !== 2) {
        return {
          success: false,
          data: { message: "Slug already exists" },
          statusCode: StatusCodes.CONFLICT,
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

      // 🔥 Auto Increment Logic
      const lastProject = await Project.findOne({
        customerId: loggedInUser.customerId,
      })
        .sort({ createdAt: -1 })
        .select("projectId")
        .lean();

      let nextNumber = 1;

      if (lastProject?.projectId) {
        const lastNumber = parseInt(lastProject.projectId.split("-")[1]);
        nextNumber = lastNumber + 1;
      }

      const padded = String(nextNumber).padStart(3, "0");
      const projectId = `SBPROJECT-${padded}`;

      const project = await Project.create({
        customerId: loggedInUser.customerId,
        projectId,
        slug: formattedSlug,
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
          slug: project.slug,
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
      // const page = Number(query.page) || 1;
      // const limit = Number(query.limit) || 10;
      // const skip = (page - 1) * limit;

      const baseFilter = {
        customerId: new mongoose.Types.ObjectId(loggedInUser.customerId),
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      };

      // If projectId provided → return single project
      if (query) {
        if (!mongoose.Types.ObjectId.isValid(query)) {
          return {
            success: false,
            data: { message: "Invalid project ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const project = await Project.findOne({
          ...baseFilter,
          _id: new mongoose.Types.ObjectId(query),
        })
          .populate("customerId", "customerName")
          .lean();

        if (!project) {
          return {
            success: false,
            data: { message: "Project not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        return {
          success: true,
          statusCode: StatusCodes.OK,
          data: project,
        };
      }

      // Otherwise return paginated list
      const filter = baseFilter;

      const [projects, total] = await Promise.all([
        Project.find(filter)
          .populate("customerId", "customerName")
          .sort({ createdAt: -1 })
          .lean(),

        Project.countDocuments(filter),
      ]);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
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
    console.log("ProjectMasterService", data);
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid project ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const existingProject = await Project.findOne({
        _id: id,
        customerId: loggedInUser.customerId,
      }).lean();

      if (!existingProject) {
        return {
          success: false,
          data: { message: "Project not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      // -------- 1. Slug Update Logic --------
      if (data.slug !== undefined) {
        const formattedSlug = data.slug.toLowerCase().trim();

        const slugExists = await Project.findOne({
          slug: formattedSlug,
          customerId: loggedInUser.customerId,
          _id: { $ne: id },
        }).lean();

        if (slugExists && slugExists.status !== 2) {
          return {
            success: false,
            data: { message: "Slug already exists" },
            statusCode: StatusCodes.CONFLICT,
          };
        }

        updateData.slug = formattedSlug;
      }

      // -------- 2. Basic Allowed Fields --------
      const allowedFields = [
        "projectName",
        "projectDescription",
        "manualEntry",
        "status",
        "slug",
      ];

      for (const key of allowedFields) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      // -------- 3. Date Validation --------
      const newStartDate = data.startDate ?? existingProject.startDate;
      const newEndDate = data.endDate ?? existingProject.endDate;

      if (
        newStartDate &&
        newEndDate &&
        new Date(newStartDate) > new Date(newEndDate)
      ) {
        return {
          success: false,
          data: { message: "End date cannot be before start date" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (data.startDate !== undefined) {
        updateData.startDate = data.startDate;
      }

      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate;
      }

      // -------- 4. Project Head Update --------
      if (data.projectHead !== undefined) {
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

      // -------- 5. Project Manager Update --------
      if (data.projectManager !== undefined) {
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

      // -------- 6. Update --------
      const updated = await Project.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
        },
        updateData,
        { new: true, runValidators: true },
      ).lean();

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
          status: STATUS.DELETED,
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
