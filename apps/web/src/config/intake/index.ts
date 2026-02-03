import { maintenanceForm } from "./maintenance";
import { renovationsForm } from "./renovations";

export const intakeForms = {
  maintenance: maintenanceForm,
  renovations: renovationsForm,
};

export type IntakeFormKey = keyof typeof intakeForms;
