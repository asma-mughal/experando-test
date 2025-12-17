import Service from "../models/ServiceModel.js";
import {User} from '../models/UserModel.js';
import { sendEmail } from "../services/emailService.js";
export const createService = async (req, res) => {
  try {
    const {
      jobName,
      ownerName,
      jobDescription,
      urgency,
      location,
      pictures,
      user,
      startDate,
      endDate,
      status,
      categoryId,
    } = req.body;

    if (!user) {
      return res.status(400).json({ error: "User Id is required." });
    }
    if (!jobName) {
      return res.status(400).json({ error: "Job Name is required." });
    }
    if (!ownerName) {
      return res.status(400).json({ error: "Owner name is required." });
    }
    if (!location) {
      return res.status(400).json({ error: "Location is required." });
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const serviceData = {
      user,
      jobName,
      ownerName,
      jobDescription,
      urgency,
      location,
      pictures,
      startDate,
      endDate,
      status,
      categoryId: categoryId || null,
    };
    
    const service = new Service(serviceData);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
export const deleteService = async (req, res) => {
  try {
  
    const service = await Service.findOneAndDelete({
      _id: req.params.serviceId,
    });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const updateService = async (req, res) => {
  const {
    jobName,
    ownerName,
    jobDescription,
    urgency,
    location,
    pictures,
    startDate,
    endDate,
    status,
  } = req.body;

  try {
    // Find the service by ID
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    if (jobName !== undefined) service.jobName = jobName;
    if (ownerName !== undefined) service.ownerName = ownerName;
    if (jobDescription !== undefined) service.jobDescription = jobDescription;
    if (urgency !== undefined) service.urgency = urgency;
    if (location !== undefined) service.location = location;
    if (pictures !== undefined) service.pictures = pictures;
    if (startDate !== undefined) service.startDate = startDate;
    if (endDate !== undefined) service.endDate = endDate;
    if (status !== undefined) service.status = status;

    await service.save();

    res.status(200).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getAllServices = async (req, res) => {
  const { id, userId } = req.query;

  const userPopulateOptions = {
    path: "user",
    select:
      "fullName email phoneNumber userType profilePicture isVerified isActive jobsDone totalHires stripeCustomerId googleId facebookId createdAt updatedAt",
  };

  try {
    if (id) {
      const service = await Service.findById(id).populate(userPopulateOptions);

      if (!service || !service.user?.isActive) {
        return res.status(200).json([]);
      }

      return res.status(200).json(service);
    } else if (userId) {
      const userServices = await Service.find({ user: userId }).populate(
        userPopulateOptions
      );

      const activeServices = userServices.filter(
        (s) => s.user && s.user.isActive
      );

      return res.status(200).json(activeServices);
    } else {
      const services = await Service.find().populate(userPopulateOptions);

      const activeServices = services.filter(
        (s) => s.user && s.user.isActive
      );

      return res.status(200).json(activeServices);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
export const deleteAllServices = async (req, res) => {
  try {
    const result = await Service.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} services`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting services", 
      error: error.message 
    });
  }
};