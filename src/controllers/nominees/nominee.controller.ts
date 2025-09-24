import Nominee from "../../models/nominee.model";
import NomineeForm from "../../models/nomineeForm.model";
import Event from "../../models/event.model";
import Category from "../../models/category.model";
import { logger } from "../../utils/logger";

export const nomineeController = {
  createNomineeForm: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        logger.warn("Unauthorized attempt to create nominee form");
        return {
          code: 401,
          success: false,
          message: 'Authentication required to create nominee form'
        };
      }

      const { eventId, categoryId, formFields } = args.input;

      const event = await Event.findById(eventId);
      const category = await Category.findById(categoryId);

      if (!event || !category) {
        return {
          code: 404,
          success: false,
          message: 'Event or category not found'
        };
      }

      const existingForm = await NomineeForm.findOne({ event: eventId, category: categoryId });
      if (existingForm) {
        return {
          code: 409,
          success: false,
          message: 'Nominee form already exists for this event/category'
        };
      }

      const nomineeForm = await NomineeForm.create({
        event: eventId,
        category: categoryId,
        formFields: formFields.map((field: any, index: number) => ({
          ...field,
          order: field.order || index + 1
        })),
        createdBy: context.user.id,
        isActive: true
      });

      logger.info(`Nominee form created for event ${eventId}, category ${categoryId}`);

      return {
        code: 201,
        success: true,
        message: 'Nominee form created successfully',
        data: nomineeForm
      };

    } catch (error:any) {
      logger.error('Error creating nominee form:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  // Get nominee form for a specific event/category
  getNomineeForm: async (_: any, args: any, context: any) => {
    try {
      const { eventId, categoryId } = args;

      const nomineeForm = await NomineeForm.findOne({
        event: eventId,
        category: categoryId,
        isActive: true
      }).populate('event category');

      if (!nomineeForm) {
        return {
          code: 404,
          success: false,
          message: 'Nominee form not found'
        };
      }

      return {
        code: 200,
        success: true,
        data: nomineeForm
      };

    } catch (error:any) {
      logger.error('Error fetching nominee form:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  createNominee: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        logger.warn("Unauthorized attempt to create a nominee");
        return {
          code: 401,
          success: false,
          message: 'Authentication required to create a nominee'
        };
      }

      const { fullName, description, category, event, imageURL, dynamicFields } = args.nominee;

      const eventDoc = await Event.findById(event);
      const categoryDoc = await Category.findById(category);

      if (!eventDoc || !categoryDoc) {
        return {
          code: 404,
          success: false,
          message: 'Event or category not found'
        };
      }

      const nomineeForm = await NomineeForm.findOne({
        event,
        category,
        isActive: true
      });

      if (nomineeForm) {
        const validationResult = await nomineeController.validateDynamicFields(dynamicFields || {}, nomineeForm.formFields || []);
        if (!validationResult.isValid) {
          return {
            code: 400,
            success: false,
            message: `Validation failed: ${validationResult.errors.join(', ')}`
          };
        }
      }

     
      const existingNominee = await Nominee.findOne({
        fullName,
        category,
        event,
        isActive: true
      });

      if (existingNominee) {
        return {
          code: 409,
          success: false,
          message: 'A nominee with this name already exists in this category'
        };
      }

      const nominee = await Nominee.create({
        fullName,
        description,
        category,
        event,
        imageURL,
        dynamicFields: dynamicFields || {},
        createdBy: context.user.id,
        isActive: true,
        voteCount: 0
      });

      await nominee.populate('category event');

      logger.info(`Nominee created: ${nominee.fullName} for event ${event}`);

      return {
        code: 201,
        success: true,
        message: 'Nominee created successfully',
        data: nominee
      };

    } catch (error:any) {
      logger.error('Error creating nominee:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  
  getNominees: async (_: any, args: any, context: any) => {
    try {
      const { eventId, categoryId, page = 1, limit = 20, sortBy = 'fullName', sortOrder = 'asc' } = args;

      const query: any = { isActive: true };
      if (eventId) query.event = eventId;
      if (categoryId) query.category = categoryId;

      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const nominees = await Nominee.find(query)
        .populate('category event')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Nominee.countDocuments(query);

      return {
        code: 200,
        success: true,
        data: {
          nominees,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error:any) {
      logger.error('Error fetching nominees:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  
  updateNominee: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        return {
          code: 401,
          success: false,
          message: 'Authentication required'
        };
      }

      const { nomineeId, updates } = args;

      const nominee = await Nominee.findById(nomineeId);
      if (!nominee) {
        return {
          code: 404,
          success: false,
          message: 'Nominee not found'
        };
      }

     
      if (updates.dynamicFields) {
        const nomineeForm = await NomineeForm.findOne({
          event: nominee.event,
          category: nominee.category,
          isActive: true
        });

        if (nomineeForm) {
          const validationResult = await nomineeController.validateDynamicFields(updates.dynamicFields || {}, nomineeForm.formFields || []);
          if (!validationResult.isValid) {
            return {
              code: 400,
              success: false,
              message: `Validation failed: ${validationResult.errors.join(', ')}`
            };
          }
        }
      }

      const updatedNominee = await Nominee.findByIdAndUpdate(
        nomineeId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('category event');

      return {
        code: 200,
        success: true,
        message: 'Nominee updated successfully',
        data: updatedNominee
      };

    } catch (error:any) {
      logger.error('Error updating nominee:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },

  deleteNominee: async (_: any, args: any, context: any) => {
    try {
      if (!context?.user?.id) {
        return {
          code: 401,
          success: false,
          message: 'Authentication required'
        };
      }

      const { nomineeId } = args;

      const nominee = await Nominee.findById(nomineeId);
      if (!nominee) {
        return {
          code: 404,
          success: false,
          message: 'Nominee not found'
        };
      }

      
      await Nominee.findByIdAndUpdate(nomineeId, { isActive: false });

      logger.info(`Nominee deleted: ${nominee.fullName}`);

      return {
        code: 200,
        success: true,
        message: 'Nominee deleted successfully'
      };

    } catch (error:any) {
      logger.error('Error deleting nominee:', error);
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      };
    }
  },


  validateDynamicFields: async (dynamicFields: any, formFields: any[]): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];

    for (const formField of formFields) {
      const fieldValue = dynamicFields[formField.fieldId];

   
      if (formField.required && (!fieldValue || fieldValue === '')) {
        errors.push(`${formField.label} is required`);
        continue;
      }


      if (!fieldValue) continue;

     
      switch (formField.fieldType) {
        case 'EMAIL':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue)) {
            errors.push(`${formField.label} must be a valid email address`);
          }
          break;

        case 'PHONE':
          const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
          if (!phoneRegex.test(fieldValue)) {
            errors.push(`${formField.label} must be a valid phone number`);
          }
          break;

        case 'NUMBER':
          if (isNaN(Number(fieldValue))) {
            errors.push(`${formField.label} must be a valid number`);
          } else if (formField.validation) {
            const num = Number(fieldValue);
            if (formField.validation.min !== undefined && num < formField.validation.min) {
              errors.push(`${formField.label} must be at least ${formField.validation.min}`);
            }
            if (formField.validation.max !== undefined && num > formField.validation.max) {
              errors.push(`${formField.label} must not exceed ${formField.validation.max}`);
            }
          }
          break;

        case 'TEXT':
        case 'TEXTAREA':
          if (formField.validation) {
            if (formField.validation.min && fieldValue.length < formField.validation.min) {
              errors.push(`${formField.label} must be at least ${formField.validation.min} characters`);
            }
            if (formField.validation.max && fieldValue.length > formField.validation.max) {
              errors.push(`${formField.label} must not exceed ${formField.validation.max} characters`);
            }
            if (formField.validation.pattern) {
              const regex = new RegExp(formField.validation.pattern);
              if (!regex.test(fieldValue)) {
                errors.push(formField.validation.errorMessage || `${formField.label} format is invalid`);
              }
            }
          }
          break;

        case 'SELECT':
        case 'RADIO':
          if (formField.options && !formField.options.includes(fieldValue)) {
            errors.push(`${formField.label} must be one of: ${formField.options.join(', ')}`);
          }
          break;

        case 'CHECKBOX':
          if (!Array.isArray(fieldValue)) {
            errors.push(`${formField.label} must be an array`);
          } else if (formField.options) {
            const invalidOptions = fieldValue.filter((val: string) => !formField.options.includes(val));
            if (invalidOptions.length > 0) {
              errors.push(`${formField.label} contains invalid options: ${invalidOptions.join(', ')}`);
            }
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
