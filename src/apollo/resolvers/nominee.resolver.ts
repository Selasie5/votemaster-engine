import { nomineeController } from "../../controllers/nominees/nominee.controller";

export const nomineeResolver = {
  Query: {
    getNomineeForm: nomineeController.getNomineeForm,
    getNominees: nomineeController.getNominees,
    getNominee: async (_: any, args: any, context: any) => {
      return await nomineeController.getNominees(_, { eventId: null, categoryId: null, ...args }, context);
    }
  },
  
  Mutation: {
    createNomineeForm: nomineeController.createNomineeForm,
    updateNomineeForm: async (_: any, args: any, context: any) => {
      // Update form implementation
      try {
        const { formId, input } = args;
        const NomineeForm = (await import("../../models/nomineeForm.model")).default;
        
        if (!context?.user?.id) {
          return {
            code: 401,
            success: false,
            message: 'Authentication required'
          };
        }

        const updatedForm = await NomineeForm.findByIdAndUpdate(
          formId,
          {
            formFields: input.formFields.map((field: any, index: number) => ({
              ...field,
              order: field.order || index + 1
            })),
            isActive: true
          },
          { new: true, runValidators: true }
        ).populate('event category');

        if (!updatedForm) {
          return {
            code: 404,
            success: false,
            message: 'Nominee form not found'
          };
        }

        return {
          code: 200,
          success: true,
          message: 'Nominee form updated successfully',
          data: updatedForm
        };

      } catch (error) {
        return {
          code: 500,
          success: false,
          message: 'Internal server error'
        };
      }
    },
    createNominee: nomineeController.createNominee,
    updateNominee: nomineeController.updateNominee,
    deleteNominee: nomineeController.deleteNominee
  }
};
