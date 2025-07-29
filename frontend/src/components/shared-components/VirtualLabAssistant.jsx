import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, BookOpen, HelpCircle, ClipboardCheck, Bot, BotMessageSquare } from 'lucide-react';
import './scrollbar.css'; // Import the custom scrollbar styles
import axios from 'axios';

export default function VirtualLabAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Hello! I\'m your Virtual Lab Assistant. I can help you with experiments, explain procedures, or quiz you on concepts. How can I help you today?' 
    }
  ]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Add new state for AI chat
  const [aiMessages, setAiMessages] = useState([
    { 
      type: 'bot', 
      content: 'Hello! I\'m an advanced AI assistant powered by OpenRouter. I can help you with detailed information about any topic. What would you like to know?' 
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiMessagesEndRef = useRef(null);
  
  // Auto focus input when opened
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Load available experiments when component mounts
  const [experiments, setExperiments] = useState([]);
  const [experimentData, setExperimentData] = useState({});
  
  useEffect(() => {
    // Fetch available experiments from the backend
    const fetchExperiments = async () => {
      try {
        const response = await axios.get('/api/assistant/experiments');
        setExperiments(response.data.experiments || []);
      } catch (error) {
        console.error('Error fetching experiments:', error);
        setExperiments([]); // Ensure experiments is always an array
      }
    };
    
    fetchExperiments();
  }, []);

  const handleSend = () => {
    if (input.trim() === '') return;
    
    // Add user message
    setMessages([...messages, { type: 'user', content: input }]);
    processUserInput(input);
    setInput('');
  };
  const processUserInput = (text) => {
    setIsThinking(true);

    // axios.post('/api/assistant/ai-chat', { message: text })
    // .then(response => {.....
    //   // ..yet to implement


    axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/assistant/chat`, { message: text })
    // axios.post('/api/assistant/chat', { message: text })
      .then(response => {
        const { type, experiment, data, message } = response.data;
        
        switch(type) {
          case 'procedure':
            setMessages(prev => [...prev, { 
              type: 'bot', 
              content: `### ${experiment.charAt(0).toUpperCase() + experiment.slice(1)} Procedure\n\n${data.map((step, i) => `${i+1}. ${step}`).join('\n')}`
            }]);
            break;
          
          case 'quiz':
            startQuiz(experiment, data);
            break;
            
          case 'faqs':
            setMessages(prev => [...prev, { 
              type: 'bot', 
              content: `### Frequently Asked Questions about ${experiment.charAt(0).toUpperCase() + experiment.slice(1)}\n\n${data.map(faq => `**Q: ${faq.question}**\nA: ${faq.answer}`).join('\n\n')}`
            }]);
            break;
            
          case 'list':
          case 'info':
          case 'general':
          default:
            setMessages(prev => [...prev, { 
              type: 'bot', 
              content: message
            }]);
            break;
        }
        
        setIsThinking(false);
      })
      .catch(error => {
        console.error('Error communicating with lab assistant:', error);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }]);
        setIsThinking(false);
      });
  };

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const startQuiz = (experiment, quizData) => {
    setCurrentQuiz({
      experiment: experiment,
      questions: quizData,
      currentQuestion: 0
    });
    setQuizAnswers([]);
    setQuizComplete(false);
    
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: `Let's start a quiz on ${experiment}. I'll ask you ${quizData.length} questions.`
    }]);
    
    // Show first question
    const question = quizData[0];
    setMessages(prev => [...prev, { 
      type: 'quiz', 
      question: question.question,
      options: question.options,
      questionIndex: 0
    }]);
  };

  const handleOptionSelect = (questionIndex, selectedOption) => {
    if (!currentQuiz) return;
    
    const question = currentQuiz.questions[questionIndex];
    const isCorrect = selectedOption === question.answer;
    
    setQuizAnswers(prev => [...prev, { 
      question: question.question,
      selectedOption,
      correct: isCorrect
    }]);
    
    setMessages(prev => [...prev, {
      type: 'bot',
      content: isCorrect ? 
        `Correct! ${question.answer} is the right answer.` : 
        `That's not quite right. The correct answer is: ${question.answer}`
    }]);
    
    // Check if more questions exist
    if (questionIndex < currentQuiz.questions.length - 1) {
      const nextQuestion = currentQuiz.questions[questionIndex + 1];
      setMessages(prev => [...prev, { 
        type: 'quiz', 
        question: nextQuestion.question,
        options: nextQuestion.options,
        questionIndex: questionIndex + 1
      }]);
    } else {
      // Quiz complete
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizComplete(true);
    const correctAnswers = quizAnswers.filter(a => a.correct).length;
    const totalQuestions = currentQuiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: `Quiz complete! You scored ${correctAnswers}/${totalQuestions} (${percentage}%).`
    }]);
    
    setCurrentQuiz(null);
  };
    const switchTab = (tab) => {
    setActiveTab(tab);
    
    // Fixed the condition: add safe check for experiments array
    if (tab === 'procedures' && Array.isArray(experiments) && experiments.length > 0 && 
        Object.keys(experimentData || {}).length === 0) {
      fetchExperimentData();
    }
  };
  
  // Fetch experiment data for the procedures tab
  const fetchExperimentData = async () => {
    try {
      const procedureData = {};
      
      // For each experiment, get the first procedure step
      for (const experiment of experiments) {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/assistant/chat`, { 
          message: `procedure ${experiment}` 
        });
        
        if (response.data.type === 'procedure' && response.data.data.length > 0) {
          procedureData[experiment] = {
            firstStep: response.data.data[0],
            allSteps: response.data.data
          };
        }
      }
      
      setExperimentData(procedureData);
    } catch (error) {
      console.error('Error fetching experiment data:', error);
    }
  };
  
  // Function to show full procedure in chat
  const showProcedureFromAPI = async (experiment) => {
    setIsThinking(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/assistant/chat`, { 
        message: `procedure ${experiment}` 
      });
      
      if (response.data.type === 'procedure') {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `### ${experiment.charAt(0).toUpperCase() + experiment.slice(1)} Procedure\n\n${response.data.data.map((step, i) => `${i+1}. ${step}`).join('\n')}`
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Sorry, I couldn't find the procedure for ${experiment}.`
        }]);
      }
    } catch (error) {
      console.error('Error fetching procedure:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error fetching the procedure. Please try again.'
      }]);
    }
    
    setIsThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Add function to handle AI chat
  const handleAiSend = () => {
    if (aiInput.trim() === '') return;
    
    // Add user message to AI chat
    setAiMessages(prev => [...prev, { type: 'user', content: aiInput }]);
    processAiChat(aiInput);
    setAiInput('');
  };
  
  const processAiChat = (text) => {
    setIsAiThinking(true);
    
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/assistant/ai-chat`, { message: text })
      .then(response => {
        setAiMessages(prev => [...prev, { 
          type: 'bot', 
          content: response.data.message
        }]);
        setIsAiThinking(false);
      })
      .catch(error => {
        console.error('Error communicating with AI:', error);
        setAiMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }]);
        setIsAiThinking(false);
      });
  };
  
  const handleAiKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  };
  
  // Update useEffect to scroll to bottom for both chat tabs
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'ai-chat') {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiMessages, activeTab]);
  
  return (
    <div className="flex flex-col h-full w-full bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center shadow-md border-b border-gray-700">
        <Bot className="h-6 w-6 mr-3 text-teal-400" />
        <h1 className="font-bold text-xl">Virtual Lab Assistant</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex bg-gray-800 text-white font-medium">
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'chat' ? 'bg-gray-700 border-b-2 border-teal-400' : 'hover:bg-gray-700'}`} 
          onClick={() => switchTab('chat')}
        >
          <MessageCircle size={18} className="mr-2 text-teal-400" /> Chat
        </button>
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'procedures' ? 'bg-gray-700 border-b-2 border-teal-400' : 'hover:bg-gray-700'}`} 
          onClick={() => switchTab('procedures')}
        >
          <BookOpen size={18} className="mr-2 text-teal-400" /> Procedures
        </button>
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'help' ? 'bg-gray-700 border-b-2 border-teal-400' : 'hover:bg-gray-700'}`} 
          onClick={() => switchTab('help')}
        >
          <HelpCircle size={18} className="mr-2 text-teal-400" /> Help
        </button>
        <button 
          className={`flex-1 py-3 px-4 flex items-center justify-center transition-colors ${activeTab === 'ai-chat' ? 'bg-gray-700 border-b-2 border-teal-400' : 'hover:bg-gray-700'}`} 
          onClick={() => switchTab('ai-chat')}
        >
          <BotMessageSquare size={18} className="mr-2 text-teal-400" /> Ai-Chat
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-800 chat-scrollbar">
        {activeTab === 'chat' && (
          <>
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === 'user' && (
                  <div className="flex justify-end mb-4">
                    <div className="bg-teal-600 text-white rounded-2xl py-3 px-4 max-w-xs shadow-sm">
                      {message.content}
                    </div>
                  </div>
                )}
                {message.type === 'bot' && (
                  <div className="flex mb-4">
                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow">
                        <Bot size={16} className="text-teal-400" />
                      </div>
                      <div className="bg-gray-700 border border-gray-600 rounded-2xl py-3 px-5 pl-8 max-w-xs shadow-sm ml-4">
                        <div className="whitespace-pre-line text-gray-200">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'quiz' && (
                  <div className="flex mb-5">
                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow">
                        <ClipboardCheck size={16} className="text-teal-400" />
                      </div>
                      <div className="bg-gray-700 border border-gray-600 rounded-lg py-4 px-5 pl-8 max-w-sm shadow-sm ml-4 w-full">
                        <div className="font-medium text-gray-200 mb-3">{message.question}</div>
                        <div className="space-y-2">
                          {message.options.map((option, i) => (
                            <button 
                              key={i}
                              className="w-full text-left py-3 px-4 bg-gray-800 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors flex items-center"
                              onClick={() => handleOptionSelect(message.questionIndex, option)}
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-teal-500 flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-teal-400">{String.fromCharCode(65 + i)}</span>
                              </div>
                              <span className="text-gray-300">{option}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex mb-4">
                <div className="relative">
                  <div className="absolute -left-2 -top-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow">
                    <Bot size={16} className="text-teal-400" />
                  </div>
                  <div className="bg-gray-700 border border-gray-600 rounded-2xl py-3 px-4 pl-8 shadow-sm ml-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
          {activeTab === 'procedures' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-teal-400 mb-4">Available Experiment Procedures</h2>
            {!Array.isArray(experiments) || experiments.length === 0 ? (
              <div className="bg-gray-700 p-5 rounded-lg text-gray-300">Loading available experiments...</div>
            ) : (
              experiments.map((exp, index) => (
                <div key={index} className="bg-gray-700 p-5 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-teal-400 mb-2 text-lg">{exp.charAt(0).toUpperCase() + exp.slice(1)}</h3>
                  <p className="text-gray-300 mb-4">
                    {experimentData[exp]?.firstStep || "Click to view the procedure for this experiment..."}
                  </p>
                  <button 
                    className="text-sm bg-gray-800 text-teal-400 py-2 px-4 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 font-medium flex items-center"
                    onClick={() => {
                      switchTab('chat');
                      showProcedureFromAPI(exp);
                    }}
                  >
                    <BookOpen size={16} className="mr-2" />
                    View Full Procedure
                  </button>
                </div>
              ))
            )}
          </div>
        )}
          {activeTab === 'help' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-teal-400 mb-4">How to Use the Virtual Lab Assistant</h2>
            
            <div className="bg-gray-700 p-5 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <MessageCircle className="text-teal-400 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-teal-400 mb-2">Asking About Experiments</h3>
                  <p className="text-gray-300">
                    You can ask about any experiment by name. For example, "Tell me about titration" or "What is spectrophotometry?"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 p-5 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <BookOpen className="text-teal-400 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-teal-400 mb-2">Learning Procedures</h3>
                  <p className="text-gray-300">
                    Ask for specific steps by saying "Show me the titration procedure" or "How do I perform spectrophotometry?"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 p-5 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <ClipboardCheck className="text-teal-400 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-teal-400 mb-2">Taking Quizzes</h3>
                  <p className="text-gray-300">
                    Test your knowledge by saying "Quiz me on titration" or "I want to take a spectrophotometry test"
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 p-5 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <HelpCircle className="text-teal-400 mr-3 mt-1" size={20} />
                <div>
                  <h3 className="font-medium text-teal-400 mb-2">Available Experiments</h3>
                  {!Array.isArray(experiments) || experiments.length === 0 ? (
                    <p className="text-gray-300">Loading available experiments...</p>
                  ) : (
                    <ul className="space-y-2 text-gray-300">
                      {experiments.map((exp, i) => (
                        <li key={i} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-teal-400 mr-2"></div>
                          {exp.charAt(0).toUpperCase() + exp.slice(1)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'ai-chat' && (
          <>
            {aiMessages.map((message, index) => (
              <div key={index}>
                {message.type === 'user' && (
                  <div className="flex justify-end mb-4">
                    <div className="bg-purple-600 text-white rounded-2xl py-3 px-4 max-w-xs shadow-sm">
                      {message.content}
                    </div>
                  </div>
                )}
                {message.type === 'bot' && (
                  <div className="flex mb-4">
                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow">
                        <BotMessageSquare size={16} className="text-purple-400" />
                      </div>
                      <div className="bg-gray-700 border border-gray-600 rounded-2xl py-3 px-5 pl-8 max-w-xs shadow-sm ml-4">
                        <div className="whitespace-pre-line text-gray-200">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isAiThinking && (
              <div className="flex mb-4">
                <div className="relative">
                  <div className="absolute -left-2 -top-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow">
                    <BotMessageSquare size={16} className="text-purple-400" />
                  </div>
                  <div className="bg-gray-700 border border-gray-600 rounded-2xl py-3 px-4 pl-8 shadow-sm ml-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={aiMessagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input area - update to handle both chat tabs */}
      {(activeTab === 'chat' || activeTab === 'ai-chat') && (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex relative">
            <input
              className={`flex-1 border border-gray-600 bg-gray-700 text-white rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 ${activeTab === 'chat' ? 'focus:ring-teal-500 focus:border-teal-500' : 'focus:ring-purple-500 focus:border-purple-500'} transition-all placeholder-gray-400`}
              placeholder={activeTab === 'chat' ? "Ask about an experiment..." : "Ask me anything..."}
              value={activeTab === 'chat' ? input : aiInput}
              onChange={(e) => activeTab === 'chat' ? setInput(e.target.value) : setAiInput(e.target.value)}
              onKeyDown={activeTab === 'chat' ? handleKeyDown : handleAiKeyDown}
              ref={inputRef}
            />
            <button
              className={`absolute right-1 top-1 bottom-1 ${activeTab === 'chat' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-purple-600 hover:bg-purple-500'} text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors`}
              onClick={activeTab === 'chat' ? handleSend : handleAiSend}
              disabled={(activeTab === 'chat' ? !input.trim() : !aiInput.trim())}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}