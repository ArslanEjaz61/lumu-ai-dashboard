/**
 * Seed Script - Populate MongoDB with initial data for all LUMU Dashboard features
 * Run with: node src/scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const { BudgetAllocation, HourlySpend, BudgetRecommendation } = require('../models/BudgetAllocation');
const { TriggerRule, SeasonalEvent, WeatherCache } = require('../models/TriggerRule');
const { FunnelStage, CROAlert, CTASuggestion, ABTest, PagePerformance } = require('../models/CROData');
const { RetargetingFlow, CustomerSegment, RetargetingActivity, ChannelPerformance } = require('../models/RetargetingFlow');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumu_dashboard')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function seedData() {
    try {
        console.log('🌱 Starting seed process...\n');

        // ========== BUDGET ALLOCATIONS ==========
        console.log('💰 Seeding Budget Allocations...');
        await BudgetAllocation.deleteMany({});

        const budgetData = [
            {
                platform: 'Facebook',
                percentage: 35,
                dailyBudget: 3500,
                totalBudget: 35000,
                spent: 24500,
                remaining: 10500,
                color: '#1877F2',
                isActive: true,
                dayPerformance: { spend: 12000, conversions: 60, cpc: 45, roas: 2.8 },
                nightPerformance: { spend: 12500, conversions: 95, cpc: 28, roas: 4.2 }
            },
            {
                platform: 'Instagram',
                percentage: 30,
                dailyBudget: 3000,
                totalBudget: 30000,
                spent: 21000,
                remaining: 9000,
                color: '#E4405F',
                isActive: true,
                dayPerformance: { spend: 10000, conversions: 50, cpc: 42, roas: 2.5 },
                nightPerformance: { spend: 11000, conversions: 85, cpc: 25, roas: 4.5 }
            },
            {
                platform: 'Google Ads',
                percentage: 25,
                dailyBudget: 2500,
                totalBudget: 25000,
                spent: 17500,
                remaining: 7500,
                color: '#4285F4',
                isActive: true,
                dayPerformance: { spend: 9000, conversions: 45, cpc: 50, roas: 2.2 },
                nightPerformance: { spend: 8500, conversions: 55, cpc: 35, roas: 3.8 }
            },
            {
                platform: 'YouTube',
                percentage: 10,
                dailyBudget: 1000,
                totalBudget: 10000,
                spent: 7000,
                remaining: 3000,
                color: '#FF0000',
                isActive: true,
                dayPerformance: { spend: 3500, conversions: 15, cpc: 55, roas: 1.8 },
                nightPerformance: { spend: 3500, conversions: 25, cpc: 40, roas: 3.2 }
            }
        ];
        await BudgetAllocation.insertMany(budgetData);
        console.log('   ✅ Created 4 budget allocations');

        // Hourly Spend
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hourlyData = [
            { platform: 'All', hour: '6AM', spend: 500, conversions: 5, date: today },
            { platform: 'All', hour: '9AM', spend: 1200, conversions: 12, date: today },
            { platform: 'All', hour: '12PM', spend: 1500, conversions: 18, date: today },
            { platform: 'All', hour: '3PM', spend: 1800, conversions: 22, date: today },
            { platform: 'All', hour: '6PM', spend: 2500, conversions: 35, date: today },
            { platform: 'All', hour: '9PM', spend: 3000, conversions: 45, date: today },
            { platform: 'All', hour: '12AM', spend: 800, conversions: 8, date: today }
        ];
        await HourlySpend.deleteMany({});
        await HourlySpend.insertMany(hourlyData);
        console.log('   ✅ Created hourly spend data');

        // Budget Recommendations
        await BudgetRecommendation.deleteMany({});
        const recommendations = [
            {
                type: 'increase',
                platform: 'Instagram',
                current: 30,
                suggested: 40,
                reason: 'Higher ROAS (4.5x) during evening hours',
                impact: '+15% conversions expected',
                priority: 'high'
            },
            {
                type: 'decrease',
                platform: 'Google Ads',
                current: 25,
                suggested: 18,
                reason: 'CPC increased 25% this week',
                impact: 'Save PKR 12,000/week',
                priority: 'medium'
            },
            {
                type: 'shift',
                platform: 'Facebook',
                current: 'Day',
                suggested: 'Night (7-11 PM)',
                reason: 'Peak engagement window',
                impact: '+22% CTR improvement',
                priority: 'high'
            }
        ];
        await BudgetRecommendation.insertMany(recommendations);
        console.log('   ✅ Created 3 AI recommendations');

        // ========== TRIGGER RULES ==========
        console.log('\n⚡ Seeding Trigger Rules...');
        await TriggerRule.deleteMany({});

        const triggerRules = [
            {
                name: 'Hot Weather Campaign',
                type: 'weather',
                condition: 'Temperature > 35°C',
                conditionDetails: { temperature: { min: 35 } },
                action: 'Promote AC, beverages, summer wear',
                actionDetails: { platforms: ['Facebook', 'Instagram'], budgetChange: 20 },
                status: 'active',
                triggered: 12,
                lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
                priority: 8
            },
            {
                name: 'Rainy Day Promos',
                type: 'weather',
                condition: 'Rain detected',
                conditionDetails: { weatherType: 'Rain' },
                action: 'Push raincoat, umbrella, indoor products',
                actionDetails: { platforms: ['Facebook', 'Google Ads'] },
                status: 'active',
                triggered: 5,
                lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
                priority: 7
            },
            {
                name: 'Weekend Outdoor',
                type: 'time',
                condition: 'Weekend + Sunny',
                conditionDetails: { days: ['Saturday', 'Sunday'], weatherType: 'Sunny' },
                action: 'Promote outdoor activities, picnic items',
                actionDetails: { platforms: ['Instagram'] },
                status: 'inactive',
                triggered: 8,
                lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                priority: 5
            },
            {
                name: 'Evening Food Delivery',
                type: 'time',
                condition: 'Evening (6-10 PM)',
                conditionDetails: { startHour: 18, endHour: 22 },
                action: 'Food delivery, entertainment ads',
                actionDetails: { platforms: ['Facebook', 'Instagram', 'YouTube'] },
                status: 'active',
                triggered: 45,
                lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000),
                priority: 9
            }
        ];
        await TriggerRule.insertMany(triggerRules);
        console.log('   ✅ Created 4 trigger rules');

        // Seasonal Events
        await SeasonalEvent.deleteMany({});
        const seasonalEvents = [
            {
                name: 'Ramadan',
                slug: 'ramadan',
                startDate: new Date('2026-03-10'),
                endDate: new Date('2026-04-09'),
                rules: [
                    { description: 'Night ads +50% budget', action: 'increase_budget', isApplied: true },
                    { description: 'Iftar time messaging', action: 'schedule_ads', isApplied: true },
                    { description: 'Sehri promos', action: 'morning_campaign', isApplied: false }
                ],
                expectedImpact: '+45% engagement'
            },
            {
                name: 'Eid ul Fitr',
                slug: 'eid-ul-fitr',
                startDate: new Date('2026-04-10'),
                endDate: new Date('2026-04-12'),
                rules: [
                    { description: 'Family messaging', action: 'family_creative', isApplied: false },
                    { description: 'Gift offers', action: 'gift_campaign', isApplied: false },
                    { description: 'Festive creatives', action: 'festive_theme', isApplied: false }
                ],
                expectedImpact: '+80% sales'
            },
            {
                name: 'Independence Day',
                slug: 'independence-day',
                startDate: new Date('2026-08-14'),
                endDate: new Date('2026-08-14'),
                rules: [
                    { description: 'Patriotic theme', action: 'patriotic_creative', isApplied: false },
                    { description: 'Green/White colors', action: 'color_theme', isApplied: false },
                    { description: 'National spirit', action: 'national_campaign', isApplied: false }
                ],
                expectedImpact: '+35% engagement'
            },
            {
                name: 'Summer Sale',
                slug: 'summer-sale',
                startDate: new Date('2026-06-01'),
                endDate: new Date('2026-08-31'),
                rules: [
                    { description: 'Hot weather products', action: 'summer_products', isApplied: false },
                    { description: 'AC/Fan promos', action: 'cooling_products', isApplied: false },
                    { description: 'Beverage ads', action: 'beverage_campaign', isApplied: false }
                ],
                expectedImpact: '+60% conversions'
            }
        ];
        await SeasonalEvent.insertMany(seasonalEvents);
        console.log('   ✅ Created 4 seasonal events');

        // ========== CRO DATA ==========
        console.log('\n📊 Seeding CRO Data...');

        // Funnel Stages
        await FunnelStage.deleteMany({});
        const funnelStages = [
            { name: 'Page Views', order: 1, value: 100000, rate: 100 },
            { name: 'Product Views', order: 2, value: 45000, rate: 45 },
            { name: 'Add to Cart', order: 3, value: 12000, rate: 12 },
            { name: 'Checkout', order: 4, value: 5000, rate: 5 },
            { name: 'Purchase', order: 5, value: 2500, rate: 2.5 }
        ];
        await FunnelStage.insertMany(funnelStages);
        console.log('   ✅ Created 5 funnel stages');

        // CRO Alerts
        await CROAlert.deleteMany({});
        const croAlerts = [
            {
                stage: 'Product View → Add to Cart',
                fromStage: 'Product Views',
                toStage: 'Add to Cart',
                dropRate: 73,
                avgDropRate: 60,
                severity: 'high',
                issue: 'Price visibility issue on mobile',
                suggestion: 'Add prominent "Add to Cart" button above fold',
                potentialRevenue: 450000
            },
            {
                stage: 'Add to Cart → Checkout',
                fromStage: 'Add to Cart',
                toStage: 'Checkout',
                dropRate: 58,
                avgDropRate: 50,
                severity: 'medium',
                issue: 'High shipping cost display',
                suggestion: 'Show free shipping threshold earlier',
                potentialRevenue: 280000
            },
            {
                stage: 'Checkout → Purchase',
                fromStage: 'Checkout',
                toStage: 'Purchase',
                dropRate: 50,
                avgDropRate: 40,
                severity: 'high',
                issue: 'Payment failure on certain banks',
                suggestion: 'Add more payment options (JazzCash, EasyPaisa)',
                potentialRevenue: 520000
            }
        ];
        await CROAlert.insertMany(croAlerts);
        console.log('   ✅ Created 3 CRO alerts');

        // CTA Suggestions
        await CTASuggestion.deleteMany({});
        const ctaSuggestions = [
            { page: 'Product Page', current: 'Buy Now', suggested: 'Get Yours - 20% Off Today!', expectedLift: '+18% CTR' },
            { page: 'Category Page', current: 'Add to Cart', suggested: 'Add to Cart - Only 3 Left!', expectedLift: '+25% CTR' },
            { page: 'Checkout', current: 'Complete Order', suggested: 'Complete Order - Free Delivery!', expectedLift: '+12% Conversion' }
        ];
        await CTASuggestion.insertMany(ctaSuggestions);
        console.log('   ✅ Created 3 CTA suggestions');

        // A/B Tests
        await ABTest.deleteMany({});
        const abTests = [
            { name: 'Hero Image Style', description: 'Test lifestyle vs product-only images', variationA: 'Lifestyle', variationB: 'Product Only', status: 'draft', impact: 'high' },
            { name: 'CTA Button Color', description: 'Compare green vs orange buttons', variationA: 'Green', variationB: 'Orange', status: 'draft', impact: 'medium' },
            { name: 'Free Shipping Banner', description: 'Test banner placement', variationA: 'Top', variationB: 'Bottom', status: 'draft', impact: 'high' },
            { name: 'Reviews Position', description: 'Reviews above or below fold', variationA: 'Above Fold', variationB: 'Below Fold', status: 'draft', impact: 'medium' }
        ];
        await ABTest.insertMany(abTests);
        console.log('   ✅ Created 4 A/B tests');

        // Page Performance
        await PagePerformance.deleteMany({});
        const pagePerformance = [
            { page: 'Home', url: '/', views: 45000, bounceRate: 35, avgTime: '2:30', avgTimeSeconds: 150 },
            { page: 'Category', url: '/category', views: 32000, bounceRate: 42, avgTime: '1:45', avgTimeSeconds: 105 },
            { page: 'Product', url: '/product', views: 28000, bounceRate: 55, avgTime: '3:10', avgTimeSeconds: 190 },
            { page: 'Cart', url: '/cart', views: 12000, bounceRate: 25, avgTime: '2:00', avgTimeSeconds: 120 },
            { page: 'Checkout', url: '/checkout', views: 5000, bounceRate: 48, avgTime: '4:20', avgTimeSeconds: 260 }
        ];
        await PagePerformance.insertMany(pagePerformance);
        console.log('   ✅ Created 5 page performance records');

        // ========== RETARGETING DATA ==========
        console.log('\n🔄 Seeding Retargeting Data...');

        // Retargeting Flows
        await RetargetingFlow.deleteMany({});
        const retargetingFlows = [
            {
                name: 'Cart Abandonment',
                type: 'cart_abandonment',
                triggers: 'Abandoned cart > 1 hour',
                triggerConditions: { timeDelay: 1, minCartValue: 500 },
                steps: [
                    { order: 1, type: 'email', delay: '1h', delayMinutes: 60, template: 'cart_reminder', subject: 'You left something behind!' },
                    { order: 2, type: 'sms', delay: '24h', delayMinutes: 1440, template: 'cart_sms' },
                    { order: 3, type: 'ad', delay: '48h', delayMinutes: 2880, template: 'cart_retarget_ad' },
                    { order: 4, type: 'email', delay: '72h', delayMinutes: 4320, template: 'cart_discount', subject: '10% off to complete your order!' }
                ],
                status: 'active',
                audience: 12500,
                conversions: 850,
                revenue: 1250000,
                conversionRate: 6.8
            },
            {
                name: 'Viewed Not Purchased',
                type: 'viewed_not_purchased',
                triggers: 'Viewed product 3+ times',
                triggerConditions: { productViews: 3 },
                steps: [
                    { order: 1, type: 'email', delay: '24h', delayMinutes: 1440, template: 'product_reminder', subject: 'Still thinking about it?' },
                    { order: 2, type: 'ad', delay: '48h', delayMinutes: 2880, template: 'product_retarget' },
                    { order: 3, type: 'email', delay: '7d', delayMinutes: 10080, template: 'similar_products', subject: 'Related products you might like' }
                ],
                status: 'active',
                audience: 8200,
                conversions: 420,
                revenue: 680000,
                conversionRate: 5.1
            },
            {
                name: 'Wishlist Reminders',
                type: 'wishlist',
                triggers: 'Item in wishlist > 7 days',
                triggerConditions: { timeDelay: 168 },
                steps: [
                    { order: 1, type: 'email', delay: '7d', delayMinutes: 10080, template: 'wishlist_reminder', subject: 'Your wishlist is waiting!' },
                    { order: 2, type: 'email', delay: '14d', delayMinutes: 20160, template: 'price_drop', subject: 'Price drop on your wishlist item!' },
                    { order: 3, type: 'push', delay: '21d', delayMinutes: 30240, template: 'stock_alert' }
                ],
                status: 'active',
                audience: 5600,
                conversions: 280,
                revenue: 420000,
                conversionRate: 5.0
            },
            {
                name: 'Win Back Campaign',
                type: 'win_back',
                triggers: 'No purchase in 60 days',
                triggerConditions: { daysSinceLastPurchase: 60 },
                steps: [
                    { order: 1, type: 'email', delay: '60d', delayMinutes: 86400, template: 'win_back_1', subject: 'We miss you!' },
                    { order: 2, type: 'email', delay: '75d', delayMinutes: 108000, template: 'special_offer', subject: 'Special offer just for you - 20% off!' },
                    { order: 3, type: 'email', delay: '90d', delayMinutes: 129600, template: 'final_call', subject: 'Last chance: Exclusive discount inside' }
                ],
                status: 'paused',
                audience: 15000,
                conversions: 320,
                revenue: 480000,
                conversionRate: 2.1
            }
        ];
        await RetargetingFlow.insertMany(retargetingFlows);
        console.log('   ✅ Created 4 retargeting flows');

        // Customer Segments
        await CustomerSegment.deleteMany({});
        const customerSegments = [
            { name: 'New Visitors', slug: 'new-visitors', count: 45000, criteria: { purchaseCount: { max: 0 } }, actions: ['Welcome offer', 'First purchase discount'], color: '#3b82f6', icon: 'Users' },
            { name: 'One-time Buyers', slug: 'one-time-buyers', count: 18000, criteria: { purchaseCount: { min: 1, max: 1 } }, actions: ['Second purchase incentive', 'Category recommendations'], color: '#10b981', icon: 'ShoppingCart' },
            { name: 'Repeat Customers', slug: 'repeat-customers', count: 8500, criteria: { purchaseCount: { min: 2, max: 5 } }, actions: ['Loyalty points', 'Early access'], color: '#f59e0b', icon: 'RefreshCw' },
            { name: 'VIP/Loyal', slug: 'vip-loyal', count: 2200, criteria: { purchaseCount: { min: 6 }, totalSpent: { min: 50000 } }, actions: ['Exclusive deals', 'VIP support'], color: '#8b5cf6', icon: 'Crown' },
            { name: 'At Risk', slug: 'at-risk', count: 5600, criteria: { lastPurchaseDays: { min: 30 } }, actions: ['Win-back offers', 'Feedback request'], color: '#ef4444', icon: 'AlertCircle' }
        ];
        await CustomerSegment.insertMany(customerSegments);
        console.log('   ✅ Created 5 customer segments');

        // Retargeting Activity
        await RetargetingActivity.deleteMany({});
        const activities = [
            { flow: 'Cart Abandonment', user: 'ahmed***@gmail.com', action: 'Email sent', actionType: 'email', status: 'sent' },
            { flow: 'Viewed Not Purchased', user: 'sara***@hotmail.com', action: 'Ad served', actionType: 'ad', status: 'clicked' },
            { flow: 'Wishlist Reminders', user: 'ali***@gmail.com', action: 'Price drop alert', actionType: 'email', status: 'converted', revenue: 4500 },
            { flow: 'Cart Abandonment', user: 'fatima***@yahoo.com', action: 'SMS sent', actionType: 'sms', status: 'sent' },
            { flow: 'Win Back', user: 'usman***@gmail.com', action: 'Special offer', actionType: 'email', status: 'opened' }
        ];
        await RetargetingActivity.insertMany(activities);
        console.log('   ✅ Created 5 activity records');

        // Channel Performance
        await ChannelPerformance.deleteMany({});
        const channelPerf = [
            { channel: 'email', metrics: { sent: 5000, delivered: 4800, opened: 2016, clicked: 504, conversions: 252, revenue: 567000 }, rates: { deliveryRate: 96, openRate: 42, clickRate: 10.5, conversionRate: 5.25 } },
            { channel: 'sms', metrics: { sent: 2000, delivered: 1560, opened: 0, clicked: 156, conversions: 78, revenue: 175500 }, rates: { deliveryRate: 78, openRate: 0, clickRate: 10, conversionRate: 5 } },
            { channel: 'ads', metrics: { sent: 50000, delivered: 50000, opened: 0, clicked: 1600, conversions: 320, revenue: 720000 }, rates: { deliveryRate: 100, openRate: 0, clickRate: 3.2, conversionRate: 20 } }
        ];
        await ChannelPerformance.insertMany(channelPerf);
        console.log('   ✅ Created 3 channel performance records');

        console.log('\n✅ ========================================');
        console.log('✅ SEED COMPLETED SUCCESSFULLY!');
        console.log('✅ ========================================\n');

        console.log('📋 Summary:');
        console.log('   • 4 Budget Allocations');
        console.log('   • 7 Hourly Spend Records');
        console.log('   • 3 AI Recommendations');
        console.log('   • 4 Trigger Rules');
        console.log('   • 4 Seasonal Events');
        console.log('   • 5 Funnel Stages');
        console.log('   • 3 CRO Alerts');
        console.log('   • 3 CTA Suggestions');
        console.log('   • 4 A/B Tests');
        console.log('   • 5 Page Performance Records');
        console.log('   • 4 Retargeting Flows');
        console.log('   • 5 Customer Segments');
        console.log('   • 5 Activity Records');
        console.log('   • 3 Channel Performance Records\n');

    } catch (error) {
        console.error('❌ Seed Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

seedData();
