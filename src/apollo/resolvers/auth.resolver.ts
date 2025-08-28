import { authController } from "../../controllers/auth/auth.controller";

export const AuthResolver = {
  Query: {
    _authEmpty: () => "Auth placeholder query",
  },
  Mutation: {
    createOrganization: (_: any, args: any, context: any) => {
      return authController.registerOrganization(_, args, context);
    },
    login: (_: any, args: any, context: any) => {
      return authController.login(_, args, context);
    },
  },
};
