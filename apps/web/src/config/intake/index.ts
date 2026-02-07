import { maintenanceForm } from "./maintenance";
import { renovationsForm } from "./renovations";
import { cleaningForm } from "./cleaning";
import { gardeningForm } from "./gardening";
import { conciergeForm } from "./concierge";
import { securityForm } from "./security";
import { designForm } from "./design";

export const intakeForms = {
  maintenance: maintenanceForm,
  renovations: renovationsForm,
  cleaning: cleaningForm,
  gardening: gardeningForm,
  concierge: conciergeForm,
  security: securityForm,
  design: designForm,
};

export type IntakeFormKey = keyof typeof intakeForms;
