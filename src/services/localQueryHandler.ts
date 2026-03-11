/**
 * localQueryHandler.ts
 *
 * Handles simple data-lookup questions locally WITHOUT calling the Gemini API.
 * This saves precious RPD (Requests Per Day) quota on the Free Tier.
 *
 * Handles questions about:
 *  - Agriculture: rankings by farming household count or farmer debt
 *  - General income: top/bottom provinces by income or debt (from masterData)
 */

export interface AgriData {
  province: string;
  farmingHouseholds: number; // จำนวนครัวเรือนเกษตรกรรม
  avgDebt: number;           // หนี้สินเฉลี่ยต่อครัวเรือน (บาท)
}

export interface MasterRecord {
  province: string;
  income: number;
  debt: number;
}

/** Aggregate raw socio-economy CSV rows into a compact AgriData[] per province */
export function aggregateAgriData(socioRawData: any[]): AgriData[] {
  const map: Record<string, { households: number; debtTotal: number; debtCount: number }> = {};

  socioRawData.forEach((row) => {
    const cls1: string = row.soc_eco_class1?.toString().trim() || '';
    const province: string = row.province?.toString().trim() || '';
    if (!province || !cls1.includes('เกษตร')) return;

    if (!map[province]) map[province] = { households: 0, debtTotal: 0, debtCount: 0 };

    // จำนวนครัวเรือนทั้งสิ้น
    const debtField: string = row.hhdebt_totaldebt?.toString().trim() || '';
    const purposeField: string = row.hhdebt_totaldebt_purpose_source?.toString().trim() || '';
    const value = typeof row.value === 'number' ? row.value : parseFloat(row.value) || 0;

    if (debtField === 'จำนวนครัวเรือนทั้งสิ้น' && purposeField === 'จำนวนครัวเรือนทั้งสิ้น') {
      map[province].households += value;
    }

    if (debtField === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน' && purposeField === 'จำนวนหนี้สินเฉลี่ยต่อครัวเรือน') {
      map[province].debtTotal += value;
      map[province].debtCount++;
    }
  });

  return Object.entries(map).map(([province, d]) => ({
    province,
    farmingHouseholds: Math.round(d.households),
    avgDebt: d.debtCount > 0 ? Math.round(d.debtTotal / d.debtCount) : 0,
  })).filter(d => d.farmingHouseholds > 0 || d.avgDebt > 0);
}

// ─── Keyword Detection ───────────────────────────────────────────────────────

const AGRI_KEYWORDS = ['เกษตร', 'ฟาร์ม', 'เกษตรกร', 'ปลูกพืช', 'เลี้ยงสัตว์', 'agri', 'farm'];
const RANK_KEYWORDS_TOP = ['มากที่สุด', 'สูงสุด', 'อันดับ 1', 'อันดับ1', 'top', 'most', 'highest', 'มากสุด'];
const RANK_KEYWORDS_BOT = ['น้อยที่สุด', 'ต่ำสุด', 'น้อยสุด', 'lowest', 'least', 'fewest', 'bottom'];
const RANK_KEYWORDS_TOP5 = ['อันดับ 5', 'top 5', 'top5', 'top5', '5 อันดับ', 'ห้าอันดับ'];
const RANK_KEYWORDS_TOP10 = ['อันดับ 10', 'top 10', 'top10', '10 อันดับ'];
const DEBT_KEYWORDS = ['หนี้', 'debt'];
const INCOME_KEYWORDS = ['รายได้', 'income'];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

function getTopN(text: string): number {
  if (containsAny(text, RANK_KEYWORDS_TOP10)) return 10;
  if (containsAny(text, RANK_KEYWORDS_TOP5)) return 5;
  // Check for digit pattern like "อันดับ 3"
  const match = text.match(/(?:อันดับ|top)\s*(\d+)/i);
  if (match) return Math.min(parseInt(match[1]), 20);
  return 1;
}

function formatNumber(n: number): string {
  return n.toLocaleString('th-TH');
}

// ─── Local Answer Generator ──────────────────────────────────────────────────

/**
 * Try to answer the question locally. Returns a string answer if handled,
 * or null if the question requires the Gemini API.
 */
