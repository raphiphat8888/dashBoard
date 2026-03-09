import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import thailandGeo from '../data/thailandGeo.json';

const thProvincesMapping: Record<string, string> = {
    "bangkok": "กรุงเทพมหานคร", "bangkokmetropolis": "กรุงเทพมหานคร",
    "samutprakan": "สมุทรปราการ", "nonthaburi": "นนทบุรี", "pathumthani": "ปทุมธานี",
    "phranakhonsiayutthaya": "พระนครศรีอยุธยา", "angthong": "อ่างทอง",
    "lopburi": "ลพบุรี", "singburi": "สิงห์บุรี", "chainat": "ชัยนาท",
    "saraburi": "สระบุรี", "chonburi": "ชลบุรี", "rayong": "ระยอง",
    "chanthaburi": "จันทบุรี", "trat": "ตราด", "chachoengsao": "ฉะเชิงเทรา",
    "prachinburi": "ปราจีนบุรี", "nakhonnayok": "นครนายก", "sakaeo": "สระแก้ว",
    "nakhonratchasima": "นครราชสีมา", "buriram": "บุรีรัมย์", "surin": "สุรินทร์",
    "sisaket": "ศรีสะเกษ", "ubonratchathani": "อุบลราชธานี", "yasothon": "ยโสธร",
    "chaiyaphum": "ชัยภูมิ", "amnatjaroen": "อำนาจเจริญ", "amnatcharoen": "อำนาจเจริญ",
    "buengkan": "บึงกาฬ", "nongbualamphu": "หนองบัวลำภู", "khonkaen": "ขอนแก่น",
    "udonthani": "อุดรธานี", "loei": "เลย", "nongkhai": "หนองคาย",
    "mahasarakham": "มหาสารคาม", "roiet": "ร้อยเอ็ด", "kalasin": "กาฬสินธุ์",
    "sakonnakhon": "สกลนคร", "nakhonphanom": "นครพนม", "mukdahan": "มุกดาหาร",
    "chiangmai": "เชียงใหม่", "lamphun": "ลำพูน", "lampang": "ลำปาง",
    "uttaradit": "อุตรดิตถ์", "phrae": "แพร่", "nan": "น่าน", "phayao": "พะเยา",
    "chiangrai": "เชียงราย", "maehongson": "แม่ฮ่องสอน", "nakhonsawan": "นครสวรรค์",
    "uthaithani": "อุทัยธานี", "kamphaengphet": "กำแพงเพชร", "tak": "ตาก",
    "sukhothai": "สุโขทัย", "phitsanulok": "พิษณุโลก", "phichit": "พิจิตร",
    "phetchabun": "เพชรบูรณ์", "ratchaburi": "ราชบุรี", "kanchanaburi": "กาญจนบุรี",
    "suphanburi": "สุพรรณบุรี", "nakhonpathom": "นครปฐม", "samutsakhon": "สมุทรสาคร",
    "samutsongkhram": "สมุทรสงคราม", "phetchaburi": "เพชรบุรี", "prachuapkhirikhan": "ประจวบคีรีขันธ์",
    "nakhonsithammarat": "นครศรีธรรมราช", "krabi": "กระบี่", "phangnga": "พังงา", "phuket": "ภูเก็ต",
    "suratthani": "สุราษฎร์ธานี", "ranong": "ระนอง", "chumphon": "ชุมพร",
    "songkhla": "สงขลา", "satun": "สตูล", "trang": "ตรัง", "phatthalung": "พัทลุง",
    "pattani": "ปัตตานี", "yala": "ยะลา", "narathiwat": "นราธิวาส"
};

interface MapData {
    province: string;
    income: number;
    debt: number;
}

interface ThailandMapProps {
    data: MapData[];
    language: 'en' | 'th';
    onProvinceClick?: (province: string) => void;
}

