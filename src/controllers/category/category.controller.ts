import Category from "../../models/category.model";
import Event from "../../models/event.model";
import { logger } from "../../utils/logger";

export const categoryController = {
  createCategory: async (_: any, args: any, context: any) => {
    const { input } = args;
    const { name, description, eventId } = input;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      const existingCategory = await Category.findOne({
        name: name.trim(),
        event: eventId,
      });

      if (existingCategory) {
        throw new Error(
          "Category with this name already exists for this event",
        );
      }

      const category = await Category.create({
        name: name.trim(),
        description: description.trim(),
        event: eventId,
      });

      const populatedCategory = await Category.findById(category._id).populate(
        "event",
      );

      logger.info(`Category created successfully: ${category.name}`);
      return populatedCategory;
    } catch (error: any) {
      logger.error(`Failed to create category: ${error.message}`);
      throw new Error(error.message || "Failed to create category");
    }
  },

  // Get all categories
  getCategories: async (_: any, args: any, context: any) => {
    try {
      const categories = await Category.find()
        .populate("event")
        .sort({ createdAt: -1 });
      return categories;
    } catch (error: any) {
      logger.error(`Failed to fetch categories: ${error.message}`);
      throw new Error("Failed to fetch categories");
    }
  },

  getCategory: async (_: any, args: any, context: any) => {
    const { id } = args;

    try {
      const category = await Category.findById(id).populate("event");

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    } catch (error: any) {
      logger.error(`Failed to fetch category: ${error.message}`);
      throw new Error(error.message || "Failed to fetch category");
    }
  },

  getCategoriesByEvent: async (_: any, args: any, context: any) => {
    const { eventId } = args;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      const categories = await Category.find({ event: eventId })
        .populate("event")
        .sort({ createdAt: -1 });

      return categories;
    } catch (error: any) {
      logger.error(`Failed to fetch categories by event: ${error.message}`);
      throw new Error(error.message || "Failed to fetch categories by event");
    }
  },

  updateCategory: async (_: any, args: any, context: any) => {
    const { input } = args;
    const { id, name, description, eventId } = input;

    try {
      const category = await Category.findById(id);

      if (!category) {
        throw new Error("Category not found");
      }

      if (eventId) {
        const event = await Event.findById(eventId);
        if (!event) {
          throw new Error("Event not found");
        }
      }

      if (name && name.trim() !== category.name) {
        const existingCategory = await Category.findOne({
          name: name.trim(),
          event: eventId || category.event,
          _id: { $ne: id },
        });

        if (existingCategory) {
          throw new Error(
            "Category with this name already exists for this event",
          );
        }
      }

      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (description) updateData.description = description.trim();
      if (eventId) updateData.event = eventId;
      updateData.updatedAt = new Date();

      const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("event");

      logger.info(`Category updated successfully: ${updatedCategory?.name}`);
      return updatedCategory;
    } catch (error: any) {
      logger.error(`Failed to update category: ${error.message}`);
      throw new Error(error.message || "Failed to update category");
    }
  },

  deleteCategory: async (_: any, args: any, context: any) => {
    const { id } = args;

    try {
      const category = await Category.findById(id);

      if (!category) {
        throw new Error("Category not found");
      }

      await Category.findByIdAndDelete(id);

      logger.info(`Category deleted successfully: ${category.name}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to delete category: ${error.message}`);
      throw new Error(error.message || "Failed to delete category");
    }
  },
};
