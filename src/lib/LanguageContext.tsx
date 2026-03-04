import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'th';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Sidebar
        'Sidebar.Overview': 'Overview',
        'Sidebar.RegionalAnalysis': 'Regional Analysis',
        'Sidebar.SocioEconomic': 'Socio-Economic',
        'Sidebar.Analytics': 'Analytics',
        'Sidebar.Settings': 'Settings',

        // Header
        'Header.SearchPlaceholder': 'Search data, provinces, or metrics...',
        'Header.UserRole': 'Executive User',
        'Header.UserType': 'Administrator',

        // App (Overview)
        'App.Title.overview': 'Executive Overview',
        'App.Title.regions': 'Regional Analysis',
        'App.Title.demographics': 'Socio-Economic Data',
        'App.Title.analytics': 'Analytics Hub',
        'App.Subtitle': 'Household Income Analysis - Thailand 2023',
        'App.FiltersBtn': 'Filters',
        'App.ExportBtn': 'Export Report',

        'App.Stat.TotalIncome': 'Total Monthly Income',
        'App.Stat.AvgHousehold': 'Average Household',
        'App.Stat.ProvincesTracked': 'Provinces Tracked',
        'App.Stat.EconomicGroups': 'Economic Groups',

        'App.Chart.RegionTitle': 'Income Distribution by Region',
        'App.Chart.RegionSub': 'Aggregated monthly income across major Thailand regions',
        'App.Chart.ClassTitle': 'Socio-Economic Class',
        'App.Chart.ClassSub': 'Income share by household category',

        'App.TopProv.Title': 'Top Performing Provinces',
        'App.TopProv.ViewAll': 'View All',
        'App.TopProv.MonthlyAvg': 'Monthly Avg',

        'App.AI.PromoTitle': 'Generate AI Insights for your next strategy',
        'App.AI.PromoSub': 'Our advanced analytics engine can predict economic trends based on current household data.',
        'App.AI.RunBtn': 'Run Analysis',
        'App.AI.Analyzing': 'Analyzing Data...',

        // Demographics
        'App.Demo.DistMetrics': 'Distribution Metrics',

        // Analytics
        'App.An.Title': 'Advanced Analytics & AI Hub',
        'App.An.Sub': 'Leverage advanced models to detect anomalies, forecast economic growth, and extract qualitative insights from household spending patterns.',
        'App.An.GenBtn': 'Generate Insight Report',
        'App.An.ConfigBtn': 'Configure Thresholds',
        'App.An.AIVerified': 'AI Verified',
        'App.An.AISummary': 'AI Executive Summary',
        'App.An.BasedOn': 'Based on the dataset of',
        'App.An.Provinces': 'provinces',
        'App.An.TotalIs': ', the total monthly household income across monitored segments is',
        'App.An.KeyObs': 'Key Observations:',
        'App.An.Rec': '* Recommendation: Focus policy initiatives on the Northeast region to bridge the 18% income gap identified in the lower quartile households.'
    },
    th: {
        // Sidebar
        'Sidebar.Overview': 'ภาพรวม',
        'Sidebar.RegionalAnalysis': 'วิเคราะห์รายภูมิภาค',
        'Sidebar.SocioEconomic': 'ข้อมูลสังคมเศรษฐกิจ',
        'Sidebar.Analytics': 'ศูนย์วิเคราะห์ข้อมูล',
        'Sidebar.Settings': 'การตั้งค่า',

        // Header
        'Header.SearchPlaceholder': 'ค้นหาข้อมูล, จังหวัด, หรือตัวชี้วัด...',
        'Header.UserRole': 'ผู้ใช้ระดับบริหาร',
        'Header.UserType': 'ผู้ดูแลระบบ',

        // App
        'App.Title.overview': 'ภาพรวมสำหรับผู้บริหาร',
        'App.Title.regions': 'การวิเคราะห์รายภูมิภาค',
        'App.Title.demographics': 'ข้อมูลเศรษฐกิจและสังคม',
        'App.Title.analytics': 'ศูนย์ระบบวิเคราะห์ข้อมูล (AI)',
        'App.Subtitle': 'สรุปวิเคราะห์รายได้ครัวเรือน - ประเทศไทย ปี 2566',
        'App.FiltersBtn': 'ตัวกรอง',
        'App.ExportBtn': 'ออกรายงาน',

        'App.Stat.TotalIncome': 'รายได้รวมรายเดือน',
        'App.Stat.AvgHousehold': 'รายได้ครัวเรือนเฉลี่ย',
        'App.Stat.ProvincesTracked': 'จังหวัดที่ถูกติดตาม',
        'App.Stat.EconomicGroups': 'กลุ่มประชากร',

        'App.Chart.RegionTitle': 'การกระจายรายได้ตามภูมิภาค',
        'App.Chart.RegionSub': 'สรุปรวมรายได้รายเดือนจำแนกตามภูมิภาคหลักในประเทศไทย',
        'App.Chart.ClassTitle': 'ชนชั้นทางเศรษฐกิจและสังคม',
        'App.Chart.ClassSub': 'สัดส่วนรายได้แยกตามประเภทครัวเรือน',

        'App.TopProv.Title': 'จังหวัดที่มีรายได้สูงสุด',
        'App.TopProv.ViewAll': 'ดูทั้งหมด',
        'App.TopProv.MonthlyAvg': 'เฉลี่ยรายเดือน',

        'App.AI.PromoTitle': 'สร้าง AI Insights สำหรับกำหนดกลยุทธ์ต่อไป',
        'App.AI.PromoSub': 'ระบบวิเคราะห์ขั้นสูงของเราสามารถพยากรณ์แนวโน้มเศรษฐกิจจากข้อมูลครัวเรือนในปัจจุบัน',
        'App.AI.RunBtn': 'เริ่มการวิเคราะห์',
        'App.AI.Analyzing': 'กำลังดำเนินการ...',

        // Demographics
        'App.Demo.DistMetrics': 'ตัวชี้วัดการกระจายการเงิน',

        // Analytics
        'App.An.Title': 'ศูนย์กลางการวิเคราะห์ขั้นสูงและ AI',
        'App.An.Sub': 'ใช้โมเดลปัญญาประดิษฐ์เพื่อตรวจหาความผิดปกติ พยากรณ์การเติบโตทางเศรษฐกิจ และดึงข้อมูลเชิงลึกจากรูปแบบการใช้จ่าย',
        'App.An.GenBtn': 'สร้างรายงานเชิงลึก',
        'App.An.ConfigBtn': 'ตั้งค่าเพดานข้อมูล',
        'App.An.AIVerified': 'รับรองโดย AI',
        'App.An.AISummary': 'สรุปรายงานผู้บริหารโดย AI',
        'App.An.BasedOn': 'อ้างอิงจากชุดข้อมูลทั้งหมด',
        'App.An.Provinces': 'จังหวัด',
        'App.An.TotalIs': ', โททัลรายได้ครัวเรือนรายเดือนรวมครอบคลุมทุกกลุ่มตัวอย่างอยู่ที่',
        'App.An.KeyObs': 'ข้อสังเกตสำคัญที่พบ:',
        'App.An.Rec': '* คำแนะนำเพิ่มเติม: ควรมุ่งเน้นนโยบายช่วยเหลือลงพื้นที่ภาคตะวันออกเฉียงเหนือเพื่อลดช่องว่างรายได้ 18% ในกลุ่มครัวเรือนระดับล่าง'
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'en' ? 'th' : 'en'));
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
