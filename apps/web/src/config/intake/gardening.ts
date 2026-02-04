import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const gardeningForm: IntakeFormDefinition = {
  category: "gardening",
  title: "Hampstead Garden & Outdoor — Book a service",
  subtitle:
    "Professional garden maintenance, landscaping, and outdoor services for your property.",

  subcategories: [
    { value: "regular_maintenance", label: "Regular garden maintenance" },
    { value: "one_off_tidy", label: "One-off garden tidy" },
    { value: "lawn_care", label: "Lawn care & treatment" },
    { value: "planting", label: "Planting & borders" },
    { value: "landscaping", label: "Landscaping & design" },
    { value: "tree_surgery", label: "Tree surgery" },
    { value: "hedge_trimming", label: "Hedge trimming" },
    { value: "patio_cleaning", label: "Patio & driveway cleaning" },
    { value: "fencing", label: "Fencing & gates" },
    { value: "other", label: "Other" },
  ],

  sections: [
    {
      key: "service",
      title: "What do you need?",
      description: "Tell us about your garden requirements.",
      order: 1,
    },
    {
      key: "garden",
      title: "Garden details",
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
      title: "Access",
      description: "How we'll access your garden.",
      order: 4,
    },
  ],

  defaultUrgency: "this_week",
  urgencies: [
    {
      value: "emergency",
      label: "Urgent (storm damage, dangerous tree)",
      hint: "Safety issues requiring immediate attention.",
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
      label: "Type of service",
      input: "single_select",
      options: [
        { value: "regular_maintenance", label: "Regular garden maintenance", hint: "Weekly, fortnightly or monthly" },
        { value: "one_off_tidy", label: "One-off garden tidy", hint: "Clear up and restore order" },
        { value: "lawn_care", label: "Lawn care & treatment", hint: "Mowing, feeding, scarifying" },
        { value: "planting", label: "Planting & borders", hint: "Beds, borders, containers" },
        { value: "landscaping", label: "Landscaping & design", hint: "Garden transformation" },
        { value: "tree_surgery", label: "Tree surgery", hint: "Pruning, felling, crown reduction" },
        { value: "hedge_trimming", label: "Hedge trimming", hint: "Shape and maintain hedges" },
        { value: "patio_cleaning", label: "Patio & driveway cleaning", hint: "Pressure washing" },
        { value: "fencing", label: "Fencing & gates", hint: "Repair or install fencing" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "service", order: 2 },
    },
    {
      key: "work_description",
      label: "Describe what you need",
      input: "long_text",
      placeholder: "Tell us about the work you need done, any specific plants or features, and your vision for the garden.",
      validation: [{ type: "required" }, { type: "minLength", value: 20 }],
      ui: { section: "service", order: 3 },
    },
    {
      key: "additional_services",
      label: "Any additional services?",
      input: "multi_select",
      options: [
        { value: "waste_removal", label: "Green waste removal" },
        { value: "jet_washing", label: "Jet washing" },
        { value: "gutter_clearing", label: "Gutter clearing" },
        { value: "outdoor_furniture", label: "Outdoor furniture treatment" },
        { value: "lighting", label: "Garden lighting" },
        { value: "irrigation", label: "Irrigation system" },
      ],
      ui: { section: "service", order: 4 },
    },

    // Garden details
    {
      key: "garden_size",
      label: "Garden size (approximate)",
      input: "single_select",
      options: [
        { value: "small", label: "Small (up to 50 sqm)", hint: "Courtyard or small patio" },
        { value: "medium", label: "Medium (50-150 sqm)", hint: "Typical London garden" },
        { value: "large", label: "Large (150-400 sqm)", hint: "Generous garden" },
        { value: "very_large", label: "Very large (400+ sqm)", hint: "Substantial grounds" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "garden", order: 1 },
    },
    {
      key: "garden_features",
      label: "What features does your garden have?",
      input: "multi_select",
      options: [
        { value: "lawn", label: "Lawn" },
        { value: "flower_beds", label: "Flower beds / borders" },
        { value: "hedges", label: "Hedges" },
        { value: "trees", label: "Trees" },
        { value: "patio", label: "Patio / decking" },
        { value: "pond", label: "Pond / water feature" },
        { value: "vegetable_patch", label: "Vegetable patch" },
        { value: "greenhouse", label: "Greenhouse / shed" },
      ],
      ui: { section: "garden", order: 2 },
    },
    {
      key: "current_condition",
      label: "Current condition",
      input: "single_select",
      options: [
        { value: "well_maintained", label: "Well maintained", hint: "Regular upkeep" },
        { value: "needs_attention", label: "Needs attention", hint: "Not maintained recently" },
        { value: "overgrown", label: "Overgrown / neglected", hint: "Significant work needed" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "garden", order: 3 },
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
        { value: "seasonal", label: "Seasonal (spring/autumn)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 1 },
    },
    {
      key: "preferred_time",
      label: "Preferred time",
      input: "single_select",
      options: [
        { value: "morning", label: "Morning" },
        { value: "afternoon", label: "Afternoon" },
        { value: "flexible", label: "Flexible" },
      ],
      ui: { section: "schedule", order: 2 },
    },
    {
      key: "start_date",
      label: "When would you like to start?",
      input: "single_select",
      options: [
        { value: "asap", label: "As soon as possible" },
        { value: "next_week", label: "Next week" },
        { value: "next_month", label: "Next month" },
        { value: "specific", label: "Specific date (we'll contact you)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "schedule", order: 3 },
    },

    // Access
    {
      key: "garden_access",
      label: "How do we access the garden?",
      input: "single_select",
      options: [
        { value: "side_gate", label: "Side gate (independent access)" },
        { value: "through_house", label: "Through the house" },
        { value: "building_communal", label: "Building communal garden" },
        { value: "other", label: "Other (explain in notes)" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "access", order: 1 },
    },
    {
      key: "parking",
      label: "Parking / van access?",
      input: "single_select",
      options: [
        { value: "easy", label: "Easy - driveway or nearby street" },
        { value: "permit", label: "Permit zone (we'll arrange)" },
        { value: "difficult", label: "Difficult - limited access" },
      ],
      ui: { section: "access", order: 2 },
    },
    {
      key: "contact_phone",
      label: "Contact phone number",
      input: "phone",
      placeholder: "07xxx xxxxxx",
      validation: [{ type: "required" }],
      ui: { section: "access", order: 3 },
    },
  ],
};
