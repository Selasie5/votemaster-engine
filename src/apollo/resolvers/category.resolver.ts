import { categoryController } from "../../controllers/category/category.controller";

export const categoryResolver = {
  Query: {
    categories: (_: any, args: any, context: any) => {
      return categoryController.getCategories(_, args, context);
    },
    category: (_: any, args: any, context: any) => {
      return categoryController.getCategory(_, args, context);
    },
    categoriesByEvent: (_: any, args: any, context: any) => {
      return categoryController.getCategoriesByEvent(_, args, context);
    },
  },
  Mutation: {
    createCategory: (_: any, args: any, context: any) => {
      return categoryController.createCategory(_, args, context);
    },
    updateCategory: (_: any, args: any, context: any) => {
      return categoryController.updateCategory(_, args, context);
    },
    deleteCategory: (_: any, args: any, context: any) => {
      return categoryController.deleteCategory(_, args, context);
    },
  },
};