export const ThailandMap: React.FC<ThailandMapProps> = ({ data, language, onProvinceClick }) => {
    const [tooltipContent, setTooltipContent] = useState<{
        name: string;
        income: number;
        debt: number;
        x: number;
        y: number;
    } | null>(null);

    // Multi-stop D3 scale for better contrast across income levels
    const colorScale = useMemo(() => {
        // Filter out zero/empty incomes and sort
        const incomes = data.map(d => d.income).filter(i => i > 0).sort((a, b) => a - b);

        if (incomes.length === 0) {
            return scaleLinear<string>().domain([0, 1]).range(["#27272a", "#27272a"]);
        }

        const minIncome = incomes[0];
        const maxIncome = incomes[incomes.length - 1];

        // Calculate percentiles for better color distribution
        const q1 = incomes[Math.floor(incomes.length * 0.25)];
        const median = incomes[Math.floor(incomes.length * 0.50)];
        const q3 = incomes[Math.floor(incomes.length * 0.75)];

        return scaleLinear<string>()
            .domain([minIncome, q1, median, q3, maxIncome])
            .range([
                "#d1fae5", // emerald-100 (lowest income)
                "#6ee7b7", // emerald-300
                "#10b981", // emerald-500
                "#047857", // emerald-700
                "#022c22"  // emerald-950 (highest income focus)
            ]);
    }, [data]);

    const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
        const englishName = geo.properties.name || geo.properties.NAME_1 || '';
        const normalizedEnName = englishName.toLowerCase().replace(/[\s-]/g, '');
        const mappedThaiName = thProvincesMapping[normalizedEnName] || englishName;

        const provinceData = data.find(d => d.province === mappedThaiName || (d.province.includes(mappedThaiName) && mappedThaiName));

        if (provinceData) {
            setTooltipContent({
                name: language === 'en' ? englishName : provinceData.province,
                income: provinceData.income,
                debt: provinceData.debt,
                x: event.clientX,
                y: event.clientY
            });
        } else {
            setTooltipContent({
                name: language === 'en' ? englishName : mappedThaiName,
                income: 0,
                debt: 0,
                x: event.clientX,
                y: event.clientY
            });
        }
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 2500, // Appropriate scale for Thailand
                    center: [101, 13] // [Longitude, Latitude] for center of Thailand
                }}
                className="w-full h-full max-h-[600px] outline-none drop-shadow-lg"
            >
                <Geographies geography={thailandGeo as any}>
                    {({ geographies }) =>
                        geographies.map(geo => {
                            const englishName = geo.properties.name || geo.properties.NAME_1 || '';
                            const normalizedEnName = englishName.toLowerCase().replace(/[\s-]/g, '');
                            const mappedThaiName = thProvincesMapping[normalizedEnName] || englishName;

                            const provinceData = data.find(d => d.province === mappedThaiName || (mappedThaiName && d.province.includes(mappedThaiName)));

                            const fillColor = provinceData && provinceData.income > 0
                                ? colorScale(provinceData.income)
                                : "#27272a"; // Zinc-800 for empty/no data

                            return (
                                <Geography
                                    key={geo.rsmKey || englishName}
                                    geography={geo}
                                    fill={fillColor}
                                    stroke="#09090b" // Zinc-950 border
                                    strokeWidth={0.5}
                                    className="outline-none transition-all duration-300 hover:cursor-crosshair"
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#10b981", strokeWidth: 1.5, outline: "none" }, // Emerald-500 hover
                                        pressed: { fill: "#059669", outline: "none" }
                                    }}
                                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                                    onMouseLeave={() => setTooltipContent(null)}
                                    onClick={() => {
                                        if (onProvinceClick && provinceData) {
                                            onProvinceClick(provinceData.province);
                                        }
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>

            {/* Custom Interactive Tooltip */}
            {tooltipContent && (
                <div
                    className="fixed z-50 pointer-events-none bg-zinc-900/95 backdrop-blur-md border border-zinc-800 shadow-xl rounded-xl p-4 text-sm whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{
                        left: `${tooltipContent.x + 15}px`,
                        top: `${tooltipContent.y + 15}px`,
                        transform: 'translate(0, -50%)' // Center vertically relative to cursor
                    }}
                >
                    <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="font-bold text-zinc-100">{tooltipContent.name}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-zinc-500">{language === 'en' ? 'Avg Income:' : 'รายได้เฉลี่ย:'}</span>
                            <span className="font-semibold text-emerald-400">฿{tooltipContent.income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-zinc-500">{language === 'en' ? 'Avg Debt:' : 'หนี้สินเฉลี่ย:'}</span>
                            <span className="font-semibold text-rose-400">฿{tooltipContent.debt.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
