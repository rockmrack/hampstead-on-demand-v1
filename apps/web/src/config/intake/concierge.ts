import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const conciergeForm: IntakeFormDefinition = {
  category: "concierge",
  title: "Hampstead Concierge — Property Services",
  subtitle:
    "Property management, key holding, access coordination and bespoke property services.",

  subcategories: [
    { value: "key_holding", label: "Key holding & access" },
    { value: "property_checks", label: "Property checks" },
    { value: "contractor_access", label: "Contractor access coordination" },
    { value: "inventory", label: "Inventory & check-in/out" },
    { value: "mail_packages", label: "Mail & package handling" },
    { value: "meet_greet", label: "Meet & greet" },
    { value: "property_prep", label: "Property preparation" },
    { value: "emergency_contact", label: "Emergency contact service" },
    { value: "other", label: "Other" },
  ],

  sections: [
    {
      key: "service",
      title: "What do you need?",
      description: "Tell us about your concierge requirements.",
      order: 1,
    },
    {
      key: "property",
      title: "Property details",
      description: "Information about the property.",
      order: 2,
    },
    {
      key: "schedule",
      title: "Schedule & frequency",
      description: "When and how often do you need this service?",
      order: 3,
    },
    {
      key: "contact",
      title: "Contact details",
      description: "How to reach you.",
      order: 4,
    },
  ],

  defaultUrgency: "this_week",
  urgencies: [
    {
      value: "emergency",
      label: "Urgent (within 24 hours)",
      hint: "Emergency access or coordination needed.",
    },
    {
      value: "this_week",
      label: "This week",
      hint: "We'll arrange within the week.",
    },
    {
      value: "flexible",
      label: "Flexible / ongoing",
      hint: "Set up a regular arrangement.",
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
      label: "Property postcode",
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
      label: "Type of service",
      input: "single_select",
      options: [
        { value: "key_holding", label: "Key holding & access", hint: "We hold keys and provide access" },
        { value: "property_checks", label: "Property checks", hint: "Regular visits while you're away" },
        { value: "contractor_access", label: "Contractor access", hint: "Let in tradespeople on your behalf" },
        { value: "inventory", label: "Inventory & check-in/out", hint: "For lettings and tenancies" },
        { value: "mail_packages", label: "Mail & package handling", hint: "Collect and forward post" },
        { value: "meet_greet", label: "Meet & greet", hint: "Welcome guests or tenants" },
        { value: "property_prep", label: "Property preparation", hint: "Prepare property for arrival" },
        { value: "emergency_contact", label: "Emergency contact", hint: "24/7 point of contact" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "service", order: 2 },
    },
    {
      key: "service_details",
      label: "Tell us more about what you need",
      input: "long_text",
      placeholder: "Describe your requirements in detail. Include any specific instructions, timing, or special circumstances.",
      validation: [{ type: "required" }, { type: "minLength", value: 20 }],
      ui: { section: "service", order: 3 },
    },
    {
      key: "additional_services",
      label: "Any additional services?",
      input: "multi_select",
      options: [
        { value: "spare_keys", label: "Spare key cutting" },
        { value: "alarm_codes", label: "Alarm code management" },
        { value: "utility_readings", label: "Utility meter readings" },
        { value: "plants_watering", label: "Plant watering" },
        { value: "mail_forwarding", label: "Mail forwarding" },
        { value: "property_photography", label: "Property photography" },
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
        { value: "house", label: "House" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 1 },
    },
    {
      key: "property_status",
      label: "Property status",
      input: "single_select",
      options: [
        { value: "owner_occupied", label: "Owner-occupied (you live there)" },
        { value: "second_home", label: "Second home / pied-à-terre" },
        { value: "let", label: "Let to tenants" },
        { value: "vacant", label: "Vacant / between tenants" },
        { value: "construction", label: "Under construction / renovation" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 2 },
    },
    {
      key: "building_access",
      label: "Building access",
      input: "single_select",
      options: [
        { value: "direct", label: "Direct street access" },
        { value: "communal_fob", label: "Communal entrance (fob/key)" },
        { value: "concierge_building", label: "Building with concierge" },
        { value: "gated", label: "Gated development" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 3 },
    },
    {
      key: "alarm_system",
      label: "Does the property have an alarm system?",
      input: "yes_no",
      ui: { section: "property", order: 4 },
    },

    // Schedule
    {
      key: "service_frequency",
      label: "How often do you need this service?",
      input: "single_select",
      options: [
        { value: "one_off", label: "One-off" },
        { value: "weekly", label: "Weekly" },
        { value: "fortnightly", label: "Fortnightly" },
        { value: "monthly", label: "Monthly" },
        { value: "as_needed", label: "As needed / on-call" },
        { value: "ongoing", label: "Ongoing arrangement" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 1 },
    },
    {
      key: "start_date",
      label: "When do you need this to start?",
      input: "single_select",
      options: [
        { value: "immediately", label: "Immediately" },
        { value: "this_week", label: "This week" },
        { value: "next_week", label: "Next week" },
        { value: "specific", label: "Specific date (we'll contact you)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 2 },
    },
    {
      key: "duration",
      label: "Expected duration",
      input: "single_select",
      options: [
        { value: "one_off", label: "One-off task" },
        { value: "short_term", label: "Short-term (a few weeks)" },
        { value: "medium_term", label: "Medium-term (1-6 months)" },
        { value: "ongoing", label: "Ongoing / indefinite" },
      ],
      ui: { section: "schedule", order: 3 },
    },

    // Contact
    {
      key: "contact_phone",
      label: "Contact phone number",
      input: "phone",
      placeholder: "07xxx xxxxxx",
      validation: [{ type: "required" }],
      ui: { section: "contact", order: 1 },
    },
    {
      key: "alternative_contact",
      label: "Alternative contact (optional)",
      helpText: "Name and phone of someone else we can contact if needed.",
      input: "short_text",
      placeholder: "e.g. John Smith - 07xxx xxxxxx",
      ui: { section: "contact", order: 2 },
    },
    {
      key: "preferred_contact_method",
      label: "Preferred contact method",
      input: "single_select",
      options: [
        { value: "phone", label: "Phone call" },
        { value: "whatsapp", label: "WhatsApp" },
        { value: "email", label: "Email" },
        { value: "any", label: "Any" },
      ],
      ui: { section: "contact", order: 3 },
    },
  ],
};
