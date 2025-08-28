import Organization from "../../models/organization.model";
import bcrypt from "bcrypt";
import { JWTUtils } from "../../utils/jwtUtils";
import { logger } from "../../utils/logger";
export const authController = {
  registerOrganization: async (_: any, args: any, context: any) => {
    const { name, password, description, phoneNumber, contactEmail } = args;
    try {
      const organizationExists = await Organization.findOne({
        name,
        contactEmail,
      });
      if (organizationExists) {
        throw new Error("Organization already exists");
        return {
          code: 400,
          success: false,
          message: "Organization already exists",
        };
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const organization = await Organization.create({
        name,
        password: hashedPassword,
        description,
        phoneNumber,
        contactEmail,
      });

      const token = JWTUtils.__generateToken({
        id: organization._id,
        name: organization.name,
        email: organization.contactEmail,
      });
      await context.user.updateOne({
        $push: { organizations: organization._id },
      });
      return {
        code: 200,
        success: true,
        message: "Organization registered successfully",
        data: {
          organization,
          token,
        },
      };
      logger.info("Organization registered successfully");
    } catch (error) {
      console.error(error);
      throw new Error("Failed to register organization");
      return {
        code: 500,
        success: false,
        message: "Failed to register organization",
        data: null,
      };
    }
  },
  login: async (_: any, args: any, context: any) => {
    const { contactEmail, password } = args;
    try {
      const organization = await Organization.findOne({
        contactEmail: contactEmail,
      });
      if (!organization) {
        throw new Error("Organization not found");
        return {
          code: 404,
          success: false,
          message: "Organization not found",
          data: null,
        };
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        organization.password,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid password");
        return {
          code: 401,
          success: false,
          message: "Invalid password",
          data: null,
        };
      }
      const token = JWTUtils.__generateToken({
        id: organization._id,
        name: organization.name,
        email: organization.contactEmail,
      });
      return {
        code: 200,
        success: true,
        message: "Organization logged in successfully",
        data: {
          organization,
          token,
        },
      };
      logger.info("Organization logged in successfully");
    } catch (error) {
      console.error(error);
      throw new Error("Failed to login organization");
      return {
        code: 500,
        success: false,
        message: "Failed to login organization",
        data: null,
      };
    }
  },
};
