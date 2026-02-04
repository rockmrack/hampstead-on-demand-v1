import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const cleaningForm: IntakeFormDefinition = {
  category: "cleaning",
  title: "Hampstead Cleaning — Book a service",
  subtitle:
    "Professional cleaning for your home. Regular, deep clean, or one-off services.",

  subcategories: [
    { value: "regular", label: "Regular cleaning" },
    { value: "deep_clean", label: "Deep clean" },
    { value: "end_of_tenancy", label: "End of tenancy" },
    { value: "move_in", label: "Move-in clean" },
    { value: "post_construction", label: "Post-construction clean" },
    { value: "carpet", label: "Carpet & upholstery" },
    { value: "windows", label: "Window cleaning" },
    { value: "oven", label: "Oven cleaning" },
    { value: "other", label: "Other" },
  ],

  sections: [
    {
      key: "service",
      title: "What do you need?",
      description: "Tell us about your cleaning requirements.",
      order: 1,
    },
    {
      key: "property",
      title: "Property details",
      description: "Help us understand the scope of work.",
      order: 2,
    },
    {
      key: "schedule",
      title: "Schedule",
      description: "When and how often do you need us?",
      order: 3,
    },
    {
      key: "access",
      title: "Access & contact",
      description: "How we'll reach you and your property.",
      order: 4,
    },
  ],

  defaultUrgency: "this_week",
  urgencies: [
    {
      value: "emergency",
      label: "Urgent (within 24-48 hours)",
      hint: "Last-minute move, viewing, or event.",
    },
    {
      value: "this_week",
      label: "This week",
      hint: "We'll propose the soonest suitable slot.",
    },
    {
      value: "flexible",
      label: "Flexible",
      hint: "Happy to schedule at your convenience.",
    },
  ],

  serviceArea: {
    allowedPostcodes,
    rejectTitle: "Currently members-only in NW3, NW6 and NW8",
    rejectBody:
      "We're expanding soon. Join the waitlist and we'll notify you when your area opens.",
  },

  questions: [
    {
      key: "postcode",
      label: "Postcode",
      helpText: "We currently serve NW3 / NW6 / NW8 only.",
      input: "short_text",
      placeholder: "e.g. NW3 1AA",
      validation: [
        { type: "required" },
        {
          type: "regex",
          value: "^[A-Za-z]{1,2}\\d{1,2}[A-Za-z]?\\s?\\d[A-Za-z]{2}$",
          message: "Enter a valid UK postcode.",
        },
      ],
      ui: { section: "service", order: 1 },
    },
    {
      key: "subcategory",
      label: "Type of cleaning",
      input: "single_select",
      options: [
        { value: "regular", label: "Regular cleaning", hint: "Weekly, fortnightly or monthly" },
        { value: "deep_clean", label: "Deep clean", hint: "Thorough one-off clean" },
        { value: "end_of_tenancy", label: "End of tenancy", hint: "Move-out standard" },
        { value: "move_in", label: "Move-in clean", hint: "Before you settle in" },
        { value: "post_construction", label: "Post-construction clean", hint: "After building work" },
        { value: "carpet", label: "Carpet & upholstery", hint: "Professional extraction cleaning" },
        { value: "windows", label: "Window cleaning", hint: "Interior and exterior" },
        { value: "oven", label: "Oven cleaning", hint: "Professional oven restoration" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "service", order: 2 },
    },
    {
      key: "additional_services",
      label: "Any additional services?",
      input: "multi_select",
      options: [
        { value: "ironing", label: "Ironing" },
        { value: "laundry", label: "Laundry" },
        { value: "fridge", label: "Inside fridge" },
        { value: "oven", label: "Inside oven" },
        { value: "windows_interior", label: "Interior windows" },
        { value: "organising", label: "Organising / decluttering" },
      ],
      ui: { section: "service", order: 3 },
    },
    {
      key: "special_requirements",
      label: "Any special requirements?",
      helpText: "Eco-friendly products, pets, allergies, etc.",
      input: "long_text",
      placeholder: "Tell us about any specific needs or preferences.",
      ui: { section: "service", order: 4 },
    },

    // Property details
    {
      key: "property_type",
      label: "Property type",
      input: "single_select",
      options: [
        { value: "flat", label: "Flat" },
        { value: "maisonette", label: "Maisonette" },
        { value: "terraced", label: "Terraced house" },
        { value: "semi", label: "Semi-detached" },
        { value: "detached", label: "Detached house" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 1 },
    },
    {
      key: "bedrooms",
      label: "Number of bedrooms",
      input: "single_select",
      options: [
        { value: "studio", label: "Studio" },
        { value: "1", label: "1 bedroom" },
        { value: "2", label: "2 bedrooms" },
        { value: "3", label: "3 bedrooms" },
        { value: "4", label: "4 bedrooms" },
        { value: "5+", label: "5+ bedrooms" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 2 },
    },
    {
      key: "bathrooms",
      label: "Number of bathrooms",
      input: "single_select",
      options: [
        { value: "1", label: "1 bathroom" },
        { value: "2", label: "2 bathrooms" },
        { value: "3", label: "3 bathrooms" },
        { value: "4+", label: "4+ bathrooms" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 3 },
    },
    {
      key: "current_condition",
      label: "Current condition",
      input: "single_select",
      options: [
        { value: "well_maintained", label: "Well maintained", hint: "Regular cleaning" },
        { value: "needs_attention", label: "Needs attention", hint: "Not cleaned recently" },
        { value: "heavily_soiled", label: "Heavily soiled", hint: "Significant cleaning needed" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 4 },
    },

    // Schedule
    {
      key: "frequency",
      label: "How often?",
      input: "single_select",
      options: [
        { value: "one_off", label: "One-off" },
        { value: "weekly", label: "Weekly" },
        { value: "fortnightly", label: "Fortnightly" },
        { value: "monthly", label: "Monthly" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 1 },
    },
    {
      key: "preferred_day",
      label: "Preferred day(s)",
      input: "multi_select",
      options: [
        { value: "monday", label: "Monday" },
        { value: "tuesday", label: "Tuesday" },
        { value: "wednesday", label: "Wednesday" },
        { value: "thursday", label: "Thursday" },
        { value: "friday", label: "Friday" },
        { value: "saturday", label: "Saturday" },
      ],
      ui: { section: "schedule", order: 2 },
    },
    {
      key: "preferred_time",
      label: "Preferred time",
      input: "single_select",
      options: [
        { value: "morning", label: "Morning (8am-12pm)" },
        { value: "afternoon", label: "Afternoon (12pm-5pm)" },
        { value: "flexible", label: "Flexible" },
      ],
      ui: { section: "schedule", order: 3 },
    },
    {
      key: "start_date",
      label: "When would you like to start?",
      input: "single_select",
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "next_week", label: "Next week" },
        { value: "specific", label: "Specific date (we'll contact you)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 4 },
    },

    // Access
    {
      key: "access_method",
      label: "How will our team access the property?",
      input: "single_select",
      options: [
        { value: "someone_home", label: "Someone will be home" },
        { value: "key_safe", label: "Key safe / lockbox" },
        { value: "concierge", label: "Building concierge" },
        { value: "key_collection", label: "Key collection (arrange separately)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "access", order: 1 },
    },
    {
      key: "contact_phone",
      label: "Contact phone number",
      input: "phone",
      placeholder: "07xxx xxxxxx",
      validation: [{ type: "required" }],
      ui: { section: "access", order: 2 },
    },
  ],
};
