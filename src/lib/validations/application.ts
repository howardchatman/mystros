import { z } from "zod";

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say"]).optional(),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;

// Step 2: Contact Information
export const contactInfoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "Please use 2-letter state code"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z
    .string()
    .min(1, "Emergency contact phone is required")
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
});

export type ContactInfoData = z.infer<typeof contactInfoSchema>;

// Step 3: Education Background
export const educationSchema = z.object({
  highSchoolName: z.string().optional(),
  highSchoolCity: z.string().optional(),
  highSchoolState: z.string().optional(),
  graduationYear: z.coerce.number().min(1950).max(2030).optional().nullable(),
  gedCompletionDate: z.string().optional(),
  highestEducation: z.enum([
    "high_school",
    "ged",
    "some_college",
    "associates",
    "bachelors",
    "masters",
    "doctoral",
  ]),
});

export type EducationData = z.infer<typeof educationSchema>;

// Step 4: Program Selection
export const programSelectionSchema = z.object({
  campusId: z.string().uuid("Please select a campus"),
  programId: z.string().uuid("Please select a program"),
  scheduleId: z.string().uuid("Please select a schedule"),
  desiredStartDate: z.string().min(1, "Please select a start date"),
});

export type ProgramSelectionData = z.infer<typeof programSelectionSchema>;

// Step 5: Background Information
export const backgroundSchema = z.object({
  hasFelonyConviction: z.boolean(),
  felonyExplanation: z.string().optional(),
  previousBarberTraining: z.boolean(),
  previousTrainingDetails: z.string().optional(),
});

export type BackgroundData = z.infer<typeof backgroundSchema>;

// Combined full application schema
export const applicationSchema = personalInfoSchema
  .merge(contactInfoSchema)
  .merge(educationSchema)
  .merge(programSelectionSchema)
  .merge(backgroundSchema);

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// All step schemas in order
export const stepSchemas = [
  personalInfoSchema,
  contactInfoSchema,
  educationSchema,
  programSelectionSchema,
  backgroundSchema,
] as const;

export const stepNames = [
  "Personal Info",
  "Contact Info",
  "Education",
  "Program",
  "Background",
] as const;
