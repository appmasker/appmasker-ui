import type { DomainConfigInput } from ".";

export interface DomainPreset {
  name: string;
  label: string;
  config: DomainConfigInput;
}