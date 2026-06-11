# PrioraCare

PrioraCare is an AI-powered healthcare pre-triage kiosk designed for Brampton, Ontario. It helps patients assess their symptoms through an interactive AI assistant and provides recommendations for appropriate care, whether it's the Emergency Room or a Walk-In Clinic.

## Features

- **Multilingual Support**: A welcoming interface that cycles through multiple languages including English, French, Punjabi, Gujarati, Urdu, Hindi, Tamil, Spanish, Tagalog, Portuguese, and Vietnamese.
- **Patient Registration & Consent**: A streamlined workflow to collect patient information and medical consent securely.
- **AI-Driven Symptom Assessment**: An interactive chat assistant that gathers symptom details and assesses severity.
- **Automated Triage**: Provides instant recommendations (e.g., ER vs. Walk-In Clinic) based on the AI assessment.
- **QR Code Navigation**: Generates a dynamic QR code that patients can scan to get GPS navigation directly to the recommended healthcare facility in Brampton.
- **Cough Analysis**: Includes a specialized module (`cough.html`) utilizing a Teachable Machine audio model to analyze coughs.
- **Inactivity Timeout**: Automatically clears patient data and restarts the session after a period of inactivity to ensure privacy.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Mapbox GL JS
- **AI/ML**: TensorFlow.js (Speech Commands), Teachable Machine
- **Utilities**:
  - [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) for beautiful QR codes.
  - Remix Icon & Material Symbols for iconography.
  - Google Fonts (Outfit, Montserrat, Instrument Sans).

## Getting Started

Since PrioraCare is a static web application, you can run it locally without any complex setup:

1. Clone the repository.
2. Open `index.html` in any modern web browser.

For the cough analysis feature, you can open `cough.html`.

## Project Structure

- `index.html`: The main entry point for the kiosk application.
- `script.js`: Contains the application logic, including the AI chat integration and UI state management.
- `style.css`: Defines the visual styling and layout.
- `cough.html`: A standalone module for audio-based cough analysis.
- `images/`: Contains project assets like logos and icons.
- `models/`: Contains the pre-trained models for audio recognition.

---
*Note: This is a pre-triage assessment tool only. All final medical decisions are made by healthcare professionals.*
