import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const designForm: IntakeFormDefinition = {
  category: "design",
  title: "Design Services — Find a specialist",
  subtitle:
    "Architecture, interior design & specialist consultants for your project in NW3 / NW6 / NW8.",

  subcategories: [
    { value: "architectural_design", label: "Architectural Design" },
    { value: "interior_design", label: "Interior Design" },
    { value: "kitchen_bathroom_design", label: "Kitchen & Bathroom Design" },
    { value: "structural_design", label: "Structural Design" },
    { value: "planning_consultant", label: "Planning Consultant" },
    { value: "party_wall_surveyor", label: "Party Wall Surveyor" },
  ],

  sections: [
    {
      key: "basics",
      title: "About your project",
      description: "Tell us what you need and the scope of your project.",
      order: 1,
    },
    {
      key: "property",
      title: "Property details",
      description: "Help us understand the property and any constraints.",
      order: 2,
    },
    {
      key: "access",
      title: "Access & timing",
      description: "When can we visit and how do we access the property?",
      order: 3,
    },
    {
      key: "media",
      title: "Photos & documents",
      description:
        "Floor plans, photos, or existing drawings help us match you with the right specialist.",
      order: 4,
    },
    {
      key: "confirm",
      title: "Confirm",
      description: "Review and submit.",
      order: 5,
    },
  ],

  defaultUrgency: "flexible",
  urgencies: [
    {
      value: "this_week",
      label: "Urgent — need to start this week",
      hint: "We'll prioritise connecting you immediately.",
    },
    {
      value: "flexible",
      label: "Flexible — within a few weeks",
      hint: "We'll find the best match for your project.",
    },
  ],

  serviceArea: {
    allowedPostcodes,
    rejectTitle: "Currently members-only in NW3, NW6 and NW8",
    rejectBody:
      "We're expanding soon. Join the waitlist and we'll notify you when your area opens.",
  },

  questions: [
    // ─── Basics ─────────────────────────────────────────────────────
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
      ui: { section: "basics", order: 1 },
    },
    {
      key: "subcategory",
      label: "Type of service",
      input: "single_select",
      options: [
        { value: "architectural_design", label: "Architectural Design" },
        { value: "interior_design", label: "Interior Design" },
        { value: "kitchen_bathroom_design", label: "Kitchen & Bathroom Design" },
        { value: "structural_design", label: "Structural Design" },
        { value: "planning_consultant", label: "Planning Consultant" },
        { value: "party_wall_surveyor", label: "Party Wall Surveyor" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "basics", order: 2 },
    },
    {
      key: "project_brief",
      label: "Describe your project",
      helpText:
        "What are you looking to achieve? Include any specific requirements or inspiration.",
      input: "long_text",
      placeholder:
        "e.g. We'd like to extend the rear of our Victorian terrace and need an architect for planning drawings.",
      validation: [{ type: "required" }, { type: "minLength", value: 20 }],
      ui: { section: "basics", order: 3 },
    },
    {
      key: "property_type",
      label: "Property type",
      input: "single_select",
      options: [
        { value: "flat", label: "Flat / apartment" },
        { value: "terraced", label: "Terraced house" },
        { value: "semi_detached", label: "Semi-detached" },
        { value: "detached", label: "Detached house" },
        { value: "mansion_flat", label: "Mansion flat" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "basics", order: 4 },
    },
    {
      key: "budget_range",
      label: "Approximate budget (if known)",
      helpText: "This helps us match you with the right specialists.",
      input: "single_select",
      options: [
        { value: "under_5k", label: "Under £5,000" },
        { value: "5k_15k", label: "£5,000 – £15,000" },
        { value: "15k_50k", label: "£15,000 – £50,000" },
        { value: "50k_100k", label: "£50,000 – £100,000" },
        { value: "100k_plus", label: "£100,000+" },
        { value: "unsure", label: "Not sure yet" },
      ],
      ui: { section: "basics", order: 5 },
    },

    // ─── Subcategory-specific questions ─────────────────────────────
    {
      key: "arch_scope",
      label: "What type of architectural work?",
      input: "multi_select",
      options: [
        { value: "extension", label: "Extension" },
        { value: "loft_conversion", label: "Loft conversion" },
        { value: "basement", label: "Basement" },
        { value: "new_build", label: "New build" },
        { value: "full_renovation", label: "Full renovation" },
        { value: "planning_drawings", label: "Planning drawings only" },
      ],
      visibleWhen: { type: "equals", key: "subcategory", value: "architectural_design" },
      ui: { section: "basics", order: 6 },
    },
    {
      key: "interior_scope",
      label: "What do you need help with?",
      input: "multi_select",
      options: [
        { value: "space_planning", label: "Space planning" },
        { value: "styling", label: "Styling & decoration" },
        { value: "furniture", label: "Furniture sourcing" },
        { value: "colour_consulting", label: "Colour consulting" },
        { value: "full_home", label: "Full home design" },
      ],
      visibleWhen: { type: "equals", key: "subcategory", value: "interior_design" },
      ui: { section: "basics", order: 6 },
    },
    {
      key: "kb_scope",
      label: "What are you looking for?",
      input: "multi_select",
      options: [
        { value: "bespoke_kitchen", label: "Bespoke kitchen" },
        { value: "luxury_bathroom", label: "Luxury bathroom" },
        { value: "wet_room", label: "Wet room" },
        { value: "cabinetry", label: "Cabinetry" },
        { value: "spa_bathroom", label: "Spa bathroom" },
      ],
      visibleWhen: { type: "equals", key: "subcategory", value: "kitchen_bathroom_design" },
      ui: { section: "basics", order: 6 },
    },
    {
      key: "structural_scope",
      label: "What structural work is needed?",
      input: "multi_select",
      options: [
        { value: "structural_calcs", label: "Structural calculations" },
        { value: "beam_design", label: "Beam design" },
        { value: "underpinning", label: "Underpinning" },
        { value: "surveys", label: "Structural surveys" },
        { value: "load_assessment", label: "Load assessments" },
      ],
      visibleWhen: { type: "equals", key: "subcategory", value: "structural_design" },
      ui: { section: "basics", order: 6 },
    },
    {
      key: "planning_scope",
      label: "What planning support do you need?",
      input: "multi_select",
      options: [
        { value: "planning_app", label: "Planning application" },
        { value: "conservation_area", label: "Conservation area approval" },
        { value: "listed_buildings", label: "Listed building consent" },
        { value: "permitted_dev", label: "Permitted development check" },
        { value: "appeals", label: "Planning appeals" },
      ],
      visibleWhen: { type: "equals", key: "subcategory", value: "planning_consultant" },
      ui: { section: "basics", order: 6 },
    },
    {
      key: "party_wall_scope",
      label: "What do you need?",
      input: "multi_select",
      options: [
        { value: "party_wall_notice", label: "Party wall notices" },
        { value: "agreements", label: "Party wall agreements" },
        { value: "schedule_condition", label: "Schedule of condition" },
        { value: "disputes", label: "Neighbour dispute resolution" },
      ],
      visibleWhen: { type: "equals", key: "subcategory", value: "party_wall_surveyor" },
      ui: { section: "basics", order: 6 },
    },

    // ─── Property details ───────────────────────────────────────────
    {
      key: "listed_building",
      label: "Is the property listed or in a conservation area?",
      input: "single_select",
      options: [
        { value: "no", label: "No" },
        { value: "listed", label: "Yes — listed building" },
        { value: "conservation", label: "Yes — conservation area" },
        { value: "both", label: "Both listed and conservation area" },
        { value: "unsure", label: "Not sure" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "property", order: 1 },
    },
    {
      key: "existing_plans",
      label: "Do you have existing floor plans or drawings?",
      input: "yes_no",
      ui: { section: "property", order: 2 },
    },

    // ─── Access & timing ────────────────────────────────────────────
    {
      key: "preferred_windows",
      label: "Preferred times for an initial consultation",
      helpText: "Choose 2–3 options. We'll confirm the best available slot.",
      input: "time_windows",
      ui: { section: "access", order: 1 },
    },
    {
      key: "contact_phone",
      label: "Best contact phone",
      input: "phone",
      placeholder: "e.g. +44 7xxx xxxxxx",
      validation: [
        { type: "required" },
        {
          type: "regex",
          value: "^\\+?[0-9\\s\\-()]{8,}$",
          message: "Enter a valid phone number.",
        },
      ],
      ui: { section: "access", order: 2 },
    },

    // ─── Media ──────────────────────────────────────────────────────
    {
      key: "media_uploads",
      label: "Upload photos, floor plans or documents",
      helpText:
        "Existing drawings, inspiration images, or photos of the property. Max 50 MB per file.",
      input: "media",
      ui: { section: "media", order: 1 },
    },

    // ─── Confirm ────────────────────────────────────────────────────
    {
      key: "additional_notes",
      label: "Anything else we should know?",
      input: "long_text",
      placeholder: "Access notes, timeline constraints, anything relevant.",
      validation: [{ type: "maxLength", value: 1000 }],
      ui: { section: "confirm", order: 1 },
    },
  ],
};
