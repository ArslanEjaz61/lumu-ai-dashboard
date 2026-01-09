# LUMU N8N Workflows

Import these JSON files directly into your n8n instance.

## Workflows

| # | Workflow | File | Trigger | Description |
|---|----------|------|---------|-------------|
| 1 | **Daily Report** | `daily_report_workflow.json` | Daily + Webhook | Performance summary to Email/Slack |
| 2 | **Budget Alert** | `budget_alert_workflow.json` | 6 hours + Webhook | Alerts when spend exceeds 80%/100% |
| 3 | **Fraud Detection** | `fraud_alert_workflow.json` | 4 hours + Webhook | Click fraud alerts with severity levels |
| 4 | **AI Optimization** | `campaign_optimization_workflow.json` | Daily + Webhook | GPT-4 campaign recommendations |
| 5 | **Weather Ads** | `weather_advertising_workflow.json` | 6 hours + Webhook | Weather-based ad suggestions (Karachi, Lahore, Islamabad) |
| 6 | **Demand Forecast** | `demand_forecasting_workflow.json` | Weekly + Webhook | Pakistan seasonal demand predictions |
| 7 | **Retargeting** | `retargeting_workflow.json` | 12 hours + Webhook | Smart audience segment campaigns |

## How to Import

1. Open n8n dashboard
2. Click **Workflows** → **Import from File**
3. Select any `.json` file from this folder
4. Configure credentials (see below)
5. Activate the workflow

## Required Credentials

Configure these in n8n **Settings** → **Credentials**:

| Credential | Used By | How to Get |
|------------|---------|------------|
| **Slack** | All workflows | [Slack App](https://api.slack.com/apps) |
| **Telegram** | Alerts | [@BotFather](https://t.me/botfather) |
| **Email (SMTP)** | Reports | Your email provider |
| **Google Sheets** | Logging | [Google Cloud Console](https://console.cloud.google.com) |
| **OpenAI** | AI workflows | [OpenAI API](https://platform.openai.com) |
| **OpenWeatherMap** | Weather | [OpenWeatherMap](https://openweathermap.org/api) |

## Environment Variables

Set these in n8n:

```
SLACK_CHANNEL=#marketing
TELEGRAM_CHAT_ID=your_chat_id
REPORT_EMAIL=team@lumu.pk
OPENWEATHER_API_KEY=your_key
```

## API Endpoints

Workflows fetch data from LUMU Dashboard API (default: `http://localhost:5000`):

- `/api/campaigns/all`
- `/api/fraud/overview`
- `/api/geo/cities`
- `/api/audience/segments`
- `/api/analytics/overview`

## Pakistan-Specific Features

- 🌙 **Ramadan/Eid** detection
- 💒 **Wedding Season** tracking
- 💰 **Salary Cycle** (1st-7th of month)
- 🏙️ **City Weather**: Karachi, Lahore, Islamabad
- 📱 **Mobile-first** audience context
