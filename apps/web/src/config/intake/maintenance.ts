import { IntakeFormDefinition } from "./types";

const allowedPostcodes = ["NW3", "NW6", "NW8"];

export const maintenanceForm: IntakeFormDefinition = {
  category: "maintenance",
  title: "Hampstead Maintenance — Request a job",
  subtitle:
    "Fast, reliable property help for NW3 / NW6 / NW8. Submit details and we’ll triage quickly.",

  subcategories: [
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "heating", label: "Heating / boiler" },
    { value: "handyman", label: "Handyman / small repairs" },
    { value: "painting", label: "Painting & decorating (small works)" },
    { value: "carpentry", label: "Carpentry" },
    { value: "roofing", label: "Roof / gutters" },
    { value: "damp", label: "Damp / leaks" },
    { value: "appliances", label: "Appliances" },
    { value: "other", label: "Other" },
  ],

  sections: [
    {
      key: "basics",
      title: "What do you need?",
      description: "Tell us what’s happening and how urgent it is.",
      order: 1,
    },
    {
      key: "safety",
      title: "Safety checks",
      description: "Quick checks so we can dispatch the right response.",
      order: 2,
    },
    {
      key: "access",
      title: "Access & timing",
      description: "When can we attend and how do we access the property?",
      order: 3,
    },
    {
      key: "media",
      title: "Photos & video",
      description: "Uploads help us quote faster and avoid wasted visits.",
      order: 4,
    },
    {
      key: "confirm",
      title: "Confirm",
      description: "Review and submit.",
      order: 5,
    },
  ],

  defaultUrgency: "this_week",
  urgencies: [
    {
      value: "emergency",
      label: "Emergency (same day if possible)",
      hint: "Active leak, no heating in winter, power issues, unsafe situations.",
    },
    {
      value: "this_week",
      label: "This week",
      hint: "We’ll propose the soonest suitable slot.",
    },
    {
      value: "flexible",
      label: "Flexible",
      hint: "You’re happy with the next available appointment window.",
    },
  ],

  serviceArea: {
    allowedPostcodes,
    rejectTitle: "Currently members-only in NW3, NW6 and NW8",
    rejectBody:
      "We’re expanding soon. Join the waitlist and we’ll notify you when your area opens.",
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
      ui: { section: "basics", order: 1 },
    },
    {
      key: "subcategory",
      label: "Type of job",
      input: "single_select",
      options: [
        { value: "plumbing", label: "Plumbing" },
        { value: "electrical", label: "Electrical" },
        { value: "heating", label: "Heating / boiler" },
        { value: "handyman", label: "Handyman / small repairs" },
        { value: "painting", label: "Painting & decorating (small works)" },
        { value: "carpentry", label: "Carpentry" },
        { value: "roofing", label: "Roof / gutters" },
        { value: "damp", label: "Damp / leaks" },
        { value: "appliances", label: "Appliances" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "basics", order: 2 },
    },
    {
      key: "issue_summary",
      label: "What’s the issue?",
      input: "long_text",
      placeholder:
        "Describe what’s happening, what you’ve tried, and when it started.",
      validation: [{ type: "required" }, { type: "minLength", value: 20 }],
      ui: { section: "basics", order: 3 },
    },
    {
      key: "room_location",
      label: "Where is it?",
      input: "single_select",
      options: [
        { value: "kitchen", label: "Kitchen" },
        { value: "bathroom", label: "Bathroom" },
        { value: "utility", label: "Utility / laundry" },
        { value: "living", label: "Living room" },
        { value: "bedroom", label: "Bedroom" },
        { value: "hall", label: "Hallway / stairs" },
        { value: "garden", label: "Garden / exterior" },
        { value: "roof", label: "Roof / loft" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "basics", order: 4 },
    },

    {
      key: "safety_risk",
      label: "Is there any immediate safety risk?",
      helpText:
        "Examples: sparking, burning smell, major leak, gas smell, flooding.",
      input: "yes_no",
      validation: [{ type: "required" }],
      ui: { section: "safety", order: 1 },
    },
    {
      key: "safety_risk_details",
      label: "Describe the risk",
      input: "long_text",
      placeholder: "What do you see/smell/hear? Is anyone in danger?",
      validation: [{ type: "required" }, { type: "minLength", value: 10 }],
      visibleWhen: { type: "equals", key: "safety_risk", value: true },
      ui: { section: "safety", order: 2 },
    },
    {
      key: "utilities_shutoff_known",
      label: "Do you know where the mains shut-offs are?",
      helpText: "Water stopcock / electric consumer unit / gas shut-off.",
      input: "single_select",
      options: [
        { value: "yes_can_access", label: "Yes, and I can access them" },
        { value: "yes_no_access", label: "Yes, but I can’t access them right now" },
        { value: "no", label: "No / not sure" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "safety", order: 3 },
    },
    {
      key: "power_outage",
      label: "Any power outage or tripping?",
      input: "single_select",
      options: [
        { value: "none", label: "No" },
        { value: "some_circuits", label: "Some circuits" },
        { value: "whole_property", label: "Whole property" },
        { value: "tripping", label: "Trips when turned on" },
      ],
      validation: [{ type: "required" }],
      visibleWhen: { type: "equals", key: "subcategory", value: "electrical" },
      ui: { section: "safety", order: 4 },
    },
    {
      key: "water_leak_severity",
      label: "If this is a leak, how severe is it?",
      input: "single_select",
      options: [
        { value: "not_a_leak", label: "Not a leak" },
        { value: "drip", label: "Small drip" },
        { value: "steady", label: "Steady leak" },
        { value: "burst", label: "Major/burst pipe or flooding" },
      ],
      validation: [{ type: "required" }],
      visibleWhen: {
        type: "or",
        rules: [
          { type: "equals", key: "subcategory", value: "plumbing" },
          { type: "equals", key: "subcategory", value: "damp" },
        ],
      },
      ui: { section: "safety", order: 5 },
    },

    {
      key: "access_method",
      label: "How should we access the property?",
      input: "single_select",
      options: [
        { value: "resident_present", label: "Resident will be present" },
        { value: "concierge", label: "Building concierge" },
        { value: "key_safe", label: "Key safe" },
        { value: "agent", label: "Letting agent" },
        { value: "household_staff", label: "Household staff will be present" },
        { value: "other", label: "Other" },
      ],
      validation: [{ type: "required" }],
      ui: { section: "access", order: 1 },
    },
    {
      key: "access_details",
      label: "Access details",
      helpText: "Do not share alarm codes here. We’ll confirm securely if needed.",
      input: "long_text",
      placeholder:
        "Key safe location, concierge name, entry instructions, parking notes, etc.",
      validation: [{ type: "required" }, { type: "minLength", value: 10 }],
      ui: { section: "access", order: 2 },
    },
    {
      key: "preferred_windows",
      label: "Preferred time windows",
      helpText: "Choose 2–3 options. We’ll confirm the best available slot.",
      input: "time_windows",
      validation: [{ type: "required" }],
      ui: { section: "access", order: 3 },
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
      ui: { section: "access", order: 4 },
    },

    {
      key: "media_uploads",
      label: "Upload photos or video",
      helpText: "Show the issue clearly, plus a wider shot for context.",
      input: "media",
      validation: [{ type: "required" }],
      ui: { section: "media", order: 1 },
    },

    {
      key: "special_notes",
      label: "Anything else we should know?",
      input: "long_text",
      placeholder: "Pets, fragile items, parking restrictions, access times, etc.",
      validation: [{ type: "maxLength", value: 1000 }],
      ui: { section: "confirm", order: 1 },
    },
  ],
};
