import Papa from 'papaparse';
import { rawData } from '../data';
import { IncomeData } from '../types';

export const parseIncomeData = (): IncomeData[] => {
  const results = Papa.parse<IncomeData>(rawData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return results.data;
};

export const getAggregatedDataByRegion = (data: IncomeData[]) => {
  const regions: Record<string, number> = {};
  data.filter(d => d.source_income1 === 'รายได้ทั้งสิ้นต่อเดือน').forEach(d => {
    if (!regions[d.region]) regions[d.region] = 0;
    regions[d.region] += d.value;
  });
  return Object.entries(regions).map(([name, value]) => ({ name, value }));
};

export const getTopProvinces = (data: IncomeData[], limit = 5) => {
  const provinces: Record<string, number> = {};
  data.filter(d => d.source_income1 === 'รายได้ทั้งสิ้นต่อเดือน').forEach(d => {
    if (!provinces[d.province]) provinces[d.province] = 0;
    provinces[d.province] += d.value;
  });
  return Object.entries(provinces)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getIncomeByClass = (data: IncomeData[]) => {
    const classes: Record<string, number> = {};
    data.filter(d => d.source_income1 === 'รายได้ทั้งสิ้นต่อเดือน').forEach(d => {
      if (!classes[d.soc_eco_class1]) classes[d.soc_eco_class1] = 0;
      classes[d.soc_eco_class1] += d.value;
    });
    return Object.entries(classes).map(([name, value]) => ({ name, value }));
};
