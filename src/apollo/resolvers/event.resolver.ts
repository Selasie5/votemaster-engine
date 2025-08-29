import { eventController } from "../../controllers/event/event.controller";

export const EventResolver = {
  Query: {
    getEvents: async (_: any, args: any, context: any) => {
      return eventController.getEvents(_, args, context);
    },
    getEventById: async (_: any, args: any, context: any) => {
      return eventController.getEventById(_, args, context);
    },
  },
  Mutation: {
    createEvent: async (_: any, args: any, context: any) => {
      return eventController.createEvent(_, args, context);
    },
    updateEvent: async (_: any, args: any, context: any) => {
      return eventController.updateEvent(_, args, context);
    },
    deleteEvent: async (_: any, args: any, context: any) => {
      return eventController.deleteEvent(_, args, context);
    },
  },
};
