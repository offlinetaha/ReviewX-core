# ReviewX

**Turn Customer Reviews into Business Growth**

## Introduction

ReviewX is a Micro-SaaS designed specifically for non-technical small business owners, such as those running restaurants, salons, and gyms. It utilizes the power of AI to ingest bulk customer reviews and instantly output actionable business insights. Instead of spending hours manually reading through feedback on various platforms, ReviewX streamlines the process and helps you focus on what matters most—growing your business.

## Features

- **Easy Input:** Seamlessly paste bulk text from popular review platforms like Google, Yelp, or Amazon.
- **AI-Powered Analysis:** Leveraging the OpenAI API, ReviewX automatically identifies and extracts:
  - Top 3 Complaints (Negative Sentiment)
  - Top 3 Praises (Positive Sentiment)
  - Actionable "Owner's Item" (Strategic Advice)
  - Overall Sentiment Score (1-10)
- **History Tracking:** Securely save and track your previous analyses over time to measure business improvements.
- **Modern Dashboard:** A user-friendly, responsive interface built with React and Tailwind CSS.
- **Secure Authentication:** Robust user login and data management powered by Supabase.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* **Node.js** (v16.x or higher)
* **npm** or **yarn** or **pnpm**
* A **Supabase** account (for database and authentication)
* An **OpenAI API Key** (for AI analysis)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reviewx.git
   ```

2. Navigate to the project directory:
   ```bash
   cd reviewx
   ```

3. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Set up your environment variables:
   Create a `.env` or `.env.local` file in the root directory and add your own personal API keys. You will need to retrieve these from your Supabase and OpenAI dashboards:
   ```env
   VITE_SUPABASE_URL=<INSERT_YOUR_SUPABASE_URL_HERE>
   VITE_SUPABASE_ANON_KEY=<INSERT_YOUR_SUPABASE_ANON_KEY_HERE>
   OPENAI_API_KEY=<INSERT_YOUR_OPENAI_API_KEY_HERE>
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).
2. Sign up or log in using your email and password.
3. Once logged in, navigate to the Dashboard.
4. Paste your bulk customer reviews into the large text input area.
5. Click **"Analyze Reviews"** and wait for the AI to process the data.
6. Review your personalized insights and actionable advice!

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. 

To contribute:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Thank you so much to anyone who decides to contribute, report bugs, or request features!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
