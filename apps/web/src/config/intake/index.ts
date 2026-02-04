import { maintenanceForm } from "./maintenance";
import { renovationsForm } from "./renovations";
import { cleaningForm } from "./cleaning";
import { gardeningForm } from "./gardening";
import { conciergeForm } from "./concierge";
import { securityForm } from "./security";

export const intakeForms = {
  maintenance: maintenanceForm,
  renovations: renovationsForm,
  cleaning: cleaningForm,
  gardening: gardeningForm,
  concierge: conciergeForm,
  security: securityForm,
};

export type IntakeFormKey = keyof typeof intakeForms;
