# PrioraCare

PrioraCare is an AI-powered medical pre-triage kiosk application designed for Brampton Health. It streamlines the patient intake process by providing an interactive, multi-language interface for symptom assessment, registration, and triage recommendations.

## Features

- **Multi-language Support:** Greeting messages cycle through multiple languages (English, French, Punjabi, Gujarati, Urdu, Hindi, Tamil, Spanish, Tagalog, Portuguese, Vietnamese) to welcome a diverse patient population.
- **AI-Powered Symptom Assessment:** Utilizes the Web Speech API for voice-to-text input and integrates with LLMs (via OpenRouter/Cloudflare Workers) to conduct a focused medical pre-triage conversation.
- **Patient Registration & Consent:** A seamless flow for collecting patient information (Name, DOB, Health Card details) and obtaining necessary consents.
- **Intelligent Triage:** Categorizes symptom severity (Emergency, Severe, Moderate, Mild) and provides routing recommendations (Emergency Room vs. Walk-In Clinic).
- **Dynamic QR Navigation:** Generates customized QR codes that link to Google Maps, helping patients navigate to the recommended healthcare facility.
- **Data Privacy & Security:** Features an inactivity timeout that automatically wipes session data and restarts the application to ensure patient privacy.
- **Cough Analysis:** Includes a dedicated module (`cough.html`) utilizing a Teachable Machine audio model for analyzing cough sounds.

## Technologies Used

- **Frontend:** HTML5, CSS3 (Custom Mesh Gradients, Responsive Design), Vanilla JavaScript.
- **APIs & Libraries:**
  - [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for voice recognition.
  - [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js) for mapping components.
  - [QR Code Styling](https://github.com/SumiMakito/QR-Code-Styling) for beautiful, customized QR codes.
  - [Remix Icon](https://remixicon.com/) and [Google Material Symbols](https://fonts.google.com/icons) for iconography.
  - [Teachable Machine](https://teachablemachine.withgoogle.com/) (TensorFlow.js) for audio classification.
- **Backend/AI:**
  - OpenRouter API (GLM-4.5-Air model) for intelligent triage conversations.
  - Cloudflare Workers for secure API proxying.

## Project Structure

- `index.html`: The main application entry point and UI structure.
- `script.js`: Core application logic, including navigation, AI chat integration, and session management.
- `style.css`: Modern, clean styling with animated gradients and responsive layouts.
- `cough.html`: A specialized tool for audio-based cough analysis.
- `models/`: Contains the pre-trained Teachable Machine model files.
- `images/`: Brand assets and icons.

## How it Works

1. **Welcome:** Patients are greeted in multiple languages.
2. **Consent:** Patients review and agree to microphone and camera access for the assessment.
3. **Registration:** Patients enter their health card information and preferred language.
4. **Assessment:** An AI assistant listens to the patient's symptoms and asks follow-up questions to determine severity.
5. **Recommendation:** Based on the AI analysis, the patient is given a recommendation and a QR code for navigation.
6. **Privacy:** The session is cleared upon completion or after a period of inactivity.
