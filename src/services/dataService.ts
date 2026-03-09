import Papa from 'papaparse';
import { IncomeData } from '../types';

import processedDataUrl from '@/processed_data_with_regions.csv?url';
import masterDataUrl from '@/master_economic_data_2566.csv?url';
import data2Url from '@/income_distribution_2566.csv?url';
import socioEcoDataUrl from '@/socio_economic_income_2566.csv?url';

export const fetchIncomeData = async (): Promise<IncomeData[]> => {
  const response = await fetch(processedDataUrl);
  let csvText = await response.text();
  csvText = csvText.replace(/^\uFEFF/, '').trim();
  const results = Papa.parse<IncomeData>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return results.data;
};

export const fetchMasterData = async (): Promise<any[]> => {
  const response = await fetch(masterDataUrl);
  let csvText = await response.text();
  // Ensure BOM and whitespace are removed
  csvText = csvText.replace(/^\uFEFF/, '').trim();
  const results = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  if (results.errors.length) {
    console.error('PapaParse errors:', results.errors);
  }
  return results.data;
};

const bkkProvinces = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'นครปฐม', 'สมุทรปราการ', 'สมุทรสาคร'];

export const getAggregatedDataByRegion = (data: IncomeData[]) => {
  const regions: Record<string, number> = {};
  data.forEach(d => {
    let regionName = d.region;

    // If the province is in the BKK metro area, separate it from "Central" (กลาง)
    if (bkkProvinces.includes(d.province)) {
      regionName = 'กรุงเทพมหานคร';
    }

    if (!regions[regionName]) regions[regionName] = 0;
    regions[regionName] += d.value;
  });
  return Object.entries(regions).map(([name, value]) => ({ name, value }));
};

export const getTopProvinces = (data: IncomeData[], limit = 5) => {
  const provinces: Record<string, number> = {};
  data.forEach(d => {
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
  data.forEach(d => {
    if (!classes[d.soc_eco_class1]) classes[d.soc_eco_class1] = 0;
    classes[d.soc_eco_class1] += d.value;
  });
  return Object.entries(classes).map(([name, value]) => ({ name, value }));
};

export const fetchIncomeDistData = async (): Promise<any[]> => {
  const response = await fetch(data2Url);
  const csvText = await response.text();
  const results = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return results.data;
};

export const getIncomeDistSummary = (data: any[]) => {
  const dist: Record<string, number> = {};
  let provinceCount = 0;

  data.filter(d => d.hh_size === 'รวมทั้งสิ้น').forEach(d => {
    if (d.income !== 'รายได้ทั้งสิ้นเฉลี่ยต่อเดือนต่อครัวเรือน' &&
      d.income !== 'รายได้ทั้งสิ้นเฉลี่ยต่อเดือนต่อคน' && typeof d.value === 'number') {
      if (!dist[d.income]) dist[d.income] = 0;
      dist[d.income] += d.value;
    }
  });

  // Calculate average % across provinces
  provinceCount = new Set(data.map(d => d.province)).size;

  return Object.entries(dist)
    .map(([name, value]) => ({ name, value: Number((value / (provinceCount || 1)).toFixed(2)) }))
    .filter(item => item.value > 0);
};

export const fetchSocioEcoData = async (): Promise<any[]> => {
  const response = await fetch(socioEcoDataUrl);
  let csvText = await response.text();
  csvText = csvText.replace(/^\uFEFF/, '').trim();
  const results = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  if (results.errors.length) {
    console.error('PapaParse errors (SocioEco):', results.errors);
  }
  return results.data;
};

export const getDebtPurposeDistribution = (data: any[]) => {
  const purposes: Record<string, { total: number; count: number }> = {};

  data.forEach(d => {
    if (d.hhdebt_totaldebt_purpose_source === 'จำแนกตามวัตถุประสงค์' && typeof d.value === 'number') {
      const purpose = d.purpose_source_bor;
      if (!purposes[purpose]) purposes[purpose] = { total: 0, count: 0 };
      purposes[purpose].total += d.value;
      purposes[purpose].count++;
    }
  });

  return Object.entries(purposes)
    .map(([name, { total, count }]) => ({
      name,
      value: Number((total / (count || 1)).toFixed(2))
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

export const getDebtSourceDistribution = (data: any[]) => {
  const sources: Record<string, { total: number; count: number }> = {};

  data.forEach(d => {
    if (d.hhdebt_totaldebt_purpose_source === 'จำแนกตามแหล่งเงินกู้' && typeof d.value === 'number') {
      const source = d.purpose_source_bor;
      if (!sources[source]) sources[source] = { total: 0, count: 0 };
      sources[source].total += d.value;
      sources[source].count++;
    }
  });

  return Object.entries(sources)
    .map(([name, { total, count }]) => ({
      name,
      value: Number((total / (count || 1)).toFixed(2))
    }))
    .filter(item => item.value > 0);
};

export const getDebtBySocioClass = (data: any[]) => {
  const classes: Record<string, { total: number; count: number }> = {};

  data.forEach(d => {
    if (
      d.hhdebt_totaldebt === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' &&
      d.hhdebt_totaldebt_purpose_source === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' &&
      typeof d.value === 'number'
    ) {
      const className = d.soc_eco_class1;
      if (!classes[className]) classes[className] = { total: 0, count: 0 };
      classes[className].total += d.value;
      classes[className].count++;
    }
  });

  return Object.entries(classes)
    .map(([name, { total, count }]) => ({
      name,
      value: Number((total / (count || 1)).toFixed(2))
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};
