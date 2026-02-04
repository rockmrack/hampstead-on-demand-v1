import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const securityForm: IntakeFormDefinition = {
  category: "security",
  title: "Hampstead Security — Protect Your Home",
  subtitle:
    "Professional security solutions: alarms, CCTV, smart locks, and access control.",

  subcategories: [
    { value: "alarm_install", label: "Alarm installation" },
    { value: "alarm_repair", label: "Alarm repair / service" },
    { value: "cctv", label: "CCTV installation" },
    { value: "smart_locks", label: "Smart locks & access" },
    { value: "intercom", label: "Intercom / video doorbell" },
    { value: "safe", label: "Safe installation" },
    { value: "security_assessment", label: "Security assessment" },
    { value: "monitoring", label: "24/7 monitoring setup" },
    { value: "other", label: "Other" },
  ],

  sections: [
    {
      key: "service",
      title: "What do you need?",
      description: "Tell us about your security requirements.",
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
      description: "When do you need us?",
      order: 3,
    },
    {
      key: "access",
      title: "Access & contact",
      description: "How we'll reach you.",
      order: 4,
    },
  ],

  defaultUrgency: "this_week",
  urgencies: [
    {
      value: "emergency",
      label: "Urgent (security breach / break-in)",
      hint: "Immediate security concern requiring rapid response.",
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
      label: "Type of security service",
      input: "single_select",
      options: [
        { value: "alarm_install", label: "Alarm installation", hint: "New burglar alarm system" },
        { value: "alarm_repair", label: "Alarm repair / service", hint: "Fix or maintain existing system" },
        { value: "cctv", label: "CCTV installation", hint: "Security cameras inside or outside" },
        { value: "smart_locks", label: "Smart locks & access", hint: "Keyless entry, smart locks" },
        { value: "intercom", label: "Intercom / video doorbell", hint: "Ring, Nest, or wired systems" },
        { value: "safe", label: "Safe installation", hint: "Home safe fitting" },
        { value: "security_assessment", label: "Security assessment", hint: "Professional security review" },
        { value: "monitoring", label: "24/7 monitoring setup", hint: "Professional monitoring service" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "service", order: 2 },
    },
    {
      key: "work_description",
      label: "Describe what you need",
      input: "long_text",
      placeholder: "Tell us about your security requirements, any existing systems, and what you want to achieve.",
      validation: [{ type: "required" }, { type: "minLength", value: 20 }],
      ui: { section: "service", order: 3 },
    },
    {
      key: "existing_system",
      label: "Do you have an existing security system?",
      input: "single_select",
      options: [
        { value: "none", label: "No existing system" },
        { value: "alarm_only", label: "Alarm only" },
        { value: "cctv_only", label: "CCTV only" },
        { value: "both", label: "Both alarm and CCTV" },
        { value: "smart_home", label: "Smart home system" },
        { value: "unknown", label: "Not sure" },
      ],
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
      key: "property_size",
      label: "Property size",
      input: "single_select",
      options: [
        { value: "small", label: "Small (1-2 bedrooms)" },
        { value: "medium", label: "Medium (3-4 bedrooms)" },
        { value: "large", label: "Large (5+ bedrooms)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 2 },
    },
    {
      key: "entry_points",
      label: "How many external doors?",
      input: "single_select",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4+", label: "4 or more" },
      ],
      ui: { section: "property", order: 3 },
    },
    {
      key: "floors",
      label: "How many floors?",
      input: "single_select",
      options: [
        { value: "1", label: "1 (ground floor only)" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4+", label: "4 or more" },
      ],
      ui: { section: "property", order: 4 },
    },

    // Schedule
    {
      key: "preferred_time",
      label: "Preferred time",
      input: "single_select",
      options: [
        { value: "morning", label: "Morning" },
        { value: "afternoon", label: "Afternoon" },
        { value: "flexible", label: "Flexible" },
      ],
      ui: { section: "schedule", order: 1 },
    },
    {
      key: "start_date",
      label: "When would you like this done?",
      input: "single_select",
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "this_week", label: "This week" },
        { value: "next_week", label: "Next week" },
        { value: "specific", label: "Specific date (we'll contact you)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 2 },
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
        { value: "arrange", label: "Will arrange access" },
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