export function tryAnswerLocally(
  question: string,
  agriData: AgriData[],
  masterData: MasterRecord[],
  language: string
): string | null {
  const q = question.trim();
  const isAgri = containsAny(q, AGRI_KEYWORDS);
  const isTop = containsAny(q, RANK_KEYWORDS_TOP);
  const isBot = containsAny(q, RANK_KEYWORDS_BOT);
  const isDebt = containsAny(q, DEBT_KEYWORDS);
  const isIncome = containsAny(q, INCOME_KEYWORDS);
  const n = getTopN(q);
  const isThai = language === 'th';

  // ── 1. Agriculture Rankings ───────────────────────────────────────────────
  if (isAgri) {
    if (agriData.length === 0) return null;

    // Sort by debt
    if (isDebt) {
      const sorted = [...agriData].sort((a, b) =>
        isBot ? a.avgDebt - b.avgDebt : b.avgDebt - a.avgDebt
      );
      const top = sorted.slice(0, n);
      if (n === 1) {
        const p = top[0];
        return isThai
          ? `จังหวัดที่ครัวเรือนเกษตรกรมี${isBot ? 'หนี้ต่ำสุด' : 'หนี้สูงสุด'}คือ **${p.province}** เฉลี่ย ฿${formatNumber(p.avgDebt)} ต่อครัวเรือน`
          : `Province with ${isBot ? 'lowest' : 'highest'} farmer household debt: **${p.province}** averaging ฿${formatNumber(p.avgDebt)} per household`;
      }
      const label = isBot
        ? (isThai ? `${n} จังหวัดที่ครัวเรือนเกษตรกรมีหนี้ต่ำสุด` : `Bottom ${n} provinces by farmer debt`)
        : (isThai ? `${n} จังหวัดที่ครัวเรือนเกษตรกรมีหนี้สูงสุด` : `Top ${n} provinces by farmer debt`);
      const rows = top.map((p, i) => `${i + 1}. **${p.province}** — ฿${formatNumber(p.avgDebt)}`).join('\n');
      return `${label}:\n${rows}`;
    }

    // Sort by number of farming households (default for agriculture queries)
    const sorted = [...agriData].sort((a, b) =>
      isBot ? a.farmingHouseholds - b.farmingHouseholds : b.farmingHouseholds - a.farmingHouseholds
    );
    const top = sorted.slice(0, n);

    if (n === 1) {
      const p = top[0];
      return isThai
        ? `จังหวัดที่มีครัวเรือนเกษตรกร${isBot ? 'น้อยที่สุด' : 'มากที่สุด'}คือ **${p.province}** มีจำนวน ${formatNumber(p.farmingHouseholds)} ครัวเรือน`
        : `Province with ${isBot ? 'fewest' : 'most'} farming households: **${p.province}** with ${formatNumber(p.farmingHouseholds)} households`;
    }

    const label = isBot
      ? (isThai ? `${n} จังหวัดที่มีครัวเรือนเกษตรน้อยที่สุด` : `Bottom ${n} provinces by farming households`)
      : (isThai ? `${n} จังหวัดที่มีครัวเรือนเกษตรมากที่สุด` : `Top ${n} provinces by farming households`);
    const rows = top.map((p, i) => `${i + 1}. **${p.province}** — ${formatNumber(p.farmingHouseholds)} ครัวเรือน`).join('\n');
    const note = isThai
      ? '\n\n*(ข้อมูลจากสำมะโนเกษตร สถิติแห่งชาติ 2566)*'
      : '\n\n*(Source: NSO Agricultural Census 2566)*';
    return `${label}:\n${rows}${note}`;
  }

  // ── 2. General Province Rankings (income/debt from masterData) ────────────
  if ((isTop || isBot) && masterData.length > 0) {
    if (isDebt) {
      const sorted = [...masterData].sort((a, b) => isBot ? a.debt - b.debt : b.debt - a.debt);
      const top = sorted.slice(0, n);
      const label = isBot
        ? (isThai ? `${n} จังหวัดที่มีหนี้ครัวเรือนต่ำสุด` : `Bottom ${n} provinces by household debt`)
        : (isThai ? `${n} จังหวัดที่มีหนี้ครัวเรือนสูงสุด` : `Top ${n} provinces by household debt`);
      if (n === 1) {
        const p = top[0];
        return isThai
          ? `จังหวัดที่มีหนี้ครัวเรือน${isBot ? 'ต่ำสุด' : 'สูงสุด'}คือ **${p.province}** เฉลี่ย ฿${formatNumber(p.debt)}`
          : `Province with ${isBot ? 'lowest' : 'highest'} household debt: **${p.province}** — ฿${formatNumber(p.debt)}`;
      }
      const rows = top.map((p, i) => `${i + 1}. **${p.province}** — ฿${formatNumber(p.debt)}`).join('\n');
      return `${label}:\n${rows}`;
    }
    if (isIncome) {
      const sorted = [...masterData].sort((a, b) => isBot ? a.income - b.income : b.income - a.income);
      const top = sorted.slice(0, n);
      const label = isBot
        ? (isThai ? `${n} จังหวัดที่มีรายได้ครัวเรือนต่ำสุด` : `Bottom ${n} provinces by household income`)
        : (isThai ? `${n} จังหวัดที่มีรายได้ครัวเรือนสูงสุด` : `Top ${n} provinces by household income`);
      if (n === 1) {
        const p = top[0];
        return isThai
          ? `จังหวัดที่มีรายได้ครัวเรือน${isBot ? 'ต่ำสุด' : 'สูงสุด'}คือ **${p.province}** เฉลี่ย ฿${formatNumber(p.income)}/เดือน`
          : `Province with ${isBot ? 'lowest' : 'highest'} household income: **${p.province}** — ฿${formatNumber(p.income)}/month`;
      }
      const rows = top.map((p, i) => `${i + 1}. **${p.province}** — ฿${formatNumber(p.income)}/เดือน`).join('\n');
      return `${label}:\n${rows}`;
    }
  }

  // Not a simple lookup — let Gemini handle it
  return null;
}
