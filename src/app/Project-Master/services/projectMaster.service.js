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
        slug, // frontend provides the slug directly
        customerId: customerIdFromForm,
      } = data;

      // ---------------------- REQUIRED FIELDS ----------------------
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

      // ---------------------- CUSTOMER ID ----------------------
      let customerId;
      if (loggedInUser.owner) {
        if (!customerIdFromForm) {
          return {
            success: false,
            data: { message: "customerId is required for owner" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
        if (!mongoose.Types.ObjectId.isValid(customerIdFromForm)) {
          return {
            success: false,
            data: { message: "Invalid customerId" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
        customerId = new mongoose.Types.ObjectId(customerIdFromForm);
      } else {
        if (!loggedInUser.customerId || !loggedInUser.customerId._id) {
          return {
            success: false,
            data: { message: "Customer ID missing in login token" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
        customerId = new mongoose.Types.ObjectId(loggedInUser.customerId._id);
      }

      // ---------------------- SLUG CHECK ----------------------
      const existingSlug = await Project.findOne({ slug, customerId }).lean();
      if (existingSlug && existingSlug.status !== STATUS.DELETED) {
        return {
          success: false,
          data: { message: "Slug already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      // ---------------------- VALIDATE USER IDS ----------------------
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

      // ---------------------- DATE VALIDATION ----------------------
      if (endDate && new Date(startDate) > new Date(endDate)) {
        return {
          success: false,
          data: { message: "End date cannot be before start date" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // ---------------------- FETCH USERS ----------------------
      const userIds = [projectHead, projectManager];
      const distinctUserIds = [...new Set(userIds)]; // allow same user

      const users = await User.find({
        _id: { $in: distinctUserIds },
        customerId,
        status: STATUS.ACTIVE,
      })
        .select("_id userName")
        .lean();

      if (users.length !== distinctUserIds.length) {
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

      // ---------------------- AUTO-INCREMENT PROJECT ID ----------------------
      const lastProject = await Project.findOne({ customerId })
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

      // ---------------------- CREATE PROJECT ----------------------
      const project = await Project.create({
        customerId,
        projectId,
        slug,
        projectName,
        projectHead: headUser.userName,
        projectManager: managerUser.userName,
        startDate,
        endDate,
        projectDescription,
        status: STATUS.ACTIVE,
        createdBy: loggedInUser.userName,
      });

      // ---------------------- LOG ACTIVITY ----------------------
      await logActivity({
        userId: loggedInUser._id,
        entityType: "Project",
        entityId: project._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created project ${project.projectName}`,
      });

      // ---------------------- RESPONSE ----------------------
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
        data: { message: err.message || "Internal server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async get(id, query, loggedInUser) {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      // ---------------------- BUILD FILTER ----------------------
      let baseFilter = {
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      };

      if (!loggedInUser.owner) {
        // Non-owner → only their own projects
        if (!loggedInUser.customerId || !loggedInUser.customerId._id) {
          return {
            success: false,
            data: { message: "Customer ID missing in login token" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
        baseFilter.customerId = new mongoose.Types.ObjectId(
          loggedInUser.customerId._id,
        );
      } else {
        // Owner → can filter by customerId from query if provided
        if (query.customerId) {
          if (!mongoose.Types.ObjectId.isValid(query.customerId)) {
            return {
              success: false,
              data: { message: "Invalid customerId" },
              statusCode: StatusCodes.BAD_REQUEST,
            };
          }
          baseFilter.customerId = new mongoose.Types.ObjectId(query.customerId);
        }
      }

      // ---------------------- GET SINGLE PROJECT ----------------------
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return {
            success: false,
            data: { message: "Invalid project ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const project = await Project.findOne({
          ...baseFilter,
          _id: new mongoose.Types.ObjectId(id),
        })
          .populate({
            path: "customerId",
            select: "_id customerId companyName customerName ", // populate customer info
          })
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

      // ---------------------- GET ALL PROJECTS ----------------------
      const [projects, total] = await Promise.all([
        Project.find(baseFilter)
          .populate({
            path: "customerId",
            select: "_id customerId companyName customerName ", // populate customer info
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Project.countDocuments(baseFilter),
      ]);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          projects,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message || "Internal server error" },
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

      // -------- Role-based filter --------
      const filter = { _id: id };
      if (!loggedInUser.owner) {
        if (!loggedInUser.customerId || !loggedInUser.customerId._id) {
          return {
            success: false,
            data: { message: "Customer ID missing in login token" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
        filter.customerId = new mongoose.Types.ObjectId(
          loggedInUser.customerId._id,
        );
      }

      const existingProject = await Project.findOne(filter).lean();
      if (!existingProject) {
        return {
          success: false,
          data: { message: "Project not found or you don't have permission" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const updateData = { updatedBy: loggedInUser.userName };

      // -------- Slug update with uniqueness check --------
      if (data.slug !== undefined) {
        const formattedSlug = data.slug.toLowerCase().trim();
        const slugExists = await Project.findOne({
          slug: formattedSlug,
          _id: { $ne: id },
          ...(loggedInUser.owner ? {} : { customerId: filter.customerId }),
        }).lean();

        if (slugExists && slugExists.status !== STATUS.DELETED) {
          return {
            success: false,
            data: { message: "Slug already exists" },
            statusCode: StatusCodes.CONFLICT,
          };
        }

        updateData.slug = formattedSlug;
      }

      // -------- Allowed fields --------
      const allowedFields = [
        "projectName",
        "projectDescription",
        "manualEntry",
        "status",
        "slug",
        "projectStatus",
      ];
      for (const key of allowedFields) {
        if (data[key] !== undefined) updateData[key] = data[key];
      }

      // -------- Date validation --------
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
      if (data.startDate !== undefined) updateData.startDate = data.startDate;
      if (data.endDate !== undefined) updateData.endDate = data.endDate;

      // -------- Project Head --------
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
          ...(loggedInUser.owner ? {} : { customerId: filter.customerId }),
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

      // -------- Project Manager --------
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
          ...(loggedInUser.owner ? {} : { customerId: filter.customerId }),
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

      // -------- Update project --------
      const updated = await Project.findOneAndUpdate(filter, updateData, {
        returnDocument: "after", // Mongoose v7+ replacement for `new: true`
        runValidators: true,
      }).lean();

      // -------- Log activity --------
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
        data: { message: err.message || "Internal server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(id, loggedInUser) {
    try {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid project ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // Build the filter based on user role
      let filter = {
        _id: id,
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      };

      if (!loggedInUser.owner) {
        // Non-owner → can delete only their own projects
        if (!loggedInUser.customerId || !loggedInUser.customerId._id) {
          return {
            success: false,
            data: { message: "Customer ID missing in login token" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
        filter.customerId = new mongoose.Types.ObjectId(
          loggedInUser.customerId._id,
        );
      }
      // Owner → no customerId filter, can delete any project

      const deleted = await Project.findOneAndUpdate(
        filter,
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { message: "Project not found or you don't have permission" },
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
        data: { message: err.message || "Internal server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  
  async getByCustomer(customerIdFromParams, loggedInUser) {    
    try {
      // Validate customerId
      if (!mongoose.Types.ObjectId.isValid(customerIdFromParams)) {
        return {
          success: false,
          data: { message: "Invalid customer ID" },
          statusCode: 400,
        };
      }

      let customerFilter;

      if (loggedInUser.owner) {
        // Owner: can access any customer projects
        customerFilter = new mongoose.Types.ObjectId(customerIdFromParams);
      } else {
        // Normal user: can only access their own customer
        if (!loggedInUser.customerId || !loggedInUser.customerId._id) {
          return {
            success: false,
            data: { message: "Customer ID missing in login token" },
            statusCode: 400,
          };
        }

        const userCustomerId = String(loggedInUser.customerId._id);
        if (customerIdFromParams !== userCustomerId) {
          return {
            success: false,
            data: { message: "You can only access your own customer projects" },
            statusCode: 403,
          };
        }

        customerFilter = new mongoose.Types.ObjectId(userCustomerId);
      }

      const projects = await Project.find({
        customerId: customerFilter,
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      })
        .populate("customerId", "companyName") // populate customer info
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        statusCode: 200,
        data: projects,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: 500,
      };
    }
  }
}
