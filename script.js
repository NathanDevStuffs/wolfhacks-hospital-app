function generateQR() {
  const text = document.getElementById("text").value;

  if (!text) {
    alert("Please enter text or URL");
    return;
  }

  document.getElementById("qrcode").innerHTML = "";

  new QRCode(document.getElementById("qrcode"), {
    text: text,
    width: 200,
    height: 200
  });
}

const languages = ['English', 'French', 'Punjabi', 'Gujarati', 'Urdu', 'Hindi', 'Tamil', 'Spanish', 'Tagalog', 'Portuguese', 'Vietnamese'];
let currentLanguageIndex = 0;

function cycleLanguages() {
  const h2 = document.getElementById('started');
  const h1 = document.getElementById('hi');
  
  // Fade out
  h1.style.opacity = '0';
  h1.style.transition = 'opacity 0.5s ease-in-out';
  h2.style.opacity = '0';
  h2.style.transition = 'opacity 0.5s ease-in-out';
  
  setTimeout(() => {
    currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
    h2.textContent = getGreeting(languages[currentLanguageIndex]);
    h1.textContent = getH1Greeting(languages[currentLanguageIndex]);

    // Fade in
    h2.style.opacity = '1';
    h1.style.opacity = '1';
  }, 500);
}

function getGreeting(language) {
  const greetings = {
    'English': "Let's get started.",
    'French': "Commençons.",
    'Punjabi': "ਆਓ ਸ਼ੁਰੂ ਕਰੀਏ.",
    'Gujarati': "ચાલો શરૂ કરીએ.",
    'Urdu': "چلیں شروع کریں.",
    'Hindi': "चलो शुरू करें.",
    'Tamil': "வாங்க தொடங்குவோம்.",
    'Spanish': "Vamos a empezar.",
    'Tagalog': "Magsimula tayo.",
    'Portuguese': "Vamos começar.",
    'Vietnamese': "Hãy bắt đầu."
  };
  return greetings[language];
}

function getH1Greeting(language) {
  const h1Greetings = {
    'English': "Hi, Brampton 👋",
    'French': "Salut, Brampton 👋",
    'Punjabi': "ਹੈਲੋ, ਬਰੈਂਪਟਨ 👋",
    'Gujarati': "હાય, બ્રેમ્પટન 👋",
    'Urdu': "ہیلو، برامپٹن 👋",
    'Hindi': "हाय, ब्रैम्पटन 👋",
    'Tamil': "ஹாய், பிராம்ப்டன் 👋",
    'Spanish': "Hola, Brampton 👋",
    'Tagalog': "Kumusta, Brampton 👋",
    'Portuguese': "Olá, Brampton 👋",
    'Vietnamese': "Xin chào, Brampton 👋"
  };
  return h1Greetings[language];
}

// Start cycling every 3 seconds
setInterval(cycleLanguages, 3000);

// Initialize with fade in on page load
document.getElementById('started').style.opacity = '0';
document.getElementById('started').style.transition = 'opacity 0.5s ease-in-out';
document.getElementById('hi').style.opacity = '0';
document.getElementById('hi').style.transition = 'opacity 0.5s ease-in-out';
setTimeout(() => {
  document.getElementById('started').style.opacity = '1';
  document.getElementById('hi').style.opacity = '1';
}, 100);

// Navigation logic
const startBtn = document.getElementById('startBtn');
const editBtn = document.getElementById('editBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const consentScreen = document.getElementById('consentScreen'); 

startBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    consentScreen.style.display = 'block';
    initTimeout();
});

editBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    consentScreen.style.display = 'block';
    initTimeout();
});

//replace under here
const OPENROUTER_KEY = "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";
let aiIsTalking = false;
let silenceTimer = null;
let convoHistory = [];
let sessionFinished = false;
let patientDOB = null;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;

// Elements
const micIcon = document.getElementById('micIcon');
const eqElement = document.getElementById('pillEqualizer');
const transcriptText = document.getElementById('pillTranscript');
const chatBox = document.getElementById('chatWindow');

function buildSystemPrompt() {
    return `You are PrioraCare AI, a medical pre-triage assistant for PrioraCare, a healthcare kiosk service in Brampton, Ontario. The patient's date of birth is ${patientDOB || 'unknown'}.

Your job is to collect a complete list of the patient's symptoms and assess their severity before handing off to medical staff.

CONVERSATION FLOW:

1. For each symptom the patient mentions, ask ONE focused follow-up question to assess severity:
   - "How long have you had [symptom]?"
   - "On a scale of 1–10, how would you rate the pain/discomfort?"
   - "Is it constant or does it come and go?"

2. After gathering details on that symptom, ALWAYS ask: "Is that all the symptoms you are experiencing, or is there anything else?"

3. If the patient mentions more symptoms, repeat step 1–2. Never finish until the patient confirms they are done.

4. Only once the patient clearly confirms they are done (e.g. "yes", "that's all", "nothing else"), output the finish block.

MEMORY:
You have full memory of this conversation. Never ask about a symptom already mentioned. Reference prior answers when relevant.

TONE:
- Warm, calm, professional
- Never alarming, never diagnose — assess and triage only
- Keep responses short: 2–4 sentences max per turn

FINISH PROTOCOL:
Once the patient confirms they are done, your VERY NEXT message must be exactly two lines — nothing before, nothing after:

--FINISH--
{"severity": "<level>", "symptoms": ["<symptom1>", "<symptom2>"], "section": "<destination>"}

Severity levels:
- "emergency" — life-threatening (chest pain, difficulty breathing, stroke symptoms, severe bleeding, unconsciousness, high fever in infant)
- "severe" — urgent but stable (high fever, severe pain 8–10/10, vomiting blood, suspected fracture)
- "moderate" — needs prompt attention (moderate pain 4–7/10, persistent vomiting, infection signs)
- "mild" — non-urgent (minor pain 1–3/10, cold/flu, minor injury, rash)

Section routing:
- "ER" — emergency room
- "WC" — to walk in clinic`;
}

