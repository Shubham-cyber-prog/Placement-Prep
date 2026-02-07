import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Users, CheckCircle2, X, Mic, MicOff,
  Camera, CameraOff, Play, Pause, Square, BarChart3,
  MessageSquare, Star, Award, Target, TrendingUp,
  ChevronLeft, ChevronRight, Timer, AlertTriangle,
  BookOpen, Lightbulb, Zap, Brain, Video, Home,
  ChevronDown, ChevronUp, Download, Share2, Volume2,
  VolumeX, Eye, EyeOff, RefreshCcw, Settings,
  Type, Captions, MessageCircle, FileText, Volume1
} from "lucide-react";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Types
interface InterviewSession {
  id: string;
  company: string;
  role: string;
  type: 'technical' | 'behavioral' | 'system-design' | 'hr' | 'mock' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledAt: Date;
  duration: number;
  score?: number;
  feedback?: {
    strengths: string[];
    areasToImprove: string[];
    overallFeedback: string;
    recommendedResources: string[];
  };
  recordingUrl?: string;
  transcription?: string[];
  aiAnalysis?: {
    sentiment: string;
    confidence: number;
    communicationScore: number;
    technicalScore: number;
    behavioralScore: number;
  };
}

interface InterviewQuestion {
  id: number;
  question: string;
  type: string;
  company: string;
  difficulty: string;
  timeLimit: number;
  category: string;
}

interface InterviewResponse {
  questionId: number;
  answer: string;
  timeTaken: number;
  transcription?: string;
}

