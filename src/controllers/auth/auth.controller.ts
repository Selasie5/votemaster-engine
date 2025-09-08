import Organization from "../../models/organization.model";
import bcrypt from "bcrypt";
import { JWTUtils } from "../../utils/jwtUtils";
import { logger } from "../../utils/logger";
export const authController = {
  registerOrganization: async (_: any, args: any, context: any) => {
    const { name, password, description, phoneNumber, contactEmail } =
      args.createOrgInput;
    try {
      const organizationExists = await Organization.findOne({
        name,
        contactEmail,
      });
      if (organizationExists) {
        logger.info("Organization already exists");
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

      await organization.save();
      logger.info("Organization registered successfully");
      // await context.user.updateOne({
      //   $push: { organizations: organization._id },
      // });
      return {
        code: 200,
        success: true,
        message: "Organization registered successfully",
        token,
        data: organization,
      };
    } catch (error) {
      logger.error("Failed to register organization");
      return {
        code: 500,
        success: false,
        message: "Failed to register organization",
        data: null,
      };
    }
  },
  login: async (_: any, args: any, context: any) => {
    const { contactEmail, password } = args.loginInput;
    try {
      const organization = await Organization.findOne({
        contactEmail: contactEmail,
      });
      if (!organization) {
        logger.error("Organization not found");
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
        logger.error("Invalid password");
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
      logger.info("Organization logged in successfully");
      return {
        code: 200,
        success: true,
        message: "Organization logged in successfully",
        token,
        data: organization,
      };
    } catch (error) {
      logger.error("Failed to login organization");
      return {
        code: 500,
        success: false,
        message: "Failed to login organization",
        data: null,
      };
    }
  },
};
