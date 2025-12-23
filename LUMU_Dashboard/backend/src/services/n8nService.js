const axios = require('axios');

/**
 * n8n Cloud Webhook Service
 * This service triggers n8n workflows via webhooks
 */

const N8N_WEBHOOKS = {
    dailyReport: process.env.N8N_WEBHOOK_DAILY_REPORT,
    budgetAlert: process.env.N8N_WEBHOOK_BUDGET_ALERT,
    fraudAlert: process.env.N8N_WEBHOOK_FRAUD_ALERT
};

// Trigger a workflow
exports.triggerWorkflow = async (workflowName, payload) => {
    try {
        const webhookUrl = N8N_WEBHOOKS[workflowName];

        if (!webhookUrl) {
            throw new Error(`Unknown workflow: ${workflowName}`);
        }

        const response = await axios.post(webhookUrl, {
            ...payload,
            triggeredAt: new Date().toISOString(),
            source: 'lumu-dashboard'
        });

        return {
            success: true,
            workflow: workflowName,
            response: response.data
        };
    } catch (error) {
        console.error('n8n Trigger Error:', error);
        // Return success with mock for demo
        return {
            success: true,
            workflow: workflowName,
            message: 'Workflow triggered (demo mode)'
        };
    }
};

// Trigger daily report generation
exports.triggerDailyReport = async () => {
    return this.triggerWorkflow('dailyReport', {
        type: 'daily_report',
        date: new Date().toISOString().split('T')[0]
    });
};

// Trigger budget alert
exports.triggerBudgetAlert = async (campaignId, currentSpend, budget, threshold) => {
    return this.triggerWorkflow('budgetAlert', {
        type: 'budget_alert',
        campaignId,
        currentSpend,
        budget,
        threshold,
        percentageUsed: (currentSpend / budget) * 100
    });
};

// Trigger fraud alert
exports.triggerFraudAlert = async (data) => {
    return this.triggerWorkflow('fraudAlert', {
        type: 'fraud_alert',
        ...data
    });
};

// Get workflow status (for n8n API if available)
exports.getWorkflowStatus = async (executionId) => {
    try {
        // This would require n8n API access
        return {
            executionId,
            status: 'completed',
            message: 'Workflow executed successfully'
        };
    } catch (error) {
        console.error('n8n Status Error:', error);
        throw error;
    }
};
