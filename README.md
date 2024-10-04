# Burzowy - React

## Overview

The Weather App is a full-stack application that fetches and displays current and historical weather data based on the user's location. It utilizes an Express server to handle API requests and a React front-end to present the data in a user-friendly interface.

## Features

- Fetches current weather data including temperature and wind speed.
- Displays weekly maximum and minimum temperatures with weather codes.
- Retrieves historical weather data from the past years.
- Interactive line chart visualizing maximum temperatures and weather conditions.
- Dynamic background based on current weather conditions.

## Tech Stack

- **Frontend**: React, Material-UI (MUI)
- **Backend**: Node.js, Express
- **APIs**: Open Meteo, IPinfo

## Project Structure

```
/Burzowy
│
├── server.js             # Express server for handling API requests
│
└── src                   # React application
    ├── App.js            # Main application component
    ├── index.js          # Application entry point
    ├── img               # Folder containing weather icons
    └── App.css           # CSS styles for the application
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TallenPeli/Burzowy
   cd Burzowy
   ```

2. Navigate to the root directory and install the server dependencies:

   ```bash
   npm install
   ```

3. Navigate to the `src` directory and install the frontend dependencies:

   ```bash
   cd src
   npm install
   ```

### Running the Application

1. Start the Express server:

   ```bash
   node ../server.js
   ```

   The server will run on `http://localhost:5000`.

2. Open a new terminal, navigate back to the `src` directory, and start the React application:

   ```bash
   npm start
   ```

   The React app will run on `http://localhost:3000`.

### Building for Production

To create a production build of the React application, follow these steps:

1. Navigate to the `src` directory:

   ```bash
   cd src
   ```

2. Build the application:

   ```bash
   npm run build
   ```

   This will create an optimized production build in the `build` folder.

3. You can serve the built application using a static file server, or you can integrate it into your Express server by serving the `build` directory.

### Deploying the Application

To deploy your application, you can use various hosting services like Heroku, Vercel, or DigitalOcean. Here’s a general approach:

1. Make sure your Express server serves the built React app from the `build` folder.
2. Set up a production environment on your chosen hosting service.
3. Push your code to the hosting service and follow their deployment instructions.

## Usage

Upon starting the application, the Weather App will fetch the user's location using their IP address and display the current weather conditions along with a chart visualizing the weekly temperatures and conditions. The app will also show historical weather data for comparison.

## Contributing

If you would like to contribute to the project, please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
```