function toggleMicUI(isListening) {
    if (isListening) {
        micIcon.style.display = 'none';
        eqElement.style.display = 'flex';
        transcriptText.style.color = '#000';
    } else {
        micIcon.style.display = 'block';
        eqElement.style.display = 'none';
        transcriptText.style.color = '#999';
    }
}

recognition.onresult = (event) => {
    if (aiIsTalking || sessionFinished) return;

    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        interim += event.results[i][0].transcript;
    }

    transcriptText.textContent = interim;
    toggleMicUI(true);

    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        if (interim.trim()) {
            processUserVoice(interim.trim());
        }
    }, 2000);
};

async function processUserVoice(text) {
    aiIsTalking = true;
    recognition.stop();
    toggleMicUI(false);

    addBubble(text, 'user');
    transcriptText.textContent = "AI is responding...";

    await streamAIResponse(text);
}

async function streamAIResponse(text) {
    const aiBubble = addBubble("", 'assistant');
    let fullResponse = "";

    try {
const response = await fetch("https://wolfhacks.nathanplayzofficial.workers.dev/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "z-ai/glm-4.5-air:free",
                messages: [
                    { role: "system", content: buildSystemPrompt() },
                    ...convoHistory,
                    { role: "user", content: text }
                ],
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '');
                    if (dataStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(dataStr);
                        const content = json.choices[0].delta.content || "";
                        fullResponse += content;

                        // Don't render finish tag visually
                        if (!fullResponse.includes('{{--FINISH--}}')) {
                            aiBubble.textContent = fullResponse;
                        }

                        chatBox.scrollTop = chatBox.scrollHeight;
                    } catch (e) {}
                }
            }
        }

        convoHistory.push({ role: "user", content: text });
        convoHistory.push({ role: "assistant", content: fullResponse });

        // Check for finish signal AFTER full response is assembled
        if (fullResponse.includes('--FINISH--')) {
            console.log("Finish signal detected. Ending session.");
            aiBubble.remove(); // Remove the empty/partial bubble
            handleFinish(fullResponse);
            return;
        }

    } finally {
        if (!sessionFinished) {
            aiIsTalking = false;
            transcriptText.textContent = "Listening again...";
            recognition.start();
        }
    }
}

