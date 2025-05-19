# Should I buy a daily pass?

## Overview

A modern, user-friendly web application that helps commuters calculate fares for RapidKL train journeys in Kuala Lumpur. This tool simplifies trip planning by providing accurate fare information and recommending when to purchase a daily pass for better value.

## Features

- **Station Selection**: Choose from a comprehensive list of RapidKL train stations
- **Real-time Fare Calculation**: Instantly view fares based on official RapidKL rates
- **Return Journey Calculation**: Calculate round-trip costs with one click
- **Concession Support**: Special pricing for students and senior citizens
- **Daily Pass Recommendation**: Smart suggestions for when to purchase a daily pass
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme

## Screenshots

![Calculator Interface](/public/screenshot-calculator.png)
![Fare Results](/public/screenshot-results.png)

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Shadcn UI
- **Form Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS

## Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone this repository

```bash
git clone https://github.com/yourusername/fare-calculator.git
cd fare-calculator
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

The application fetches real-time fare data from the RapidKL API. When users select origin and destination stations, the app:

1. Retrieves fare information for different payment methods (cash, cashless, concession)
2. Calculates return journey costs when applicable
3. Analyzes whether purchasing a daily pass (RM6) would be more economical
4. Displays a clear breakdown of all applicable fares

## Usage

1. Select your origin station from the dropdown
2. Select your destination station
3. Toggle "Return" if you're planning a round trip
4. Toggle "I have a concession card" if applicable
5. Click "Calculate Fare"
6. View the detailed fare breakdown and daily pass recommendation
