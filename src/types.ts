export interface IncomeData {
  year: number;
  province: string;
  source_income1: string;
  source_income2: string;
  source_income3: string;
  soc_eco_class1: string;
  soc_eco_class2: string;
  value: number;
  unit: string;
  attribute: string;
  source: string;
  region: string;
  year_ad: number;
}

export interface DashboardStats {
  totalIncome: number;
  avgIncome: number;
  provinceCount: number;
  regionCount: number;
}

export interface IncomeDistData {
  year: number;
  province: string;
  hh_size: string;
  income: string;
  value: number;
  unit: string;
  attribute: string;
  source: string;
}