function handleFinish(rawMessage) {
    sessionFinished = true;
    aiIsTalking = true;

    const parts = rawMessage.split('--FINISH--');
    const jsonPart = parts[1]?.trim();

    let triageData = null;
    try {
        triageData = JSON.parse(jsonPart);
    } catch (e) {
        console.error('Failed to parse triage JSON:', e, jsonPart);
    }

    // Switch screens
    document.getElementById('aiAssessment').style.display = 'none';
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.style.display = 'block';

    if (!triageData) {
        document.getElementById('resultRecommendation').textContent = 'We could not fully process your assessment. Please speak to a staff member at the front desk.';
        return;
    }

    const sectionLabels = {
        'ER': 'Emergency Room',
        'WC': 'Walk-In Clinic'
    };
    const severityColors = {
        emergency: '#c62828',
        severe:    '#e65100',
        moderate:  '#f59e0b',
        mild:      '#2e7d32'
    };
    const severityIcons = {
        emergency: 'emergency',
        severe:    'warning',
        moderate:  'priority_high',
        mild:      'check_circle'
    };
    const recommendations = {
        'ER': 'Based on your symptoms, we recommend you proceed to the <strong>Emergency Room</strong> immediately.',
        'WC': 'Based on your symptoms, we recommend you visit a <strong>Walk-In Clinic</strong>.'
    };

    const section = triageData.section;
    const severity = triageData.severity;
    const color = severityColors[severity] || '#005da6';
    const icon = severityIcons[severity] || 'medical_services';
    const sectionLabel = sectionLabels[section] || section;

    // Recommendation line
    document.getElementById('resultRecommendation').innerHTML = recommendations[section] || `Please proceed to ${sectionLabel}.`;

    // Severity badge
    document.getElementById('resultSeverityBadge').innerHTML = `
        <span class="material-symbols-outlined" style="color: ${color};">${icon}</span>
        <p style="font-weight: 600; color: ${color}; text-transform: capitalize; font-size: 16px;">
            ${severity} priority &mdash; ${sectionLabel}
        </p>
    `;

    // Symptoms list
    const list = document.getElementById('resultSymptomsList');
    list.innerHTML = '';
    triageData.symptoms.forEach(symptom => {
        const li = document.createElement('li');
        li.textContent = symptom.charAt(0).toUpperCase() + symptom.slice(1);
        list.appendChild(li);
    });

    // --- NEW: Generate Dynamic Google Maps QR Code ---
    const qrContainer = document.getElementById('qrContainer');
    const qrElement = document.getElementById('qrcode');
    const qrInstructions = document.getElementById('qrInstructions');
    
    // Clear any previous QR codes
    qrElement.innerHTML = ''; 
    qrContainer.style.display = 'block';

    let mapQuery = '';
    if (section === 'ER') {
        mapQuery = 'Emergency+Room+Brampton';
        qrInstructions.textContent = 'Scan to navigate to the nearest Emergency Room';
    } else {
        mapQuery = 'Walk-in+Clinic+Brampton';
        qrInstructions.textContent = 'Scan to navigate to the nearest Walk-in Clinic';
    }

    // This URL will force Google Maps to search for the query relative to the user's phone GPS
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    // Generate beautiful QR code using the qr-code-styling library
    const qrCode = new QRCodeStyling({
        width: 180,
        height: 180,
        data: mapsUrl,
        dotsOptions: {
            color: color, // Matches the severity color (e.g., red for ER)
            type: "rounded"
        },
        backgroundOptions: {
            color: "#FFFFFF",
        },
        cornersSquareOptions: {
            type: "extra-rounded"
        }
    });
    
    qrCode.append(qrElement);

    // Restart button
    // Note: I removed the confirmBtn logic as the QR code now acts as the action
    document.getElementById('restartBtn').addEventListener('click', () => {
        if (confirm('This will delete all your session data. Are you sure?')) {
            location.reload();
        }
    });
}

function addBubble(text, type) {
    const b = document.createElement('div');
    b.className = `ai-bubble ${type}`;
    b.textContent = text;
    chatBox.appendChild(b);
    chatBox.scrollTop = chatBox.scrollHeight;
    return b;
}

// Capture patient data from registration form
document.getElementById('patientForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get DOB value
    patientDOB = document.getElementById('dob').value;
    
    // Navigate to AI assessment screen
    document.getElementById('registrationScreen').style.display = 'none';
    document.getElementById('symptomsCheckerScreen').style.display = 'block';
});

// Consent screen to registration

document.getElementById('disagreeBtn').addEventListener('click', () => {
    location.reload();
    
});

document.getElementById('cancelBtn2').addEventListener('click', () => {
    location.reload();

});
document.getElementById('agreeBtn').addEventListener('click', () => {
    document.getElementById('registrationScreen').style.display = 'block';
    document.getElementById('consentScreen').style.display = 'none';
});

document.getElementById('aiBtn').addEventListener('click', () => {
    document.getElementById('symptomsCheckerScreen').style.display = 'none';
    document.getElementById('aiAssessment').style.display = 'block';
    recognition.start();
});

// --- Inactivity Timeout Logic ---
let idleTimer;
let countdownTimer;
let isSessionActive = false; // Flag to track if the session has started
const IDLE_TIME = 60000  ; 
const COUNTDOWN_TIME = 10; 

// Create the countdown overlay
const overlay = document.createElement('div');
overlay.id = 'idleOverlay';
overlay.style.cssText = `
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); color: white; z-index: 9999;
    flex-direction: column; justify-content: center; align-items: center;
    font-family: 'Outfit', sans-serif; text-align: center;
`;
overlay.innerHTML = `
    <h1 style="font-size: 2.5rem;">Are you still there?</h1>
    <p style="font-size: 1.2rem;">Clearing data and restarting in <span id="idleCount" style="font-weight:bold; color: #005da6;">10</span> seconds.</p>
    <button class="regularButton" id="stayBtn" style="margin-top: 20px;">I'm still here</button>
`;
document.body.appendChild(overlay);

const countSpan = document.getElementById('idleCount');

function initTimeout() {
    isSessionActive = true;
    resetIdleTimer();
    
    // Start listening for movement only after session starts
    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(event => {
        window.addEventListener(event, resetIdleTimer);
    });
}

function resetIdleTimer() {
    if (!isSessionActive) return;

    overlay.style.display = 'none';
    clearInterval(countdownTimer);
    clearTimeout(idleTimer);
    
    idleTimer = setTimeout(startCountdown, IDLE_TIME);
}

function startCountdown() {
    let timeLeft = COUNTDOWN_TIME;
    overlay.style.display = 'flex';
    countSpan.textContent = timeLeft;

    countdownTimer = setInterval(() => {
        timeLeft--;
        countSpan.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            location.reload(); // Refresh wipes all patient data (DOB, history, etc.)
        }
    }, 1000);
}

document.getElementById('stayBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    resetIdleTimer();
});

document.getElementById('disagreeBtn').addEventListener('click', () => {
    location.reload();
});