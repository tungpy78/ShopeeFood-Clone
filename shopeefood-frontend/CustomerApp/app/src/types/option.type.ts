export interface Option {
  id?: number;
  name: string;
  price_adjustment: number;
}

export interface OptionGroup {
  id: number;
  name: string;
  is_mandatory: boolean;
  max_choices: number;
  options: Option[];
}