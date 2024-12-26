export interface AEFInputs {
  base: number;
  worklifeAdjustment: number;
  unemploymentFactor: number;
  incomeTaxRate: number;
  personalConsumption: number;
  applyPersonalConsumption: boolean;
  fringeBenefits: number;
}

export interface AEFSteps {
  worklifeAdjusted: number;
  unemploymentAdjusted: number;
  taxAdjusted: number;
  fringeBenefitsAdjusted: number;
  finalAEF: number;
}

export interface AEFResult {
  inputs: AEFInputs;
  steps: AEFSteps;
}