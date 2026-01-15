// Triggers Controller - Weather & Seasonal Triggers with Real MongoDB Data
const { TriggerRule, SeasonalEvent, WeatherCache } = require('../models/TriggerRule');
const axios = require('axios');

// Get all trigger rules
exports.getRules = async (req, res) => {
    try {
        const rules = await TriggerRule.find().sort({ priority: -1, createdAt: -1 });
        res.json({ rules });
    } catch (error) {
        console.error('Rules Error:', error);
        res.status(500).json({ error: 'Failed to get rules' });
    }
};

// Create new rule
exports.createRule = async (req, res) => {
    try {
        const { name, type, condition, conditionDetails, action, actionDetails, priority } = req.body;

        const rule = new TriggerRule({
            name: name || condition,
            type: type || 'custom',
            condition,
            conditionDetails,
            action,
            actionDetails,
            priority: priority || 5
        });

        await rule.save();

        res.status(201).json({ success: true, rule });
    } catch (error) {
        console.error('Create Rule Error:', error);
        res.status(500).json({ error: 'Failed to create rule' });
    }
};

// Update rule
exports.updateRule = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const rule = await TriggerRule.findByIdAndUpdate(id, updates, { new: true });

        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.json({ success: true, rule });
    } catch (error) {
        console.error('Update Rule Error:', error);
        res.status(500).json({ error: 'Failed to update rule' });
    }
};

// Delete rule
exports.deleteRule = async (req, res) => {
    try {
        const { id } = req.params;

        const rule = await TriggerRule.findByIdAndDelete(id);

        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.json({ success: true, deletedId: id });
    } catch (error) {
        console.error('Delete Rule Error:', error);
        res.status(500).json({ error: 'Failed to delete rule' });
    }
};

// Toggle rule status
exports.toggleRule = async (req, res) => {
    try {
        const { id } = req.params;

        const rule = await TriggerRule.findById(id);
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        rule.status = rule.status === 'active' ? 'inactive' : 'active';
        await rule.save();

        res.json({ success: true, rule });
    } catch (error) {
        console.error('Toggle Rule Error:', error);
        res.status(500).json({ error: 'Failed to toggle rule' });
    }
};

// Trigger a rule (for n8n agents)
exports.triggerRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { result } = req.body;

        const rule = await TriggerRule.findByIdAndUpdate(
            id,
            {
                $inc: { triggered: 1 },
                lastTriggered: new Date(),
                lastTriggeredResult: result || 'success'
            },
            { new: true }
        );

        res.json({ success: true, rule });
    } catch (error) {
        console.error('Trigger Rule Error:', error);
        res.status(500).json({ error: 'Failed to trigger rule' });
    }
};

// Get current weather
exports.getWeather = async (req, res) => {
    try {
        const { city = 'Karachi' } = req.query;

        // Check cache first
        let weather = await WeatherCache.findOne({ city });

        if (!weather) {
            // Try to fetch from weather API if configured
            const apiKey = process.env.OPENWEATHER_API_KEY;

            if (apiKey) {
                try {
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?q=${city},PK&appid=${apiKey}&units=metric`
                    );

                    const data = response.data;

                    weather = new WeatherCache({
                        city,
                        country: 'Pakistan',
                        temperature: Math.round(data.main.temp),
                        condition: data.weather[0].main,
                        humidity: data.main.humidity,
                        wind: Math.round(data.wind.speed),
                        forecast: [] // Would need separate API call for forecast
                    });

                    await weather.save();
                } catch (apiError) {
                    console.error('Weather API Error:', apiError.message);
                }
            }

            // If no API or API failed, return default
            if (!weather) {
                weather = {
                    city,
                    country: 'Pakistan',
                    temperature: 30,
                    condition: 'Sunny',
                    humidity: 60,
                    wind: 10,
                    forecast: [
                        { day: 'Today', temp: 30, condition: 'Sunny' },
                        { day: 'Tomorrow', temp: 28, condition: 'Cloudy' },
                        { day: 'Wed', temp: 25, condition: 'Rainy' },
                        { day: 'Thu', temp: 29, condition: 'Sunny' },
                        { day: 'Fri', temp: 31, condition: 'Sunny' }
                    ]
                };
            }
        }

        res.json(weather);
    } catch (error) {
        console.error('Weather Error:', error);
        res.status(500).json({ error: 'Failed to get weather' });
    }
};

// Get seasonal events
exports.getEvents = async (req, res) => {
    try {
        const events = await SeasonalEvent.find().sort({ startDate: 1 });

        // Update isActive based on current date
        const now = new Date();
        const updatedEvents = events.map(event => {
            const isActive = now >= event.startDate && now <= event.endDate;
            return {
                ...event.toObject(),
                isActive
            };
        });

        res.json({ events: updatedEvents });
    } catch (error) {
        console.error('Events Error:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
};

// Create/Update seasonal event
exports.upsertEvent = async (req, res) => {
    try {
        const { slug, name, startDate, endDate, rules, expectedImpact, notes } = req.body;

        const event = await SeasonalEvent.findOneAndUpdate(
            { slug },
            { name, startDate, endDate, rules, expectedImpact, notes },
            { new: true, upsert: true }
        );

        res.json({ success: true, event });
    } catch (error) {
        console.error('Upsert Event Error:', error);
        res.status(500).json({ error: 'Failed to save event' });
    }
};
