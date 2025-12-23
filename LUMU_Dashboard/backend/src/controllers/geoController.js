const ga4Service = require('../services/ga4Service');

// Pakistan city tier classification
const CITY_TIERS = {
    tier1: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
    tier2: ['Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot', 'Hyderabad'],
    tier3: ['Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Mardan', 'Abbottabad']
};

// Get geo overview
exports.getGeoOverview = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getGeoData(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Geo Overview Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get city-wise data
exports.getCityData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getCityData(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('City Data Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get tier-wise breakdown
exports.getTierBreakdown = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const cityData = await ga4Service.getCityData(startDate, endDate);

        // Categorize cities by tier
        const tierData = {
            tier1: { cities: [], totalSales: 0, totalUsers: 0 },
            tier2: { cities: [], totalSales: 0, totalUsers: 0 },
            tier3: { cities: [], totalSales: 0, totalUsers: 0 },
            other: { cities: [], totalSales: 0, totalUsers: 0 }
        };

        cityData.forEach(city => {
            let tier = 'other';

            if (CITY_TIERS.tier1.includes(city.name)) tier = 'tier1';
            else if (CITY_TIERS.tier2.includes(city.name)) tier = 'tier2';
            else if (CITY_TIERS.tier3.includes(city.name)) tier = 'tier3';

            tierData[tier].cities.push(city);
            tierData[tier].totalSales += city.sales || 0;
            tierData[tier].totalUsers += city.users || 0;
        });

        res.json(tierData);
    } catch (error) {
        console.error('Tier Breakdown Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get region-wise data
exports.getRegionData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getRegionData(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Region Data Error:', error);
        res.status(500).json({ error: error.message });
    }
};