const MockInterview = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'system-design' | 'hr'>('technical');
  const [company, setCompany] = useState('Google');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [duration, setDuration] = useState(60);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true); // Default to enabled
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [transcription, setTranscription] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [speakingTime, setSpeakingTime] = useState<number>(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionRef = useRef<string>('');
  const speechRecognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          transcriptionRef.current += finalTranscript + ' ';
          setTranscription(transcriptionRef.current);
          
          // Update the answer textarea with the transcription
          if (isMicEnabled && isListening) {
            setUserAnswer(prev => prev + finalTranscript + ' ');
          }
        }
      };

      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition error: ' + event.error);
      };
    } else {
      toast.warning('Speech recognition not supported in this browser. Using fallback audio recording.');
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Sample companies
  const companies = [
    'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix',
    'Goldman Sachs', 'McKinsey', 'Adobe', 'Uber', 'Airbnb', 'Stripe'
  ];

  // Sample interview questions
  const sampleQuestions: Record<string, InterviewQuestion[]> = {
    technical: [
      { id: 1, question: "Explain the time and space complexity of your solution to the two-sum problem.", type: 'technical', company: 'Google', difficulty: 'medium', timeLimit: 15, category: 'Algorithms' },
      { id: 2, question: "How would you design a URL shortening service like bit.ly?", type: 'technical', company: 'Google', difficulty: 'hard', timeLimit: 20, category: 'System Design' },
      { id: 3, question: "Implement a function to detect a cycle in a linked list.", type: 'technical', company: 'Amazon', difficulty: 'medium', timeLimit: 15, category: 'Data Structures' },
      { id: 4, question: "Explain the difference between TCP and UDP protocols.", type: 'technical', company: 'Microsoft', difficulty: 'easy', timeLimit: 10, category: 'Networking' },
      { id: 5, question: "How does garbage collection work in JavaScript?", type: 'technical', company: 'Meta', difficulty: 'medium', timeLimit: 15, category: 'Language Specific' }
    ],
    behavioral: [
      { id: 1, question: "Tell me about a time when you faced a difficult technical challenge.", type: 'behavioral', company: 'Google', difficulty: 'medium', timeLimit: 10, category: 'Experience' },
      { id: 2, question: "How do you handle disagreements with team members?", type: 'behavioral', company: 'Amazon', difficulty: 'medium', timeLimit: 10, category: 'Teamwork' },
      { id: 3, question: "Describe your approach to learning new technologies.", type: 'behavioral', company: 'Microsoft', difficulty: 'easy', timeLimit: 10, category: 'Learning' },
      { id: 4, question: "Tell me about a project you worked on that you're particularly proud of.", type: 'behavioral', company: 'Meta', difficulty: 'medium', timeLimit: 10, category: 'Accomplishments' },
      { id: 5, question: "How do you prioritize tasks when you have multiple deadlines?", type: 'behavioral', company: 'Apple', difficulty: 'medium', timeLimit: 10, category: 'Time Management' }
    ],
    'system-design': [
      { id: 1, question: "Design a notification system for a large-scale application.", type: 'system-design', company: 'Netflix', difficulty: 'hard', timeLimit: 25, category: 'System Design' },
      { id: 2, question: "How would you design Instagram's feed system?", type: 'system-design', company: 'Meta', difficulty: 'expert', timeLimit: 30, category: 'System Design' },
      { id: 3, question: "Design a rate limiting system for an API.", type: 'system-design', company: 'Stripe', difficulty: 'hard', timeLimit: 20, category: 'System Design' },
      { id: 4, question: "How would you design a distributed file storage system?", type: 'system-design', company: 'Google', difficulty: 'expert', timeLimit: 30, category: 'System Design' },
      { id: 5, question: "Design a recommendation engine for an e-commerce platform.", type: 'system-design', company: 'Amazon', difficulty: 'hard', timeLimit: 25, category: 'System Design' }
    ],
    hr: [
      { id: 1, question: "Why do you want to work for our company?", type: 'hr', company: 'Google', difficulty: 'easy', timeLimit: 5, category: 'Motivation' },
      { id: 2, question: "Where do you see yourself in 5 years?", type: 'hr', company: 'Amazon', difficulty: 'easy', timeLimit: 5, category: 'Career Goals' },
      { id: 3, question: "What are your salary expectations?", type: 'hr', company: 'Microsoft', difficulty: 'medium', timeLimit: 5, category: 'Compensation' },
      { id: 4, question: "What are your greatest strengths and weaknesses?", type: 'hr', company: 'Meta', difficulty: 'medium', timeLimit: 5, category: 'Self-Assessment' },
      { id: 5, question: "How do you handle work-life balance?", type: 'hr', company: 'Apple', difficulty: 'easy', timeLimit: 5, category: 'Work Style' }
    ]
  };

  // Initialize with sample questions
  useEffect(() => {
    setQuestions(sampleQuestions[interviewType]);
    // Load interview history from localStorage or API
    const savedHistory = localStorage.getItem('interviewHistory');
    if (savedHistory) {
      try {
        setInterviewHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading interview history:', error);
      }
    }
  }, [interviewType]);

  // Timer effect
  useEffect(() => {
    if (isInterviewActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive, timeLeft]);

  // Video feed setup
  useEffect(() => {
    if (isCameraEnabled && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(error => {
          console.error('Error accessing camera:', error);
          toast.error('Failed to access camera');
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isCameraEnabled]);

  // Audio setup for microphone
  useEffect(() => {
    if (isMicEnabled && !audioContextRef.current) {
      // Initialize audio context for microphone level monitoring
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (isMicEnabled && isInterviewActive) {
      startAudioMonitoring();
    }

    return () => {
      stopAudioMonitoring();
    };
  }, [isMicEnabled, isInterviewActive]);

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current!.createAnalyser();
      microphoneRef.current = audioContextRef.current!.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(Math.min(average / 128, 1)); // Normalize to 0-1
          
          // Detect if user is speaking (average > threshold)
          if (average > 20 && !isListening) {
            setIsListening(true);
            startSpeechRecognition();
            startSpeakingTimer();
          } else if (average <= 20 && isListening) {
            setIsListening(false);
            stopSpeakingTimer();
          }
          
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopAudioMonitoring = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsListening(false);
    stopSpeechRecognition();
    stopSpeakingTimer();
  };

  const startSpeakingTimer = () => {
    if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    speakingTimerRef.current = setInterval(() => {
      setSpeakingTime(prev => prev + 1);
    }, 1000);
  };

  const stopSpeakingTimer = () => {
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
  };

  const startSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  const startInterview = async () => {
    if (!selectedDate) {
      toast.error('Please select a date for the interview');
      return;
    }

    setIsLoading(true);
    
    try {
      // Reset transcription
      transcriptionRef.current = '';
      setTranscription('');
      setSpeakingTime(0);

      // For now, simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newSession: InterviewSession = {
        id: Date.now().toString(),
        company,
        role: 'Software Engineer',
        type: interviewType,
        difficulty,
        status: 'in-progress',
        scheduledAt: selectedDate,
        duration,
        score: undefined,
        feedback: undefined
      };

      setInterviewSession(newSession);
      setIsInterviewActive(true);
      setTimeLeft(duration * 60); // Convert minutes to seconds
      setCurrentQuestionIndex(0);
      setResponses([]);
      setUserAnswer('');
      setShowFeedback(false);

      toast.success(`Starting ${company} ${interviewType} interview`);
      
      // Start recording if enabled
      if (isMicEnabled || isCameraEnabled) {
        startRecording();
      }
    } catch (error) {
      toast.error('Failed to start interview');
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const mediaConstraints: MediaStreamConstraints = {
        audio: isMicEnabled,
        video: isCameraEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      // Start video recording if camera is enabled
      if (isCameraEnabled) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setInterviewSession(prev => prev ? { ...prev, recordingUrl: url } : null);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      }

      // Start audio recording separately for better quality
      if (isMicEnabled) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });

        audioRecorderRef.current = new MediaRecorder(audioStream);
        audioChunksRef.current = [];

        audioRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        audioRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // You could save this audio blob or process it further
          console.log('Audio recording saved:', audioBlob.size, 'bytes');
        };

        audioRecorderRef.current.start();
        setIsAudioRecording(true);
      }

      toast.info('Recording started');
    } catch (error) {
      toast.error('Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all video tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (audioRecorderRef.current && isAudioRecording) {
      audioRecorderRef.current.stop();
      setIsAudioRecording(false);
      
      // Stop all audio tracks
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    toast.info('Recording saved');
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const response: InterviewResponse = {
      questionId: currentQuestion.id,
      answer: userAnswer,
      timeTaken: Math.floor(Math.random() * 60) + 30, // Simulate time taken
      transcription: transcriptionRef.current
    };

    setResponses(prev => [...prev, response]);
    
    // Reset transcription for next question
    transcriptionRef.current = '';
    setTranscription('');
    setSpeakingTime(0);
    
    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      toast.success('Answer submitted! Moving to next question.');
    } else {
      endInterview();
    }
  };

  const handleTimeUp = () => {
    toast.warning('Time is up!');
    submitAnswer();
  };

  const endInterview = async () => {
    if (isRecording || isAudioRecording) {
      stopRecording();
    }

    setIsLoading(true);
    
    try {
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate score based on various factors
      const answerQuality = Math.min(userAnswer.length / 500, 1); // Based on answer length
      const speakingScore = Math.min(speakingTime / 60, 1); // Based on speaking time
      const transcriptionScore = transcriptionRef.current.length > 100 ? 0.8 : 0.5;
      
      const score = Math.floor((answerQuality * 0.4 + speakingScore * 0.3 + transcriptionScore * 0.3) * 30) + 70;

      const feedback = {
        strengths: ['Strong technical knowledge', 'Good communication skills', 'Well-structured answers'],
        areasToImprove: ['Could provide more examples', 'Work on time management', 'Practice more system design'],
        overallFeedback: `Great performance! You scored ${score}/100. You demonstrated solid knowledge in ${interviewType} interviews.`,
        recommendedResources: ['LeetCode', 'System Design Primer', 'Behavioral Interview Questions']
      };

      const aiAnalysis = {
        sentiment: score >= 80 ? 'positive' : score >= 60 ? 'neutral' : 'negative',
        confidence: Math.min(score / 10, 10),
        communicationScore: Math.round(score * 0.8),
        technicalScore: interviewType === 'technical' || interviewType === 'system-design' ? score : Math.round(score * 0.6),
        behavioralScore: interviewType === 'behavioral' || interviewType === 'hr' ? score : Math.round(score * 0.7)
      };

      const completedSession: InterviewSession = {
        ...interviewSession!,
        status: 'completed',
        score,
        feedback,
        transcription: [transcriptionRef.current],
        aiAnalysis
      };

      setInterviewSession(completedSession);
      
      // Add to history
      const updatedHistory = [completedSession, ...interviewHistory];
      setInterviewHistory(updatedHistory);
      localStorage.setItem('interviewHistory', JSON.stringify(updatedHistory));
      
      setIsInterviewActive(false);
      setShowFeedback(true);
      
      toast.success('Interview completed! View your feedback.');
    } catch (error) {
      toast.error('Failed to submit interview');
      console.error('Error ending interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-orange-500';
      case 'expert': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyBgColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/20 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'hard': return 'bg-orange-500/20 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  if (isInterviewActive && interviewSession) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Top Bar */}
        <nav className="h-16 border-b border-gray-800 px-4 md:px-6 flex items-center justify-between bg-gray-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
                  setIsInterviewActive(false);
                  setInterviewSession(null);
                }
              }}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <Home size={20} />
            </button>
            <div>
              <h2 className="font-bold">{company} {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview</h2>
              <p className="text-xs text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Level Indicator */}
            {isMicEnabled && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Mic size={18} className={isListening ? 'text-green-500 animate-pulse' : 'text-gray-400'} />
                  {isListening && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  )}
                </div>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
              timeLeft < 300 
                ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' 
                : 'border-gray-700 bg-gray-800'
            }`}>
              <Timer size={18} />
              <span className="text-xl font-mono font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <button
              onClick={endInterview}
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all"
            >
              End Interview
            </button>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          {/* Left Panel - Questions & Progress */}
          <div className="lg:w-80 border-r border-gray-800 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Questions List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Questions</h3>
                  <span className="text-xs text-gray-500">{questions.length} total</span>
                </div>
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        currentQuestionIndex === index
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                          : responses.find(r => r.questionId === question.id)
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-gray-800/50 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBgColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {responses.find(r => r.questionId === question.id) && (
                            <CheckCircle2 size={16} className="text-green-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{question.category}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl text-center border border-gray-700">
                  <div className="text-xl font-bold text-green-400">
                    {responses.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Answered</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl text-center border border-gray-700">
                  <div className="text-xl font-bold text-yellow-400">
                    {Math.round((responses.length / questions.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Completion</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl text-center border border-gray-700">
                  <div className="text-xl font-bold text-blue-400">
                    {formatTime(speakingTime)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Speaking Time</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                <h4 className="font-bold text-sm mb-3">Quick Actions</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setIsMicEnabled(!isMicEnabled);
                      if (!isMicEnabled) {
                        toast.success('Microphone enabled. Start speaking!');
                      } else {
                        toast.info('Microphone disabled');
                      }
                    }}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      isMicEnabled
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                    <span className="text-xs">{isMicEnabled ? 'Mic On' : 'Mic Off'}</span>
                  </button>
                  <button
                    onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      isCameraEnabled
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {isCameraEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
                    <span className="text-xs">{isCameraEnabled ? 'Cam On' : 'Cam Off'}</span>
                  </button>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      isRecording
                        ? 'bg-gradient-to-r from-red-600 to-pink-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs">Recording</span>
                      </>
                    ) : (
                      <>
                        <Video size={16} />
                        <span className="text-xs">Record</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Transcription Panel */}
              {isMicEnabled && (
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Type size={16} />
                      Live Transcription
                    </h4>
                    <button
                      onClick={() => setShowTranscription(!showTranscription)}
                      className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      {showTranscription ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showTranscription && (
                    <div className="h-32 overflow-y-auto bg-gray-900/50 rounded-lg p-2">
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {transcription || 'Start speaking to see transcription...'}
                        {isListening && (
                          <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse" />
                        )}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Status: {isListening ? 'Listening...' : 'Paused'}</span>
                      <span className={isListening ? 'text-green-400' : 'text-gray-400'}>
                        {isListening ? '● Live' : '○ Paused'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyBgColor(currentQuestion.difficulty)} ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm border border-gray-700">
                    {currentQuestion.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400 border border-gray-700">
                    {company}
                  </span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">
                    {currentQuestion.timeLimit} min
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-6 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {currentQuestion.question}
                </h2>

                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6">
                  <h4 className="font-bold text-sm mb-2 text-gray-400 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Tips for answering:
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                      Structure your answer clearly
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                      Provide specific examples from your experience
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                      Explain your thought process
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                      Consider edge cases and trade-offs
                    </li>
                  </ul>
                </div>
              </div>

              {/* Answer Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center justify-between">
                  <span>Your Answer</span>
                  {isMicEnabled && (
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      isListening ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {isListening ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Listening...
                        </>
                      ) : (
                        'Click mic icon to enable voice'
                      )}
                    </span>
                  )}
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 resize-none transition-all"
                  placeholder={isMicEnabled ? 
                    "Start speaking or type your answer here... Your speech will be transcribed automatically." :
                    "Type your answer here..."
                  }
                />
                
                {/* Voice Controls */}
                {isMicEnabled && (
                  <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                          <span className="text-sm text-gray-400">
                            {isListening ? 'Voice detected' : 'Speak now'}
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                            style={{ width: `${audioLevel * 100}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Clear transcription
                          transcriptionRef.current = '';
                          setTranscription('');
                          setUserAnswer('');
                          toast.info('Transcription cleared');
                        }}
                        className="text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-all"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    {userAnswer.length} characters • {Math.ceil(userAnswer.split(' ').length / 200)} minutes to read
                    {speakingTime > 0 && ` • ${formatTime(speakingTime)} speaking`}
                  </div>
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all border border-gray-700"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      // Skip question
                      setCurrentQuestionIndex(prev => prev + 1);
                      setUserAnswer('');
                      transcriptionRef.current = '';
                      setTranscription('');
                      toast.info('Question skipped');
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center gap-2 transition-all border border-gray-700"
                  >
                    Skip Question
                    <ChevronRight size={18} />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setUserAnswer('');
                        transcriptionRef.current = '';
                        setTranscription('');
                      } else {
                        endInterview();
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2 transition-all"
                  >
                    {currentQuestionIndex === questions.length - 1 ? (
                      <>
                        Finish Interview
                        <CheckCircle2 size={18} />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Video & Resources */}
          <div className="lg:w-96 border-l border-gray-800 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Video Feed */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500">Video Feed</h3>
                <button
                  onClick={() => setShowVideoFeed(!showVideoFeed)}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    showVideoFeed
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {showVideoFeed ? 'Hide' : 'Show'} Feed
                </button>
              </div>

              {showVideoFeed && (
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-700">
                  <div className="aspect-video relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isCameraEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <Camera size={48} className="text-gray-600" />
                        <span className="ml-3 text-gray-500">Camera is disabled</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {isRecording ? "Recording..." : "Preview"}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isMicEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Status */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Volume2 size={16} />
                  Audio Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Microphone</span>
                    <span className={`text-sm ${isMicEnabled ? 'text-green-400' : 'text-red-400'}`}>
                      {isMicEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Speech Detection</span>
                    <span className={`text-sm ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
                      {isListening ? 'Detected' : 'Idle'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isMicEnabled ? 
                      'Speak clearly into your microphone. Your voice will be transcribed automatically.' :
                      'Enable microphone to use voice input'}
                  </p>
                </div>
              </div>

              {/* Resources */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500">Resources for This Topic</h3>
                  <span className="text-xs text-gray-500">Quick help</span>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://leetcode.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl hover:from-gray-700/50 hover:to-gray-800/50 transition-all border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                        <Zap size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">LeetCode</div>
                        <div className="text-xs text-gray-400">Practice coding problems</div>
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://github.com/donnemartin/system-design-primer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl hover:from-gray-700/50 hover:to-gray-800/50 transition-all border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                        <Brain size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">System Design Primer</div>
                        <div className="text-xs text-gray-400">Learn system design</div>
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://www.interviewcake.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl hover:from-gray-700/50 hover:to-gray-800/50 transition-all border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Interview Cake</div>
                        <div className="text-xs text-gray-400">Interview preparation</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                <h3 className="font-bold text-sm mb-3">Quick Interview Tips</h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Speak clearly and maintain eye contact
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Structure answers with STAR method
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Ask clarifying questions when unsure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Think aloud during problem solving
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Practice with time limits
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Indicator */}
        {(isRecording || isAudioRecording) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse shadow-lg z-50 cursor-pointer"
            onClick={stopRecording}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            Recording • Click to save
          </motion.div>
        )}
      </div>
    );
  }

  if (showFeedback && interviewSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 p-6 md:p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Award className="w-20 h-20 text-cyan-500 mx-auto mb-4" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Zap size={16} className="text-black" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Interview Complete!
            </h2>
            <p className="text-gray-400">Great job completing the {company} {interviewType} interview</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 rounded-xl text-center border border-cyan-500/30">
              <p className="text-sm text-gray-400 mb-2">Final Score</p>
              <p className="text-4xl font-bold text-cyan-500">{interviewSession.score || 0}/100</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl text-center border border-green-500/30">
              <p className="text-sm text-gray-400 mb-2">Questions Answered</p>
              <p className="text-4xl font-bold text-white">{responses.length}/{questions.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl text-center border border-yellow-500/30">
              <p className="text-sm text-gray-400 mb-2">Performance</p>
              <p className="text-2xl font-bold text-yellow-400">
                {interviewSession.score && interviewSession.score >= 80 ? 'Excellent 🎯' :
                 interviewSession.score && interviewSession.score >= 60 ? 'Good 👍' : 'Needs Practice 📚'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6 rounded-xl mb-8 border border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Brain size={20} />
              AI Feedback Summary
            </h3>
            <p className="text-gray-400 mb-6">{interviewSession.feedback?.overallFeedback}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-bold text-sm mb-3 text-green-400">Strengths</h4>
                <ul className="space-y-2">
                  {interviewSession.feedback?.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 size={14} className="text-green-400" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3 text-red-400">Areas to Improve</h4>
                <ul className="space-y-2">
                  {interviewSession.feedback?.areasToImprove.map((area, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <AlertTriangle size={14} className="text-red-400" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-cyan-400">AI Analysis</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Communication Score</span>
                    <span className="text-green-400">{interviewSession.aiAnalysis?.communicationScore || 0}/100</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000" 
                         style={{ width: `${interviewSession.aiAnalysis?.communicationScore || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Technical Score</span>
                    <span className="text-yellow-400">{interviewSession.aiAnalysis?.technicalScore || 0}/100</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000" 
                         style={{ width: `${interviewSession.aiAnalysis?.technicalScore || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Behavioral Score</span>
                    <span className="text-cyan-400">{interviewSession.aiAnalysis?.behavioralScore || 0}/100</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000" 
                         style={{ width: `${interviewSession.aiAnalysis?.behavioralScore || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transcription Review */}
          {interviewSession.transcription && interviewSession.transcription[0] && (
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-5 rounded-xl border border-blue-500/30 mb-8">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <MessageCircle size={20} />
                Your Transcription
              </h3>
              <div className="max-h-40 overflow-y-auto bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {interviewSession.transcription[0]}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This transcription was generated from your audio input during the interview.
              </p>
            </div>
          )}

          {/* Recommended Resources */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-5 rounded-xl border border-purple-500/30 mb-8">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <BookOpen size={20} />
              Recommended Resources
            </h3>
            <div className="flex flex-wrap gap-2">
              {interviewSession.feedback?.recommendedResources.map((resource, index) => (
                <a
                  key={index}
                  href="#"
                  className="px-3 py-2 bg-gray-800/50 rounded-lg text-sm hover:bg-gray-700/50 transition-all border border-gray-700"
                >
                  {resource}
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setShowFeedback(false);
                setIsInterviewActive(false);
                setInterviewSession(null);
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Practice Another Interview
              <RefreshCcw size={18} />
            </button>
            {interviewSession.recordingUrl && (
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = interviewSession.recordingUrl;
                  a.download = `interview-${company}-${Date.now()}.webm`;
                  a.click();
                  toast.success('Recording downloaded!');
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2 border border-gray-700"
              >
                <Download size={18} />
                Download Recording
              </button>
            )}
            <button
              onClick={() => {
                setShowFeedback(false);
                setIsInterviewActive(false);
                setInterviewSession(null);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share Results
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Mock Interview
              </h1>
              <p className="text-gray-400 mt-2">Practice interviews with AI feedback and recording</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVideoFeed(!showVideoFeed)}
                className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center gap-2 transition-all"
              >
                {showVideoFeed ? <EyeOff size={18} /> : <Eye size={18} />}
                <span>{showVideoFeed ? 'Hide' : 'Show'} Preview</span>
              </button>
              <button
                onClick={() => {
                  // View history
                  toast.info('Viewing interview history');
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2 transition-all"
              >
                <BarChart3 size={18} />
                <span>History</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Setup Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Configure Your Mock Interview</h2>
              
              <div className="space-y-6">
                {/* Interview Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Interview Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['technical', 'behavioral', 'system-design', 'hr'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInterviewType(type)}
                        className={`p-4 rounded-xl text-center transition-all ${
                          interviewType === type
                            ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                        }`}
                      >
                        <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {type === 'technical' && 'Coding & Algorithms'}
                          {type === 'behavioral' && 'Experience & Skills'}
                          {type === 'system-design' && 'Architecture Design'}
                          {type === 'hr' && 'Culture & Fit'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Target Company
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {companies.slice(0, 6).map((comp) => (
                      <button
                        key={comp}
                        onClick={() => setCompany(comp)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          company === comp
                            ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                        }`}
                      >
                        <div className="text-sm">{comp}</div>
                      </button>
                    ))}
                  </div>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-3 w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                  >
                    {companies.map((comp) => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            difficulty === diff
                              ? `${getDifficultyBgColor(diff)} ${getDifficultyColor(diff)} font-bold`
                              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                          }`}
                        >
                          <div className="capitalize">{diff}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setDuration(mins)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            duration === mins
                              ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30'
                              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                          }`}
                        >
                          <div className="font-medium">{mins} min</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schedule Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Schedule Interview
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-left flex items-center justify-between hover:bg-gray-700/50 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}</span>
                      </div>
                      <ChevronDown size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {isCalendarOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl"
                        >
                          <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="p-3"
                            classNames={{
                              day: "rounded-md p-2 hover:bg-cyan-500/20 hover:text-white",
                              day_selected: "bg-cyan-500 text-white",
                              day_today: "bg-gray-800"
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Media Settings */}
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                  <h3 className="font-bold text-sm mb-3">Media Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsMicEnabled(!isMicEnabled);
                          if (!isMicEnabled) {
                            toast.success('Microphone will be enabled for voice input');
                          }
                        }}
                        className={`p-3 rounded-lg flex items-center gap-2 transition-all ${
                          isMicEnabled
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        <span className="text-sm">{isMicEnabled ? 'Mic On' : 'Mic Off'}</span>
                      </button>
                      <div className="text-xs text-gray-400">
                        {isMicEnabled ? 
                          'Voice input enabled. Speak to transcribe.' :
                          'Enable for voice-to-text'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                        className={`p-3 rounded-lg flex items-center gap-2 transition-all ${
                          isCameraEnabled
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {isCameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
                        <span className="text-sm">{isCameraEnabled ? 'Camera On' : 'Camera Off'}</span>
                      </button>
                      <div className="text-xs text-gray-400">
                        {isCameraEnabled ? 
                          'Video recording enabled' :
                          'Optional video recording'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Enable microphone for live speech-to-text transcription. Camera is optional for video recording.
                  </p>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            {showVideoFeed && (
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4">Camera Preview</h3>
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                  {isCameraEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={48} className="text-gray-600" />
                      <span className="ml-3 text-gray-500">Camera is disabled</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Start Button */}
            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl p-6 border border-cyan-500/30">
              <h3 className="text-lg font-bold mb-4">Ready to Start?</h3>
              <p className="text-sm text-gray-400 mb-6">
                You'll be asked {questions.length} questions with a time limit of {duration} minutes.
              </p>
              <button
                onClick={startInterview}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Start Mock Interview
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                {isMicEnabled ? 
                  'Your voice will be transcribed in real-time' :
                  'Enable microphone for voice input'}
              </p>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Completed Interviews</span>
                    <span className="text-cyan-400">{interviewHistory.length}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-1/2"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Average Score</span>
                    <span className="text-green-400">
                      {interviewHistory.length > 0
                        ? Math.round(interviewHistory.reduce((acc, i) => acc + (i.score || 0), 0) / interviewHistory.length)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Streak</span>
                    <span className="text-yellow-400">3 days 🔥</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Input Tips */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-500/30">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Volume2 size={20} />
                Voice Input Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt=1.5 flex-shrink-0" />
                  Speak clearly and at a moderate pace
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt=1.5 flex-shrink-0" />
                  Use a quiet environment for better accuracy
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt=1.5 flex-shrink-0" />
                  Pause briefly between sentences
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt=1.5 flex-shrink-0" />
                  Review transcription before submitting
                </li>
              </ul>
            </div>

            {/* Recent History */}
            {interviewHistory.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
                <h3 className="font-bold text-lg mb-4">Recent Interviews</h3>
                <div className="space-y-3">
                  {interviewHistory.slice(0, 3).map((session) => (
                    <div key={session.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{session.company}</div>
                          <div className="text-xs text-gray-500 capitalize">{session.type}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          session.score && session.score >= 80 ? 'bg-green-500/30 text-green-400' :
                          session.score && session.score >= 60 ? 'bg-yellow-500/30 text-yellow-400' :
                          'bg-red-500/30 text-red-400'
                        }`}>
                          {session.score || 0}/100
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;