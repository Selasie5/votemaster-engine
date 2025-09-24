import Event from "../../models/event.model";
import { logger } from "../../utils/logger";
export const eventController = {
  createEvent: async (_: any, args: any, context: any) => {
    const {
      name,
      description,
      organization,
      slug,
      eventImage,
      pricePerVote,
      startDate,
      endDate,
    } = args.event;

    try {
      if (!context?.user?.id) {
        logger.warn(
          "Unauthorized attempt to create event - no user in context",
        );
        return {
          code: 401,
          success: false,
          message: "Authentication required to create an event",
        };
      }
      const eventExists = await Event.findOne({ name });
      if (eventExists) {
        logger.warn("Event already exists");
        return {
          code: 400,
          success: false,
          message: "Event already exists",
        };
      }
      const urlSlug = name?.toLowerCase()?.replace(/\s+/g, "-");
      const event = await Event.create({
        name,
        description,
        slug: urlSlug,
        organization: context?.user?.id.toString(),
        eventImage,
        pricePerVote,
        startDate,
        endDate,
      });
      const populatedEvent = await Event.findById(event._id).populate(
        "organization",
      );
      logger.info("Event created successfully");
      return {
        code: 200,
        success: true,
        message: "Event created successfully",
        data: populatedEvent,
      };
    } catch (error:any) {
      logger.error("Failed to create event", error);
      return {
        code: 500,
        success: false,
        message: "Failed to create event",
      };
    }
  },
  getEvents: async (_: any, args: any, context: any) => {
    const { limit, offset } = args;
    try {
      if (!context?.user?.id) {
        logger.warn(
          "Unauthorized attempt to create event - no user in context",
        );
        return {
          code: 401,
          success: false,
          message: "Authentication required to create an event",
        };
      }
      const events = await Event.find()
        .skip(offset)
        .limit(limit)
        .populate("organization");
      logger.info("Events fetched successfully");
      return {
        code: 200,
        success: true,
        message: "Events fetched successfully",
        data: events,
      };
    } catch (error) {
      logger.error("Failed to fetch events");
      return {
        code: 500,
        success: false,
        message: "Failed to fetch events",
      };
    }
  },
  getEventById: async (_: any, args: any, context: any) => {
    const { id } = args;
    try {
      if (!context?.user?.id) {
        logger.warn(
          "Unauthorized attempt to create event - no user in context",
        );
        return {
          code: 401,
          success: false,
          message: "Authentication required to create an event",
        };
      }
      const event = await Event.findById(id).populate("organization");
      logger.info("Event fetched successfully");
      return {
        code: 200,
        success: true,
        message: "Event fetched successfully",
        data: event,
      };
    } catch (error) {
      logger.error("Failed to fetch event");
      return {
        code: 500,
        success: false,
        message: "Failed to fetch event",
      };
    }
  },
  updateEvent: async (_: any, args: any, context: any) => {
    const {
      id,
      title,
      description,
      startDate,
      endDate,
      location,
      organizationId,
    } = args;
    try {
      if (!context?.user?.id) {
        logger.warn(
          "Unauthorized attempt to create event - no user in context",
        );
        return {
          code: 401,
          success: false,
          message: "Authentication required to create an event",
        };
      }
      const event = await Event.findByIdAndUpdate(
        id,
        { title, description, startDate, endDate, location, organizationId },
        { new: true },
      ).populate("organization");
      logger.info("Event updated successfully");
      return {
        code: 200,
        success: true,
        message: "Event updated successfully",
        data: event,
      };
    } catch (error) {
      logger.error("Failed to update event");
      return {
        code: 500,
        success: false,
        message: "Failed to update event",
      };
    }
  },
  deleteEvent: async (_: any, args: any, context: any) => {
    const { id } = args;
    try {
      const event = await Event.findByIdAndDelete(id);
      logger.info("Event deleted successfully");
      return {
        code: 200,
        success: true,
        message: "Event deleted successfully",
        data: event,
      };
    } catch (error) {
      logger.error("Failed to delete event");
      return {
        code: 500,
        success: false,
        message: "Failed to delete event",
      };
    }
  },
};
