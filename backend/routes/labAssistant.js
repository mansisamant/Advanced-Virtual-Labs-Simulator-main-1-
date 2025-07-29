import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Knowledge base for lab assistant
const knowledgeBase = {
  'titration': {
    procedure: [
      'Clean your burette with distilled water and rinse with the titrant.',
      'Fill the burette with the titrant and remove any air bubbles.',
      'Pipette a precise volume of the analyte into a clean conical flask.',
      'Add 2-3 drops of indicator to the analyte.',
      'Slowly add titrant while swirling the flask until the endpoint is reached.',
      'Record the final volume and calculate concentration using the formula: C₁V₁ = C₂V₂'
    ],
    faqs: [
      { 
        question: 'What is an indicator?', 
        answer: 'An indicator is a substance that changes color at the endpoint of a titration, signaling when the reaction is complete.' 
      },
      { 
        question: 'What is the endpoint?', 
        answer: 'The endpoint is the point at which the indicator changes color, signaling the completion of the reaction.' 
      },
      { 
        question: 'Why do we swirl the flask?', 
        answer: 'Swirling ensures proper mixing of the titrant and analyte, leading to a more accurate result.' 
      }
    ],
    quiz: [
      {
        question: 'What formula is used to calculate concentration in titration?',
        options: ['C₁V₁ = C₂V₂', 'PV = nRT', 'E = mc²', 'F = ma'],
        answer: 'C₁V₁ = C₂V₂'
      },
      {
        question: 'Which of these is NOT a common indicator in acid-base titrations?',
        options: ['Phenolphthalein', 'Methyl orange', 'Copper sulfate', 'Bromothymol blue'],
        answer: 'Copper sulfate'
      },
      {
        question: 'The color change that signals the reaction is complete is called:',
        options: ['Transition point', 'Endpoint', 'Equilibrium', 'Termination'],
        answer: 'Endpoint'
      }
    ]
  },
  'spectrophotometry': {
    procedure: [
      'Turn on the spectrophotometer and allow it to warm up for 15-20 minutes.',
      'Prepare blank and sample solutions according to your experiment protocol.',
      'Calibrate the instrument with the blank solution.',
      'Measure the absorbance of your samples at the appropriate wavelength.',
      'Create a calibration curve using standards of known concentration.',
      'Calculate the concentration of unknown samples using the Beer-Lambert Law: A = ɛcl'
    ],
    faqs: [
      { 
        question: 'What is Beer-Lambert Law?', 
        answer: 'The Beer-Lambert Law states that absorbance is directly proportional to concentration and path length: A = ɛcl, where ɛ is the molar absorptivity, c is concentration, and l is path length.' 
      },
      { 
        question: 'Why do we need a blank?', 
        answer: 'A blank solution contains everything except the analyte and is used to zero the instrument, accounting for background absorption.' 
      },
      { 
        question: 'How do I choose wavelength?', 
        answer: 'Select the wavelength at which your analyte has maximum absorbance for best sensitivity, typically determined by running a wavelength scan.' 
      }
    ],
    quiz: [
      {
        question: 'The Beer-Lambert Law is represented by which equation?',
        options: ['A = ɛcl', 'PV = nRT', 'E = hν', 'F = kx'],
        answer: 'A = ɛcl'
      },
      {
        question: 'What does a spectrophotometer measure?',
        options: ['Light absorption', 'Electrical conductivity', 'pH levels', 'Magnetic fields'],
        answer: 'Light absorption'
      },
      {
        question: 'What is the purpose of creating a calibration curve?',
        options: [
          'To determine unknown concentrations',
          'To adjust the spectrophotometer',
          'To test the cuvette',
          'To measure wavelength'
        ],
        answer: 'To determine unknown concentrations'
      }
    ]
  }
};

// Process messages and generate appropriate responses
function processMessage(message) {
  message = message.toLowerCase();
  
  // Check if the message is asking about an experiment
  const experimentKeywords = Object.keys(knowledgeBase);
  const matchedExperiment = experimentKeywords.find(exp => message.includes(exp.toLowerCase()));
  console.log("Processing message:", message, "Matched experiment:", matchedExperiment);
  if (matchedExperiment) {
    // If asking about procedure
    if (message.includes('procedure') || message.includes('steps') || message.includes('how to')) {
      return {
        type: 'procedure',
        experiment: matchedExperiment,
        data: knowledgeBase[matchedExperiment].procedure
      };
    }
    
    // If asking for a quiz
    if (message.includes('quiz') || message.includes('test') || message.includes('question')) {
      return {
        type: 'quiz',
        experiment: matchedExperiment,
        data: knowledgeBase[matchedExperiment].quiz
      };
    }
    
    // If asking FAQ or general info
    if (message.includes('faq') || message.includes('explain') || message.includes('what is')) {
      return {
        type: 'faqs',
        experiment: matchedExperiment,
        data: knowledgeBase[matchedExperiment].faqs
      };
    }
    
    // Default to sending general info about the experiment
    return {
      type: 'info',
      experiment: matchedExperiment,
      message: `I have information about ${matchedExperiment}. You can ask about the procedure, take a quiz, or ask frequently asked questions.`
    };
  }
  
  // List available experiments
  if (message.includes('experiment') || message.includes('lab') || message.includes('what can you help')) {
    return {
      type: 'list',
      message: `I can help you with the following experiments: ${experimentKeywords.join(', ')}. Just ask me about any of these!`
    };
  }
  
  // Default response
  return {
    type: 'general',
    message: "I'm your Virtual Lab Assistant. I can help you understand experimental procedures, quiz you on concepts, or answer FAQs about lab experiments. What would you like to know about?"
  };
}

// Route to handle chat messages
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = processMessage(message);
    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get available experiments
router.get('/experiments', (req, res) => {
  try {
    const experiments = Object.keys(knowledgeBase);
    res.json({ experiments });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add the AI chat endpoint
router.post('/ai-chat', async (req, res) => {
  try {
    const { message } = req.body;

    console.log('AI chat request received:', message);
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: message
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Virtual Lab Assistant'
        }
      }
    );

    // Extract the response content
    const aiResponse = response.data.choices[0].message.content;
    console.log('AI response:', aiResponse.slice(0, 50)); 
    return res.json({ 
      success: true, 
      message: aiResponse
    });
    
  } catch (error) {
    console.error('Error in AI chat:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get AI response'
    });
  }
});

export default router;