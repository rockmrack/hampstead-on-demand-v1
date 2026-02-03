import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const renovationsForm: IntakeFormDefinition = {
  category: "renovations",
  title: "Hampstead Renovations — Book a consultation",
  subtitle:
    "For larger works: refurbishments, kitchens, bathrooms, loft conversions, extensions, and design & build.",

  subcategories: [
    { value: "full_refurb", label: "Full refurbishment" },
    { value: "loft", label: "Loft conversion" },
    { value: "extension", label: "House extension" },
    { value: "kitchen", label: "Kitchen renovation" },
    { value: "bathroom", label: "Bathroom renovation" },
    { value: "structural", label: "Structural alterations" },
    { value: "planning", label: "Planning & design support" },
    { value: "other", label: "Other" },
  ],

  sections: [
    { key: "project", title: "Project basics", description: "Tell us what you want to achieve.", order: 1 },
    { key: "property", title: "Property details", description: "Helps us assess feasibility and typical constraints.", order: 2 },
    { key: "budget_timeline", title: "Budget & timeline", description: "So we can propose the right next steps.", order: 3 },
    { key: "media", title: "Photos & inspiration", description: "Uploads make the first consultation much more productive.", order: 4 },
    { key: "access", title: "Access & contact", description: "How to reach you and arrange a visit.", order: 5 },
  ],

  defaultUrgency: "flexible",
  urgencies: [
    { value: "this_week", label: "I’d like to speak this week", hint: "We’ll propose the soonest call or site visit slot." },
    { value: "flexible", label: "Flexible", hint: "Happy to arrange the next suitable consultation slot." },
    { value: "emergency", label: "Urgent (damage/unsafe)", hint: "Only if there’s an urgent building issue that needs rapid assessment." },
  ],

  serviceArea: {
    allowedPostcodes,
    rejectTitle: "Currently members-only in NW3, NW6 and NW8",
    rejectBody: "We’re expanding soon. Join the waitlist and we’ll notify you when your area opens.",
  },

  questions: [
    {
      key: "postcode",
      label: "Postcode",
      helpText: "We currently serve NW3 / NW6 / NW8 only.",
      input: "short_text",
      placeholder: "e.g. NW6 2AA",
      validation: [
        { type: "required" },
        { type: "regex", value: "^[A-Za-z]{1,2}\\d{1,2}[A-Za-z]?\\s?\\d[A-Za-z]{2}$", message: "Enter a valid UK postcode." },
      ],
      ui: { section: "project", order: 1 },
    },
    {
      key: "subcategory",
      label: "What are you planning?",
      input: "single_select",
      options: [
        { value: "full_refurb", label: "Full refurbishment" },
        { value: "loft", label: "Loft conversion" },
        { value: "extension", label: "House extension" },
        { value: "kitchen", label: "Kitchen renovation" },
        { value: "bathroom", label: "Bathroom renovation" },
        { value: "structural", label: "Structural alterations" },
        { value: "planning", label: "Planning & design support" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "project", order: 2 },
    },
    {
      key: "project_goal",
      label: "What do you want to achieve?",
      input: "long_text",
      placeholder: "Describe the outcome you want (layout, extra space, finish level, problems to solve).",
      validation: [{ type: "required" }, { type: "minLength", value: 30 }],
      ui: { section: "project", order: 3 },
    },
    {
      key: "scope_rooms",
      label: "Which areas are in scope?",
      input: "multi_select",
      options: [
        { value: "kitchen", label: "Kitchen" },
        { value: "bathrooms", label: "Bathroom(s)" },
        { value: "living", label: "Living / dining" },
        { value: "bedrooms", label: "Bedroom(s)" },
        { value: "loft", label: "Loft" },
        { value: "basement", label: "Basement" },
        { value: "garden", label: "Garden / rear" },
        { value: "whole_house", label: "Whole house" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "project", order: 4 },
    },

    {
      key: "property_type",
      label: "Property type",
      input: "single_select",
      options: [
        { value: "flat", label: "Flat" },
        { value: "maisonette", label: "Maisonette" },
        { value: "terrace", label: "Terraced house" },
        { value: "semi", label: "Semi-detached house" },
        { value: "detached", label: "Detached house" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 1 },
    },
    {
      key: "approx_size",
      label: "Approx. size (optional)",
      input: "single_select",
      options: [
        { value: "under_80", label: "Under 80 sqm" },
        { value: "80_120", label: "80–120 sqm" },
        { value: "120_180", label: "120–180 sqm" },
        { value: "180_plus", label: "180+ sqm" },
        { value: "unknown", label: "Not sure" },
      ],
      ui: { section: "property", order: 2 },
    },
    {
      key: "listed_or_conservation",
      label: "Is it listed or in a conservation area?",
      input: "single_select",
      options: [
        { value: "yes_listed", label: "Yes — listed" },
        { value: "yes_conservation", label: "Yes — conservation area" },
        { value: "no", label: "No / not sure" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 3 },
    },
    {
      key: "planning_needed",
      label: "Do you think planning permission is needed?",
      input: "single_select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_sure", label: "Not sure" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 4 },
    },

    {
      key: "budget_band",
      label: "Budget band (ballpark)",
      helpText: "This helps us propose the right route and avoid wasting time.",
      input: "single_select",
      options: [
        { value: "under_50k", label: "Under £50k" },
        { value: "50_100k", label: "£50k–£100k" },
        { value: "100_200k", label: "£100k–£200k" },
        { value: "200_400k", label: "£200k–£400k" },
        { value: "400k_plus", label: "£400k+" },
        { value: "not_sure", label: "Not sure" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "budget_timeline", order: 1 },
    },
    {
      key: "timeline",
      label: "Preferred timeline",
      input: "single_select",
      options: [
        { value: "asap", label: "ASAP" },
        { value: "3m", label: "Within ~3 months" },
        { value: "6m", label: "Within ~6 months" },
        { value: "planning_stage", label: "Still planning / researching" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "budget_timeline", order: 2 },
    },
    {
      key: "need_design_support",
      label: "Do you want design & planning support?",
      input: "single_select",
      options: [
        { value: "yes_full", label: "Yes — design + planning + build" },
        { value: "yes_design_only", label: "Yes — design/planning only" },
        { value: "no_have_team", label: "No — I already have architects/designers" },
        { value: "not_sure", label: "Not sure" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "budget_timeline", order: 3 },
    },

    {
      key: "media_uploads",
      label: "Upload photos (current) + inspiration (optional)",
      helpText: "Floorplans are welcome if you have them.",
      input: "media",
      validation: [{ type: "required" }],
      ui: { section: "media", order: 1 },
    },

    {
      key: "preferred_windows",
      label: "Preferred consultation windows",
      helpText: "Choose 2–3 options (call or site visit depending on scope).",
      input: "time_windows",
      validation: [{ type: "required" }],
      ui: { section: "access", order: 1 },
    },
    {
      key: "contact_phone",
      label: "Best contact phone",
      input: "phone",
      placeholder: "e.g. +44 7xxx xxxxxx",
      validation: [
        { type: "required" },
        { type: "regex", value: "^\\+?[0-9\\s\\-()]{8,}$", message: "Enter a valid phone number." },
      ],
      ui: { section: "access", order: 2 },
    },
    {
      key: "extra_notes",
      label: "Any additional notes",
      input: "long_text",
      placeholder: "Anything we should know before we propose next steps?",
      validation: [{ type: "maxLength", value: 1500 }],
      ui: { section: "access", order: 3 },
    },
  ],
};
