export type IntakeCategory =
  | "maintenance"
  | "renovations"
  | "cleaning"
  | "gardening"
  | "concierge"
  | "security";

export type IntakeUrgency = "emergency" | "this_week" | "flexible";

export type InputType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "yes_no"
  | "number"
  | "currency"
  | "date"
  | "time_windows"
  | "media"
  | "address"
  | "phone";

export type VisibilityRule =
  | { type: "always" }
  | { type: "equals"; key: string; value: string | boolean | number }
  | { type: "includes"; key: string; value: string }
  | { type: "and"; rules: VisibilityRule[] }
  | { type: "or"; rules: VisibilityRule[] }
  | { type: "not"; rule: VisibilityRule };

export type ValidationRule =
  | { type: "required" }
  | { type: "minLength"; value: number }
  | { type: "maxLength"; value: number }
  | { type: "min"; value: number }
  | { type: "max"; value: number }
  | { type: "regex"; value: string; message: string };

export type Option = {
  value: string;
  label: string;
  hint?: string;
};

export type IntakeQuestion = {
  key: string;
  label: string;
  helpText?: string;
  input: InputType;
  options?: Option[];
  validation?: ValidationRule[];
  visibleWhen?: VisibilityRule;
  placeholder?: string;
  currency?: "GBP";
  step?: number;
  ui?: {
    icon?: string;
    section?: string;
    order?: number;
  };
};

export type IntakeSection = {
  key: string;
  title: string;
  description?: string;
  order: number;
};

export type IntakeFormDefinition = {
  category: IntakeCategory;
  title: string;
  subtitle?: string;
  subcategories?: Option[];
  sections: IntakeSection[];
  questions: IntakeQuestion[];
  defaultUrgency: IntakeUrgency;
  urgencies: { value: IntakeUrgency; label: string; hint?: string }[];
  serviceArea: {
    allowedPostcodes: string[];
    rejectTitle: string;
    rejectBody: string;
  };
};

export function evalRule(
  rule: VisibilityRule | undefined,
  answers: Record<string, unknown>
): boolean {
  if (!rule) return true;

  switch (rule.type) {
    case "always":
      return true;
    case "equals":
      return answers[rule.key] === rule.value;
    case "includes": {
      const v = answers[rule.key];
      if (Array.isArray(v)) return v.includes(rule.value);
      if (typeof v === "string") return v.includes(rule.value);
      return false;
    }
    case "and":
      return rule.rules.every((r) => evalRule(r, answers));
    case "or":
      return rule.rules.some((r) => evalRule(r, answers));
    case "not":
      return !evalRule(rule.rule, answers);
    default:
      return true;
  }
}
