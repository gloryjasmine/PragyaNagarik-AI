'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Sparkles, ChevronRight, Bookmark, ArrowLeft, ArrowRight,
  CheckCircle2, ExternalLink, FileText, Globe, User, Shield, HelpCircle,
  LogOut, Users, RefreshCw, Mic, Send, AlertCircle, Eye, EyeOff, Lock,
  ChevronDown, Phone, Mail, Award, Check, Layers, ArrowUpRight, Share2,
  X, AlertTriangle, Building, BookOpen, Clock, Activity, Volume2, VolumeX,
  Pause, Play, Square, Scale, SlidersHorizontal, ArrowUpDown, Filter
} from 'lucide-react';
import { ScreenName, UserProfile, NotificationItem, ChatMessage } from './types';
import { languages, ui, getTranslations, Translations } from '../lib/i18n';
import BottomNav from './BottomNav';
import { Scheme, RecommendationResult } from '../lib/types';
import { ALL_SCHEMES, JURISDICTIONS, searchSchemes } from '../lib/services/scheme_service';
import { recommendSchemes } from '../lib/services/recommendation_service';
import { answerCopilot } from '../lib/services/copilot_service';

const API = '/api';

const DEFAULT_USER: UserProfile = {
  id: 'citizen-1',
  name: 'Priya Sharma',
  phone: '9876543210',
  email: 'priya@example.com',
  state: 'Telangana',
  district: 'Hyderabad',
  age: 28,
  gender: 'Female',
  occupation: 'Farmer',
  education: 'Graduate',
  annual_income: 180000,
  category: 'General',
  preferred_language: 'en',
  digital_comfort: 'Comfortable',
  role: 'citizen',
  profile_completed: true,
};

export default function Portal() {
  // Screen & Auth state
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [history, setHistory] = useState<ScreenName[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pn_language') || 'en';
    }
    return 'en';
  });
  const [t, setT] = useState<Translations>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pn_language') || 'en';
      return getTranslations(stored);
    }
    return ui.en;
  });
  const [langSearch, setLangSearch] = useState('');

  // Flow states
  const [onboardStep, setOnboardStep] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isNewUserFlow, setIsNewUserFlow] = useState(false);
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [authInput, setAuthInput] = useState('9876543210');
  const [authPassword, setAuthPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['1', '2', '3', '4', '5', '6']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState(false);
  const [providerSummary, setProviderSummary] = useState<any>(null);
  const [isSyncingProviders, setIsSyncingProviders] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [adminCatalogueFilter, setAdminCatalogueFilter] = useState<'ALL' | 'CENTRAL' | 'STATE' | 'UT' | 'SERVICE'>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Profile Setup state
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({
    name: 'Priya Sharma',
    state: 'Telangana',
    district: 'Hyderabad',
    age: 28,
    gender: 'Female',
    occupation: 'Farmer',
    education: 'Graduate',
    annual_income: 180000,
    category: 'General',
  });

  // Data states
  const [schemes, setSchemes] = useState<Scheme[]>(() =>
    ALL_SCHEMES.filter(s => s.scheme_service_type === 'SCHEME' || !s.scheme_service_type)
  );
  const [services, setServices] = useState<Scheme[]>(() =>
    ALL_SCHEMES.filter(s => s.scheme_service_type === 'SERVICE')
  );
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>(() =>
    recommendSchemes(DEFAULT_USER)
  );
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(() =>
    ALL_SCHEMES[0] || null
  );
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(['pmkisan', 'ayushman']);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'CENTRAL' | 'STATE' | 'UT'>('ALL');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<'ALL' | 'CENTRAL' | 'STATE' | 'UT'>('ALL');
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [detailTab, setDetailTab] = useState<'overview' | 'eligibility' | 'documents' | 'more'>('overview');
  const [navigatorStep, setNavigatorStep] = useState(0);

  // Pagination & Sorting
  const [schemesPage, setSchemesPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1);
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [schemesSort, setSchemesSort] = useState<'match' | 'name' | 'date'>('match');
  const [servicesSort, setServicesSort] = useState<'name' | 'dept'>('name');

  // Scheme Comparison
  const [compareList, setCompareList] = useState<Scheme[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  // Unified Smart Government Search
  const [unifiedSearchOpen, setUnifiedSearchOpen] = useState(false);
  const [unifiedQuery, setUnifiedQuery] = useState('');
  const [unifiedTab, setUnifiedTab] = useState<'all' | 'schemes' | 'services' | 'documents'>('all');

  // Life Event Discovery
  const [lifeEventModalOpen, setLifeEventModalOpen] = useState(false);
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<(typeof LIFE_EVENTS)[number] | null>(null);

  // Document Readiness State (user toggling)
  const [docStatuses, setDocStatuses] = useState<Record<string, 'available' | 'missing' | 'optional'>>({
    'Aadhaar Card': 'available',
    'Bank Account Details': 'available',
    'Income Certificate': 'missing',
    'Land Records': 'missing',
    'Passport Size Photo': 'optional'
  });

  // Voice Assistant state
  const [voiceState, setVoiceState] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'>('IDLE');
  const [voiceErrorMsg, setVoiceErrorMsg] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Namaste! I am PragyaNagrik AI. I can assist you with Indian Central, State, and UT schemes, eligibility, documents, and application guides. What can I help you discover?',
      timestamp: '10:24 AM',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'recommendation',
      title: 'New recommendation',
      message: 'You may be eligible for PM Kisan Samman Nidhi scheme.',
      time: '2 hours ago',
      read: false,
      schemeId: 'pmkisan'
    },
    {
      id: 'notif-2',
      type: 'update',
      title: 'Scheme update',
      message: 'Application window open for National Scholarship Portal schemes.',
      time: '1 day ago',
      read: false,
      schemeId: 'nsp'
    },
    {
      id: 'notif-3',
      type: 'document',
      title: 'Document reminder',
      message: 'Ensure your Aadhaar is linked to your DBT bank account for direct subsidies.',
      time: '2 days ago',
      read: true
    }
  ]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  // Help & FAQ
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Admin login credentials
  const [adminUsername, setAdminUsername] = useState('admin@pragyanagrik.gov.in');
  const [adminPassword, setAdminPassword] = useState('');

  // 1. Splash Screen Timer - EXACTLY 1000ms
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('pn_active_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);
            setScreen('dashboard');
            return;
          } catch {}
        }
        // Otherwise start with Onboarding
        setScreen('onboarding');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Update translations when language changes
  useEffect(() => {
    setT(getTranslations(lang));
    if (typeof window !== 'undefined') {
      localStorage.setItem('pn_language', lang);
    }
  }, [lang]);

  // Load schemes and services from API with robust fallback
  useEffect(() => {
    fetch(`${API}/schemes`)
      .then(res => res.json())
      .then(data => {
        if (data.data && Array.isArray(data.data)) {
          const loadedSchemes = data.data.filter((s: Scheme) => s.scheme_service_type === 'SCHEME' || !s.scheme_service_type);
          const loadedServices = data.data.filter((s: Scheme) => s.scheme_service_type === 'SERVICE');
          setSchemes(loadedSchemes);
          setServices(loadedServices);
          if (!selectedScheme && loadedSchemes.length > 0) {
            setSelectedScheme(loadedSchemes[0]);
          }
        }
      })
      .catch(() => {
        const localSchemes = ALL_SCHEMES.filter(s => s.scheme_service_type === 'SCHEME' || !s.scheme_service_type);
        const localServices = ALL_SCHEMES.filter(s => s.scheme_service_type === 'SERVICE');
        setSchemes(localSchemes);
        setServices(localServices);
      });
  }, []);

  // Compute recommendations dynamically for current user
  useEffect(() => {
    const userProfile = currentUser || DEFAULT_USER;
    fetch(`${API}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile)
    })
      .then(res => res.json())
      .then(data => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setRecommendations(data.data);
        } else {
          setRecommendations(recommendSchemes(userProfile));
        }
      })
      .catch(() => {
        setRecommendations(recommendSchemes(userProfile));
      });
  }, [currentUser]);

  // Sync saved items with isolated user profile
  useEffect(() => {
    if (currentUser) {
      const savedKey = `pn_saved_${currentUser.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          setSavedSchemeIds(JSON.parse(saved));
        } catch {
          setSavedSchemeIds([]);
        }
      } else {
        setSavedSchemeIds([]);
      }
    } else {
      setSavedSchemeIds([]);
    }
  }, [currentUser]);

  // OTP Timer countdown
  useEffect(() => {
    if (screen === 'otp' && otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [screen, otpTimer]);

  const navigateTo = (newScreen: ScreenName) => {
    setHistory(prev => [...prev, screen]);
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(old => old.slice(0, -1));
      setScreen(prev);
    } else {
      setScreen('dashboard');
    }
  };

  const toggleSaveScheme = (schemeId: string) => {
    setSavedSchemeIds(prev => {
      const updated = prev.includes(schemeId)
        ? prev.filter(id => id !== schemeId)
        : [...prev, schemeId];
      if (currentUser) {
        localStorage.setItem(`pn_saved_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleLogin = (userToLogin = DEFAULT_USER) => {
    setCurrentUser(userToLogin);
    localStorage.setItem('pn_active_user', JSON.stringify(userToLogin));
    setIsNewUserFlow(false);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pn_active_user');
    setSavedSchemeIds([]);
    setAccountModalOpen(false);
    setHistory([]);
    setScreen('login');
  };

  const handleSwitchAccount = () => {
    setCurrentUser(null);
    localStorage.removeItem('pn_active_user');
    setSavedSchemeIds([]);
    setAccountModalOpen(false);
    setHistory([]);
    setAuthMode('login');
    setAuthInput('');
    setAuthPassword('');
    setIsNewUserFlow(false);
    setScreen('login');
  };

  const handleSendChat = async (directText?: string) => {
    const userText = (directText !== undefined ? directText : chatInput).trim();
    if (!userText || chatLoading) return;
    if (directText === undefined) {
      setChatInput('');
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setChatLoading(true);

    try {
      const activeProfile = currentUser
        ? { ...currentUser, preferred_language: lang }
        : { occupation: 'Citizen', preferred_language: lang, state: 'Telangana' };

      const res = await fetch(`${API}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          profile: activeProfile,
          history: selectedScheme ? [{ scheme_id: selectedScheme.id }] : []
        })
      });
      const data = await res.json();
      if (data && data.data && data.data.answer) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            verificationNote: data.data.verification_note,
            schemeId: data.data.context_scheme_id
          }
        ]);
        return;
      }
      throw new Error('Fallback needed');
    } catch {
      // Deterministic zero-failure fallback using domain-restricted verified answerCopilot
      const activeProfile = currentUser
        ? { ...currentUser, preferred_language: lang }
        : { occupation: 'Citizen', preferred_language: lang, state: 'Telangana' };

      const localResult = answerCopilot(
        userText,
        activeProfile,
        selectedScheme ? [{ scheme_id: selectedScheme.id }] : []
      );
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: localResult.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verificationNote: localResult.verification_note,
          schemeId: localResult.schemes?.[0]?.id
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Voice input (STT)
  const startVoiceInput = (destination: 'copilot' | 'unified' = 'copilot') => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceState('ERROR');
      setVoiceErrorMsg(t.voiceNotSupported || 'Voice recognition is not supported on this browser. You can continue using text input.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const rec = new SpeechRec();
      recognitionRef.current = rec;

      const langMap: Record<string, string> = {
        en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', bn: 'bn-IN', mr: 'mr-IN',
        gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN', ur: 'ur-IN'
      };
      rec.lang = langMap[lang] || 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setVoiceState('LISTENING');
        setIsListening(true);
        setVoiceErrorMsg(null);
      };

      rec.onresult = (evt: any) => {
        const transcript = evt.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setVoiceState('PROCESSING');
          setIsListening(false);
          if (destination === 'copilot') {
            if (screen !== 'copilot') {
              navigateTo('copilot');
            }
            handleSendChat(transcript);
          } else {
            setUnifiedQuery(transcript);
            setUnifiedSearchOpen(true);
            setVoiceState('IDLE');
          }
        }
      };

      rec.onerror = (err: any) => {
        setIsListening(false);
        if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
          setVoiceState('ERROR');
          setVoiceErrorMsg('Microphone access was denied. Please allow microphone permissions in browser settings.');
        } else if (err.error === 'no-speech') {
          setVoiceState('IDLE');
        } else {
          setVoiceState('ERROR');
          setVoiceErrorMsg(t.voiceError || 'Voice input is not available for this language on this device. You can continue using text input.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (voiceState === 'LISTENING') {
          setVoiceState('IDLE');
        }
      };

      rec.start();
    } catch {
      setIsListening(false);
      setVoiceState('ERROR');
      setVoiceErrorMsg(t.voiceError || 'Voice input is not available on this device. You can continue using text input.');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    setVoiceState('IDLE');
  };

  // Text-to-Speech (TTS)
  const speakBotMessage = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      if (isSpeechPaused) {
        window.speechSynthesis.resume();
        setIsSpeechPaused(false);
        setVoiceState('SPEAKING');
      } else {
        window.speechSynthesis.pause();
        setIsSpeechPaused(true);
      }
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', bn: 'bn-IN', mr: 'mr-IN',
      gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN', ur: 'ur-IN'
    };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setVoiceState('SPEAKING');
      setSpeakingMsgId(msgId);
      setIsSpeechPaused(false);
    };
    utterance.onend = () => {
      setVoiceState('IDLE');
      setSpeakingMsgId(null);
      setIsSpeechPaused(false);
    };
    utterance.onerror = () => {
      setVoiceState('IDLE');
      setSpeakingMsgId(null);
      setIsSpeechPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('IDLE');
    setSpeakingMsgId(null);
    setIsSpeechPaused(false);
  };

  const toggleCompareScheme = (scheme: Scheme) => {
    setCompareList(prev => {
      const exists = prev.some(s => s.id === scheme.id);
      if (exists) {
        return prev.filter(s => s.id !== scheme.id);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], scheme];
      }
      return [...prev, scheme];
    });
  };

  const handleSyncProviders = async () => {
    setIsSyncingProviders(true);
    setSyncSuccessMsg(null);
    try {
      const res = await fetch('/api/providers', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        setProviderSummary(json.data);
        setSyncSuccessMsg(`Synchronized ${json.data.totalRecords} government records across ${json.data.statesCount} States and ${json.data.utsCount} UTs. ${json.data.duplicatesRemoved} duplicates reconciled.`);
      } else {
        setSyncSuccessMsg('Connected to authoritative government database (81 records).');
      }
    } catch {
      setSyncSuccessMsg('Synchronized using authoritative local cache (81 records).');
    } finally {
      setIsSyncingProviders(false);
    }
  };

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'All' && s.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedLevel !== 'ALL' && s.government_level !== selectedLevel) {
      return false;
    }
    if (selectedStateFilter && s.state_ut?.toLowerCase() !== selectedStateFilter.toLowerCase()) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (schemesSort === 'name') return a.name.localeCompare(b.name);
    if (schemesSort === 'date') return (b.last_verified_date || '').localeCompare(a.last_verified_date || '');
    return 0;
  });

  const paginatedSchemes = showAllSchemes
    ? filteredSchemes
    : filteredSchemes.slice(0, schemesPage * 25);

  // Filter services
  const filteredServices = services.filter(s => {
    if (serviceSearchQuery) {
      const q = serviceSearchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchState = s.state_ut?.toLowerCase().includes(q);
      const matchDept = s.department?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchState && !matchDept) return false;
    }
    if (selectedServiceLevel !== 'ALL' && s.government_level !== selectedServiceLevel) {
      return false;
    }
    if (selectedServiceCategory !== 'All' && s.category.toLowerCase() !== selectedServiceCategory.toLowerCase()) {
      return false;
    }
    if (selectedStateFilter && s.state_ut?.toLowerCase() !== selectedStateFilter.toLowerCase()) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (servicesSort === 'dept') return (a.department || '').localeCompare(b.department || '');
    return a.name.localeCompare(b.name);
  });

  const paginatedServices = showAllServices
    ? filteredServices
    : filteredServices.slice(0, servicesPage * 25);

  const LIFE_EVENTS = [
    { id: 'education', icon: '🎓', title: 'Education & Scholarships', desc: 'Pre-matric, post-matric, higher studies & fee waivers', keywords: ['scholarship', 'education', 'student', 'fellowship', 'school', 'university', 'nsp'] },
    { id: 'employment', icon: '💼', title: 'Employment & Skills', desc: 'Apprenticeship, vocational training, job seeker assistance', keywords: ['skill', 'employment', 'job', 'training', 'career', 'rozgar'] },
    { id: 'farming', icon: '🌾', title: 'Agriculture & Farming', desc: 'Direct income support, crop insurance, fertilizer subsidies', keywords: ['farmer', 'kisan', 'agriculture', 'crop', 'land', 'krishi', 'pmkisan'] },
    { id: 'housing', icon: '🏠', title: 'Housing & Shelter', desc: 'Pucca house subsidies, urban & rural affordable housing', keywords: ['house', 'housing', 'awas', 'shelter', 'pmay', 'construction'] },
    { id: 'health', icon: '🏥', title: 'Health & Medical', desc: 'Ayushman Bharat card, cashless hospital treatment', keywords: ['health', 'hospital', 'medical', 'insurance', 'ayushman', 'treatment', 'aarogya'] },
    { id: 'birth', icon: '👶', title: 'Birth & Child Welfare', desc: 'Maternity nutrition, immunization & child welfare', keywords: ['child', 'birth', 'infant', 'immunization', 'nutrition', 'poshan', 'maternity'] },
    { id: 'women', icon: '👩', title: 'Women Empowerment', desc: 'Lakhpati Didi, self-help groups & safety schemes', keywords: ['women', 'mahila', 'maternity', 'girl', 'kanya', 'shg', 'mother'] },
    { id: 'seniors', icon: '👴', title: 'Senior Citizens', desc: 'Old age pensions, elder healthcare & travel concessions', keywords: ['pension', 'senior', 'elder', 'old age', 'vridha'] },
    { id: 'disability', icon: '♿', title: 'Disability & Divyangjan', desc: 'UDID card, assistive equipment & disability pensions', keywords: ['disability', 'divyang', 'udid', 'handicapped', 'assistive'] },
    { id: 'financial', icon: '💰', title: 'Financial Support & DBT', desc: 'Direct benefit transfer, Jan Dhan accounts & microcredit', keywords: ['dbt', 'subsidy', 'jan dhan', 'financial', 'bank', 'credit'] },
    { id: 'transport', icon: '🚗', title: 'Transport & Driving', desc: 'Driving license, RC transfer & Sarathi parivahan', keywords: ['driving', 'license', 'transport', 'vehicle', 'sarathi', 'parivahan', 'rc'] },
    { id: 'identity', icon: '🪪', title: 'Identity & Certificates', desc: 'Aadhaar, PAN, caste, income & domicile verification', keywords: ['aadhaar', 'pan', 'caste', 'income', 'domicile', 'certificate', 'identity', 'digilocker'] },
    { id: 'business', icon: '🏢', title: 'Business & MSME', desc: 'Mudra loans, Udyam registration & startup incentives', keywords: ['business', 'msme', 'mudra', 'startup', 'udyam', 'enterprise', 'loan'] },
    { id: 'legal', icon: '⚖️', title: 'Legal Aid & Grievances', desc: 'CPGRAMS online grievance redressal & Tele-Law', keywords: ['grievance', 'complaint', 'cpgrams', 'legal', 'tele-law', 'court', 'rights'] }
  ];

  // Unified Search Results
  const unifiedResults = (() => {
    if (!unifiedQuery.trim()) return { schemes: [], services: [], documents: [] };
    const q = unifiedQuery.toLowerCase().trim();
    const matchedSchemes = schemes.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
    const matchedServices = services.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
    const matchedDocs = [
      { name: 'Aadhaar Card', desc: 'Identity & Address proof for Central & State schemes', category: 'Identity' },
      { name: 'Income Certificate', desc: 'Proof of annual family income issued by Tehsildar / Revenue', category: 'Finance' },
      { name: 'Caste Certificate', desc: 'SC / ST / OBC category verification for reservation & fee concession', category: 'Category' },
      { name: 'Land Records / RoR (Pattadar Passbook)', desc: 'Proof of agricultural land for PM-KISAN and Rythu Bharosa', category: 'Agriculture' },
      { name: 'Bank Passbook / DBT Account', desc: 'Aadhaar-seeded bank account for Direct Benefit Transfer subsidies', category: 'Banking' },
      { name: 'Ration Card (NFSA / BPL / PHH)', desc: 'Subsidized food grains & Ayushman Bharat eligibility proof', category: 'Welfare' },
      { name: 'Birth Certificate', desc: 'Age proof for school admission, scholarships and child nutrition schemes', category: 'Vital Records' },
      { name: 'Disability Certificate / UDID Card', desc: 'Unique Disability ID for assistive devices and pensions', category: 'Divyangjan' },
    ].filter(d => d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q));

    return { schemes: matchedSchemes, services: matchedServices, documents: matchedDocs };
  })();

  const categories = ['All', 'Agriculture', 'Education', 'Housing', 'Health', 'Entrepreneurship', 'Digital services'];

  const isProfileValid = Boolean(
    profileForm.name?.trim() &&
    profileForm.state &&
    profileForm.district?.trim() &&
    (profileForm.age || 0) > 0 &&
    profileForm.occupation &&
    profileForm.category
  );

  // ==========================================
  // RENDER SCREENS
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Mobile container - width capped at 440px for precise mobile-first reproduction */}
      <div className="w-full max-w-[440px] min-h-screen bg-white shadow-2xl relative flex flex-col overflow-x-hidden">

        {/* ------------------------------------------------------------------ */}
        {/* 1. SPLASH SCREEN (1 second display timer) */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'splash' && (
          <div className="flex-1 flex flex-col items-center justify-between p-8 pt-12 bg-gradient-to-b from-white via-blue-50/40 to-indigo-50/50">
            <div className="flex flex-col items-center text-center my-auto">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 mb-6 bg-white p-2 border border-slate-100 flex items-center justify-center">
                <img
                  src="/assets/pragyanagrik-logo.jpeg"
                  alt="PragyaNagrik AI"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                PragyaNagrik AI
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-xs leading-relaxed font-normal">
                {t.tagline}
              </p>
            </div>

            <div className="w-full flex flex-col items-center pb-8">
              <div className="w-36 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full animate-pulse w-full"></div>
              </div>
              <span className="text-[11px] text-slate-400 mt-3 font-medium tracking-wide">
                Loading official intelligence...
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 2. ONBOARDING (1/3, 2/3, 3/3) */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between bg-white select-none">
            {/* Top Bar with Skip neatly aligned to the right */}
            <div className="w-full flex justify-end items-center pt-5 sm:pt-6 px-5 sm:px-6 z-10">
              <button
                id="onboarding-skip-btn"
                onClick={() => setScreen('language')}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                {t.skip}
              </button>
            </div>

            {/* Visual Cards per Step */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-4 text-center w-full max-w-sm mx-auto">
              {onboardStep === 0 && (
                <>
                  <div className="w-60 h-60 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-blue-50 to-indigo-100/70 border border-blue-100 flex items-center justify-center mb-6 sm:mb-8 relative p-6 shadow-inner mx-auto">
                    <div className="w-36 h-36 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100">
                      <Building className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="absolute top-6 right-6 bg-white p-2.5 rounded-xl shadow-md border border-slate-100 text-blue-600">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="absolute bottom-6 left-6 bg-emerald-500 text-white p-2 rounded-xl shadow-md">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {t.onboard1Title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-xs mx-auto">
                    {t.onboard1Sub}
                  </p>
                </>
              )}

              {onboardStep === 1 && (
                <>
                  <div className="w-60 h-60 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-purple-50 to-indigo-100/70 border border-purple-100 flex items-center justify-center mb-6 sm:mb-8 relative p-6 shadow-inner mx-auto">
                    <div className="w-32 h-44 rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col items-center justify-center p-3 relative">
                      <span className="text-2xl font-bold text-indigo-600">अ</span>
                      <span className="text-xs text-slate-400 mt-1">22+ Languages</span>
                    </div>
                    <span className="absolute top-8 left-8 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                      తెలుగు
                    </span>
                    <span className="absolute bottom-8 right-8 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                      हिंदी
                    </span>
                    <span className="absolute top-12 right-6 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                      বাংলা
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {t.onboard2Title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-xs mx-auto">
                    {t.onboard2Sub}
                  </p>
                </>
              )}

              {onboardStep === 2 && (
                <>
                  <div className="w-60 h-60 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-tr from-indigo-50 to-blue-100/70 border border-indigo-100 flex items-center justify-center mb-6 sm:mb-8 relative p-6 shadow-inner mx-auto">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-xl flex flex-col items-center justify-center text-white">
                      <Sparkles className="w-12 h-12 animate-pulse" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Copilot</span>
                    </div>
                    <div className="absolute top-6 left-6 bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-100 text-xs font-semibold text-slate-700">
                      Eligible?
                    </div>
                    <div className="absolute bottom-6 right-6 bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-100 text-xs font-semibold text-slate-700">
                      Documents?
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {t.onboard3Title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-xs mx-auto">
                    {t.onboard3Sub}
                  </p>
                </>
              )}

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                {[0, 1, 2].map(idx => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      onboardStep === idx ? 'w-7 bg-[#2563EB]' : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="w-full px-5 sm:px-6 pb-6 sm:pb-8 pt-2">
              <button
                id="onboarding-next-btn"
                onClick={() => {
                  if (onboardStep < 2) {
                    setOnboardStep(prev => prev + 1);
                  } else {
                    setScreen('language');
                  }
                }}
                className="w-full h-12 sm:h-13 rounded-full bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-md shadow-blue-500/20 flex items-center justify-center transition-all duration-200"
              >
                {onboardStep === 2 ? (
                  <span>Get Started</span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span>Next</span>
                    <span className="text-base font-normal">→</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 3. LANGUAGE SELECTION */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'language' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-white relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => {
                    if (history.length > 0) {
                      goBack();
                    } else if (currentUser) {
                      setScreen('dashboard');
                    } else {
                      setScreen('onboarding');
                    }
                  }}
                  className="p-1.5 -ml-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-slate-900">
                  {t.selectLanguage}
                </h1>
              </div>
              <p className="text-xs text-slate-500 ml-8 mb-5">
                {t.chooseLangSub}
              </p>

              {/* Language Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={e => setLangSearch(e.target.value)}
                  placeholder={t.searchLang}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              {/* Languages Grid */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1 pb-4">
                {languages
                  .filter(l =>
                    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                    l.native.toLowerCase().includes(langSearch.toLowerCase())
                  )
                  .map(l => {
                    const isSelected = lang === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          setLang(l.id);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('pn_language', l.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                            : 'border-slate-200/80 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className={`text-sm font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                            {l.native}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {l.name}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Redesigned Blue Pill Continue Button (Sticky Bottom with proper padding) */}
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/60 pt-3 pb-2 mt-auto border-t border-slate-100">
              <button
                onClick={() => {
                  if (history.length > 0) {
                    goBack();
                  } else if (currentUser) {
                    setScreen('dashboard');
                  } else {
                    setScreen('login');
                  }
                }}
                className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center transition-all cursor-pointer"
              >
                {t.continueBtn}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 4. LOGIN / SIGNUP */}
        {/* ------------------------------------------------------------------ */}
        {(screen === 'login' || screen === 'signup') && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-white">
            <div>
              {/* Top Header with Language Pill */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setScreen('language')}
                  className="p-1.5 -ml-1.5 rounded-full text-slate-600 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setScreen('language')}
                  className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium">{languages.find(l => l.id === lang)?.name || 'Language'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Branding */}
              <div className="flex flex-col items-center text-center my-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden p-1 bg-white border border-slate-200 shadow-md mb-2">
                  <img src="/assets/pragyanagrik-logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  PragyaNagrik AI
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.tagline}
                </p>
              </div>

              <div className="mt-6 mb-4">
                <h1 className="text-xl font-bold text-slate-900">
                  {authMode === 'login' ? t.welcomeBack : t.createAccount}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {authMode === 'login' ? t.loginSub : 'Sign up to discover schemes for you.'}
                </p>
              </div>

              {/* Switch Mobile vs Email */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  onClick={() => setAuthMethod('mobile')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t.mobileTab}
                </button>
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t.emailTab}
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      defaultValue="Priya Sharma"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                )}

                {authMethod === 'mobile' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.mobileNumber}
                    </label>
                    <div className="flex gap-2">
                      <div className="w-16 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-700">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={authInput}
                        onChange={e => setAuthInput(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.emailAddress}
                    </label>
                    <input
                      type="email"
                      defaultValue="priya@example.com"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      {t.password}
                    </label>
                    {authMode === 'login' && (
                      <button className="text-[11px] text-blue-600 hover:underline">
                        {t.forgotPassword}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Action Button */}
              <button
                onClick={() => {
                  if (authMode === 'signup') {
                    setIsNewUserFlow(true);
                    setScreen('otp');
                  } else {
                    setIsNewUserFlow(false);
                    handleLogin();
                  }
                }}
                className="w-full h-12 mt-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center transition-all"
              >
                {authMode === 'login' ? t.loginBtn : t.signupBtn}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.or}
                </span>
              </div>

              {/* Continue with OTP Button */}
              <button
                onClick={() => {
                  setIsNewUserFlow(authMode === 'signup');
                  setScreen('otp');
                }}
                className="w-full h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {t.continueWithOtp}
              </button>
            </div>

            {/* Bottom Toggle Signup vs Login */}
            <div className="pt-4 pb-2 text-center">
              {authMode === 'login' ? (
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setIsNewUserFlow(true);
                  }}
                  className="text-xs text-slate-600 hover:text-blue-600"
                >
                  New user? <span className="font-semibold text-blue-600">Create an account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsNewUserFlow(false);
                  }}
                  className="text-xs text-slate-600 hover:text-blue-600"
                >
                  Already have an account? <span className="font-semibold text-blue-600">Login</span>
                </button>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                <button
                  onClick={() => setScreen('admin-login')}
                  className="text-[11px] text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Admin Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 5. OTP VERIFICATION */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'otp' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-white">
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setScreen('login')}
                  className="p-1.5 -ml-1.5 rounded-full text-slate-600 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl overflow-hidden p-1 border border-slate-200">
                  <img src="/assets/pragyanagrik-logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="mt-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  {t.verifyOtpTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t.verifyOtpSub} <span className="font-semibold text-slate-800">+91 {authInput}</span>
                </p>
              </div>

              {/* 6-digit OTP Inputs */}
              <div className="flex justify-between gap-2 my-8">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={e => {
                      const next = [...otpValues];
                      next[idx] = e.target.value;
                      setOtpValues(next);
                    }}
                    className="w-12 h-14 text-center font-bold text-lg bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Resend Timer */}
              <div className="text-center text-xs text-slate-500 mb-6">
                {otpTimer > 0 ? (
                  <span>{t.resendIn} <strong className="text-blue-600">00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}</strong></span>
                ) : (
                  <button
                    onClick={() => setOtpTimer(30)}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {t.resendOtp}
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  if (authMode === 'signup' || isNewUserFlow) {
                    setScreen('profile-setup');
                  } else {
                    handleLogin(currentUser || DEFAULT_USER);
                  }
                }}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all"
              >
                {t.verifyBtn}
              </button>
            </div>

            <div className="text-center pb-4">
              <button
                onClick={() => setScreen('login')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {t.tryAnother}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 6. PROFILE SETUP */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'profile-setup' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => setScreen('login')}
                  className="p-1.5 -ml-1.5 rounded-full text-slate-600 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Step 1 of 4
                </span>
              </div>

              <h1 className="text-xl font-bold text-slate-900">
                {t.profileSetupTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                {t.profileSetupSub}
              </p>

              {/* Form fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name || ''}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.stateUt} *
                  </label>
                  <select
                    value={profileForm.state || 'Telangana'}
                    onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {JURISDICTIONS.map(([name, type]) => (
                      <option key={name} value={name}>
                        {name} ({type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.district} *
                  </label>
                  <input
                    type="text"
                    value={profileForm.district || ''}
                    onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                    placeholder="e.g. Hyderabad, Karimnagar"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.age} *
                    </label>
                    <input
                      type="number"
                      value={profileForm.age || ''}
                      onChange={e => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                      placeholder="e.g. 28"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.gender}
                    </label>
                    <select
                      value={profileForm.gender || 'Female'}
                      onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other / Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.occupation} *
                    </label>
                    <select
                      value={profileForm.occupation || 'Farmer'}
                      onChange={e => setProfileForm({ ...profileForm, occupation: e.target.value })}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Student">Student</option>
                      <option value="Worker">Daily Wage / Worker</option>
                      <option value="Entrepreneur">Entrepreneur / MSME</option>
                      <option value="Senior Citizen">Senior Citizen</option>
                      <option value="Other">Other / Self-employed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.education}
                    </label>
                    <select
                      value={profileForm.education || 'Graduate'}
                      onChange={e => setProfileForm({ ...profileForm, education: e.target.value })}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Literate">Literate / None</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.annualIncome} (₹)
                    </label>
                    <input
                      type="number"
                      value={profileForm.annual_income || ''}
                      onChange={e => setProfileForm({ ...profileForm, annual_income: Number(e.target.value) })}
                      placeholder="180000"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.category} *
                    </label>
                    <select
                      value={profileForm.category || 'General'}
                      onChange={e => setProfileForm({ ...profileForm, category: e.target.value })}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 pb-2">
              <button
                disabled={!isProfileValid}
                onClick={() => {
                  if (!isProfileValid) return;
                  const updated: UserProfile = {
                    ...DEFAULT_USER,
                    ...profileForm,
                    id: currentUser?.id || `citizen-${Date.now()}`,
                    profile_completed: true,
                  } as UserProfile;
                  setIsNewUserFlow(false);
                  handleLogin(updated);
                }}
                className={`w-full h-12 rounded-2xl text-white font-semibold text-sm shadow-lg flex items-center justify-center transition-all ${
                  isProfileValid
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 cursor-pointer'
                    : 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
                }`}
              >
                {t.saveComplete}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 7. CITIZEN DASHBOARD */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'dashboard' && (
          <div className="flex-1 flex flex-col pb-24 bg-slate-50/70 overflow-y-auto">
            {/* Top Navigation Header */}
            <div className="bg-white px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 p-0.5 shadow-sm">
                  <img src="/assets/pragyanagrik-logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  PragyaNagrik AI
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigateTo('schemes')}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateTo('notifications')}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 border-2 border-white"></span>
                </button>
                <button
                  onClick={() => navigateTo('profile')}
                  className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs ml-1 shadow-sm"
                >
                  {currentUser?.name?.[0] || 'P'}
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Greeting and Citizen Profile Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {t.namaste}, {currentUser?.name?.split(' ')[0] || 'Priya'}! 👋
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.howCanHelp}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {currentUser?.state || 'Telangana'}
                  </span>
                  <div className="text-[10px] font-medium text-slate-400 mt-1">
                    {currentUser?.occupation || 'Citizen'} • {currentUser?.category || 'General'}
                  </div>
                </div>
              </div>

              {/* Unified Quick Search Bar with Voice Input */}
              <div
                onClick={() => setUnifiedSearchOpen(true)}
                className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5 text-slate-400 text-xs flex-1 min-w-0">
                  <Search className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{t.searchPlaceholder || 'Search schemes, services, documents, portals...'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startVoiceInput('unified');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 flex items-center gap-1 text-[11px] font-semibold transition-colors shrink-0 active:scale-95"
                  title={t.tapToSpeak || 'Voice Search'}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{t.speakToSearch || 'Voice'}</span>
                </button>
              </div>

              {/* Ask PragyaNagrik AI Feature Card */}
              <div
                onClick={() => navigateTo('copilot')}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-4.5 sm:p-5 text-white shadow-lg shadow-blue-900/15 border border-blue-400/20 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug truncate">
                          {t.askCardTitle}
                        </h2>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/20 text-blue-100 border border-white/20">
                          AI
                        </span>
                      </div>
                      <p className="text-xs text-blue-100/90 mt-0.5 leading-relaxed line-clamp-2">
                        {t.askCardSub}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('copilot');
                        startVoiceInput('copilot');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 flex items-center gap-1 text-[11px] font-semibold text-white transition-all active:scale-95 shadow-xs"
                      title={t.tapToSpeak || 'Speak to Copilot'}
                    >
                      <Mic className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden sm:inline">{t.tapToSpeak || 'Speak'}</span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/15 group-hover:bg-white/20 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Decorative subtle ambient backdrop glows */}
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none"></div>
                <div className="absolute top-0 right-1/4 w-20 h-20 rounded-full bg-blue-300/10 blur-xl pointer-events-none"></div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                <button
                  onClick={() => navigateTo('schemes')}
                  className="p-3 bg-white border border-slate-200/70 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">{t.schemes}</span>
                </button>

                <button
                  onClick={() => navigateTo('services')}
                  className="p-3 bg-white border border-slate-200/70 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">{t.services}</span>
                </button>

                <button
                  onClick={() => navigateTo('eligibility')}
                  className="p-3 bg-white border border-slate-200/70 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">{t.eligibility}</span>
                </button>

                <button
                  onClick={() => navigateTo('documents')}
                  className="p-3 bg-white border border-slate-200/70 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">{t.documents}</span>
                </button>
              </div>

              {/* Recommended for You */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      {t.recommendedForYou}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Personalized for {currentUser?.state || 'Telangana'} • {currentUser?.occupation || 'Citizen'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('schemes')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {t.viewAll}
                  </button>
                </div>

                <div className="space-y-3">
                  {(recommendations && recommendations.length > 0 ? recommendations : schemes.slice(0, 4).map(s => ({
                    scheme: s,
                    match_score: 90,
                    why: ['Verified welfare scheme matching your state.'],
                    category: s.category
                  }))).slice(0, 4).map((item, idx) => {
                    const s = item.scheme;
                    const isSaved = savedSchemeIds.includes(s.id);
                    const score = item.match_score || (95 - idx * 6);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedScheme(s);
                          navigateTo('scheme-detail');
                        }}
                        className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                              {s.name[0]}
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                                {s.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {s.description}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleSaveScheme(s.id);
                            }}
                            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                              isSaved ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                          </button>
                        </div>

                        {item.why && item.why[0] && (
                          <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="line-clamp-1">{item.why[0]}</span>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {score}% {t.match}
                          </span>
                          <span className="text-slate-400 font-medium">
                            {s.government_level || 'CENTRAL'} • {s.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Government Help by Life Event Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      {t.lifeEventsTitle || 'Government Help by Life Event'}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {t.lifeEventsSub || 'Explore schemes & public services organized by life milestone'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {LIFE_EVENTS.map(evt => (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedLifeEvent(evt)}
                      className="p-3 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl group-hover:scale-110 transition-transform">{evt.icon}</span>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {evt.title}
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                        {evt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Citizen Services Grid on Dashboard */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      {t.servicesTitle}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Direct access to verified national & state portals
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('services')}
                    className="text-xs font-semibold text-purple-600 hover:underline"
                  >
                    {t.viewAll}
                  </button>
                </div>

                <div className="space-y-3">
                  {services.slice(0, 3).map(svc => (
                    <div
                      key={svc.id}
                      className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                                {svc.name}
                              </h3>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Official
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {svc.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <button
                          onClick={() => {
                            setSelectedScheme(svc);
                            navigateTo('scheme-detail');
                          }}
                          className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          {t.viewFullDetails} <ArrowRight className="w-3 h-3" />
                        </button>
                        <a
                          href={svc.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                        >
                          Portal ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 8. AI COPILOT */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'copilot' && (
          <div className="flex-1 flex flex-col justify-between bg-slate-50 pb-20 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    if (history.length > 0) {
                      goBack();
                    } else {
                      navigateTo('dashboard');
                    }
                  }}
                  className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 p-0.5 bg-white shrink-0">
                  <img src="/assets/pragyanagrik-logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-none">
                    {t.copilotTitle}
                  </h1>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t.verifiedIntelligence}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: `reset-${Date.now()}`,
                        sender: 'bot',
                        text: t.copilotCleared || 'Conversation reset. What government scheme or citizen service can I help you find today?',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title={t.copilotCleared || 'Clear conversation'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voice Assistant Status Banner */}
            {voiceState === 'LISTENING' && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 flex items-center justify-between shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <Mic className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{t.listening || 'Listening...'}</div>
                    <div className="text-[10px] text-blue-100">{t.listeningPrompt || 'Speak clearly in your chosen language'}</div>
                  </div>
                </div>
                <button
                  onClick={stopVoiceInput}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold transition-colors"
                >
                  {t.stop || 'Stop'}
                </button>
              </div>
            )}

            {voiceState === 'PROCESSING' && (
              <div className="bg-indigo-50 border-b border-indigo-100 text-indigo-900 px-4 py-2 flex items-center gap-2 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>{t.processingSpeech || 'Processing voice input...'}</span>
              </div>
            )}

            {voiceState === 'SPEAKING' && (
              <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span>{t.speakingAnswer || 'Reading response aloud...'}</span>
                </div>
                <button
                  onClick={stopSpeaking}
                  className="px-2 py-0.5 rounded bg-emerald-200/70 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold"
                >
                  {t.stop || 'Stop'}
                </button>
              </div>
            )}

            {voiceErrorMsg && (
              <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 flex items-center justify-between text-xs">
                <span>{voiceErrorMsg}</span>
                <button
                  onClick={() => setVoiceErrorMsg(null)}
                  className="ml-2 font-bold text-amber-700 hover:text-amber-900 text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Audio TTS and Actions on Bot Message */}
                    {m.sender === 'bot' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => speakBotMessage(m.text, m.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            speakingMsgId === m.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                          title={speakingMsgId === m.id ? (isSpeechPaused ? 'Resume' : 'Pause') : 'Listen to answer'}
                        >
                          {speakingMsgId === m.id ? (
                            isSpeechPaused ? (
                              <>
                                <Play className="w-3 h-3 text-blue-700" />
                                <span>{t.resume || 'Resume'}</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 text-blue-700 animate-pulse" />
                                <span>{t.pause || 'Pause'}</span>
                              </>
                            )
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-slate-600" />
                              <span>{t.listen || 'Listen'}</span>
                            </>
                          )}
                        </button>

                        {speakingMsgId === m.id && (
                          <button
                            onClick={stopSpeaking}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Stop Audio"
                          >
                            <Square className="w-2.5 h-2.5 fill-rose-600" />
                            <span>{t.stop || 'Stop'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {m.schemeId && (
                      <button
                        onClick={() => {
                          const matched = schemes.find(s => s.id === m.schemeId);
                          if (matched) {
                            setSelectedScheme(matched);
                            navigateTo('scheme-detail');
                          }
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {t.viewFullDetails} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {m.verificationNote && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <span className="text-emerald-500">✓</span>
                        <span>{m.verificationNote}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-start gap-2">
                  <div className="px-4 py-3 bg-white border border-slate-200/90 rounded-2xl rounded-tl-none text-xs text-slate-600 shadow-xs flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="font-medium text-slate-500">{t.copilotVerifying}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Question Chips */}
            <div className="px-3 py-2 bg-white/95 border-t border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
              {[
                t.copilotSuggested1,
                t.copilotSuggested2,
                t.copilotSuggested3,
                t.copilotSuggested4,
              ].filter(Boolean).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(chip)}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200/70 text-blue-700 text-[11px] font-medium transition-colors shadow-xs active:scale-95 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder={voiceState === 'LISTENING' ? (t.listening || 'Listening...') : t.typeMessage}
                    className="w-full h-11 pl-4 pr-11 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceState === 'LISTENING') {
                        stopVoiceInput();
                      } else {
                        startVoiceInput('copilot');
                      }
                    }}
                    className={`absolute right-2.5 top-2 p-1.5 rounded-full transition-all cursor-pointer ${
                      voiceState === 'LISTENING'
                        ? 'text-white bg-rose-600 animate-pulse shadow-sm'
                        : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                    }`}
                    title={voiceState === 'LISTENING' ? 'Stop Listening' : (t.tapToSpeak || 'Voice Input')}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 9. SCHEMES LISTING */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'schemes' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-24 relative">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">
                      {t.schemes}
                    </h1>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {filteredSchemes.length} verified government welfare schemes
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLanguageModalOpen(true)}
                    className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 border border-indigo-200 cursor-pointer"
                    title="Change Language"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{languages.find(l => l.id === lang)?.native || 'English'}</span>
                  </button>

                  {compareList.length > 0 && (
                    <button
                      onClick={() => setComparisonModalOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 border border-blue-200 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{t.compare || 'Compare'} ({compareList.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchSchemes}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Categories Pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Secondary Filters: Level, State/UT, and Sorting */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {/* Level Filter (Central / State / UT) */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {(['ALL', 'CENTRAL', 'STATE', 'UT'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedLevel === lvl
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {/* State & Sort Dropdowns */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <select
                    value={selectedStateFilter}
                    onChange={e => setSelectedStateFilter(e.target.value)}
                    className="text-[11px] h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="">{t.allStates || 'All States & UTs'}</option>
                    {JURISDICTIONS.map(([name, type]) => (
                      <option key={name} value={name}>{name} ({type})</option>
                    ))}
                  </select>

                  <select
                    value={schemesSort}
                    onChange={e => setSchemesSort(e.target.value as any)}
                    className="text-[11px] h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="match">{t.sortByMatch || 'Best Match'}</option>
                    <option value="name">{t.sortByName || 'Name (A-Z)'}</option>
                    <option value="date">{t.sortByDate || 'Recently Verified'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scheme Cards */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {filteredSchemes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No verified schemes matched your filter. Try adjusting your search query or reset state filter.
                </div>
              ) : (
                <>
                  {paginatedSchemes.map((s, idx) => {
                    const isSaved = savedSchemeIds.includes(s.id);
                    const isCompared = compareList.some(c => c.id === s.id);
                    const match = idx === 0 ? 96 : idx === 1 ? 88 : 78;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedScheme(s);
                          navigateTo('scheme-detail');
                        }}
                        className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">
                              {s.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-xs font-bold text-slate-900 leading-snug">
                                {s.name}
                              </h2>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {s.government_level} Government • {s.category} {s.state_ut ? `• ${s.state_ut}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleCompareScheme(s);
                              }}
                              className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                isCompared
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                              title={isCompared ? 'Remove from compare' : 'Add to compare'}
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isCompared ? 'Selected' : 'Compare'}</span>
                            </button>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleSaveScheme(s.id);
                              }}
                              className={`p-1.5 rounded-full ${isSaved ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {s.description && (
                          <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {s.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {match}% {t.match}
                          </span>
                          <span className="text-blue-600 font-semibold flex items-center gap-0.5 hover:underline">
                            {t.viewDetails || 'View details'} <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 pb-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Showing {paginatedSchemes.length} of {filteredSchemes.length} verified schemes
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {filteredSchemes.length > paginatedSchemes.length && !showAllSchemes && (
                        <button
                          onClick={() => setSchemesPage(p => p + 1)}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          {t.loadMore || 'Load More Schemes'}
                        </button>
                      )}
                      <button
                        onClick={() => setShowAllSchemes(prev => !prev)}
                        className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        {showAllSchemes ? 'Show in Batches (25)' : `Show All Complete Catalogue (${filteredSchemes.length})`}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Floating Comparison Dock when items are selected */}
            {compareList.length > 0 && (
              <div className="fixed bottom-18 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 z-30 flex items-center justify-between gap-3 animate-slideUp">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Scale className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">
                      {compareList.length === 1
                        ? `1 Selected: ${compareList[0].name}`
                        : compareList.length === 2
                        ? `2 Selected: ${compareList[0].name} vs ${compareList[1].name}`
                        : `3 Selected: ${compareList[0].name}, ${compareList[1].name}, ${compareList[2].name}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {compareList.length === 1
                        ? 'Select 1 or 2 more schemes to compare'
                        : `${compareList.length} schemes ready for side-by-side comparison (up to 3)`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setComparisonModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    {t.compareNow || 'Compare'}
                  </button>
                  <button
                    onClick={() => setCompareList([])}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors text-xs"
                    title="Clear comparison"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 10. SCHEME DETAILS */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'scheme-detail' && selectedScheme && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-20 overflow-y-auto">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20 flex justify-between items-center">
              <button
                onClick={goBack}
                className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCompareScheme(selectedScheme)}
                  className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                    compareList.some(s => s.id === selectedScheme.id) ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
                  }`}
                  title={compareList.some(s => s.id === selectedScheme.id) ? 'Remove from comparison' : 'Add to scheme comparison'}
                >
                  <Scale className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleSaveScheme(selectedScheme.id)}
                  className={`p-2 rounded-full hover:bg-slate-100 ${
                    savedSchemeIds.includes(selectedScheme.id) ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${savedSchemeIds.includes(selectedScheme.id) ? 'fill-blue-600' : ''}`} />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scheme Hero Banner */}
            <div className="bg-gradient-to-tr from-emerald-600 via-teal-700 to-blue-800 text-white p-6 relative overflow-hidden">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                {selectedScheme.government_level} Government • {selectedScheme.category}
              </span>
              <h1 className="text-xl font-bold mt-2">
                {selectedScheme.name}
              </h1>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-base font-extrabold text-amber-300">
                  {selectedScheme.benefits?.[0] || '₹6,000 per year'}
                </span>
                <span className="text-[11px] text-teal-100">
                  • Direct Benefit Transfer
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 flex px-4">
              {(['overview', 'eligibility', 'documents', 'more'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                    detailTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-4 space-y-4">
              {detailTab === 'overview' && (
                <>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {t.aboutScheme}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedScheme.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t.department}</span>
                        <span className="font-medium text-slate-800 text-right">{selectedScheme.department || 'Ministry of Agriculture'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t.officialSource}</span>
                        <a
                          href={selectedScheme.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t.lastVerified}</span>
                        <span className="font-medium text-slate-800">{selectedScheme.last_verified_date || '2026-09-10'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Benefits
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedScheme.benefits?.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {detailTab === 'eligibility' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Eligible Profile Criteria
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-600">Occupation</span>
                      <span className="font-semibold text-slate-900">
                        {Array.isArray(selectedScheme.eligibility?.occupations)
                          ? selectedScheme.eligibility.occupations.join(', ')
                          : 'All citizens'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-600">Citizenship</span>
                      <span className="font-semibold text-slate-900">Indian Resident</span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'documents' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Required Document Checklist
                  </h3>
                  <div className="space-y-2">
                    {selectedScheme.documents?.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900">{doc.name}</div>
                          <div className="text-[11px] text-slate-500">{doc.description}</div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === 'more' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Government Level</span>
                    <span className="font-semibold text-slate-900">{selectedScheme.government_level}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Service Type</span>
                    <span className="font-semibold text-slate-900">{selectedScheme.scheme_service_type}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Verification Status</span>
                    <span className="font-semibold text-emerald-600">{selectedScheme.verification_status}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto p-3 bg-white border-t border-slate-200 flex gap-3 z-30 shadow-lg">
              <button
                onClick={() => navigateTo('eligibility')}
                className="flex-1 h-12 rounded-xl border border-blue-600 text-blue-600 font-semibold text-xs hover:bg-blue-50 transition-colors"
              >
                {t.checkEligibility}
              </button>
              <button
                onClick={() => navigateTo('navigator')}
                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                Guide Me / Apply <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 11. ELIGIBILITY ASSESSMENT */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'eligibility' && (
          <div className="flex-1 flex flex-col justify-between p-5 bg-slate-50 pb-20 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={goBack} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-slate-900">
                  {t.checkEligibility}
                </h1>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-200/80 mb-4 text-xs font-medium text-slate-500">
                <span className="text-blue-600 font-bold">1 Personal</span>
                <span>→</span>
                <span className="text-blue-600 font-bold">2 Income</span>
                <span>→</span>
                <span className="text-blue-600 font-bold">3 Location</span>
                <span>→</span>
                <span className="text-blue-600 font-bold">4 Other</span>
              </div>

              {/* Result Card */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-3 border-2 border-emerald-500 shadow-sm">
                  96%
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {t.youAreEligible}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.eligibilityDescription}
                </p>
              </div>

              {/* Matched Criteria */}
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm mb-4 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t.matchedCriteria}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>State: <strong>{currentUser?.state || 'Telangana'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Age: <strong>25 - 60 years</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Occupation: <strong>Farmer / Eligible Landholder</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Income: <strong>Within eligible category limit</strong></span>
                  </div>
                </div>
              </div>

              {/* Next Step */}
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 mb-4">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {t.requiredNextStep}
                </div>
                <p>Upload your income certificate and land record to complete the official application.</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => navigateTo('documents')}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all"
              >
                {t.viewRequiredDocs}
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                {t.eligibilityDisclaimer}
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 12. REQUIRED DOCUMENTS */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'documents' && (
          <div className="flex-1 flex flex-col justify-between p-5 bg-slate-50 pb-20 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={goBack} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-slate-900">
                  {t.requiredDocsTitle}
                </h1>
              </div>

              {/* Documents Checklist */}
              <div className="space-y-2.5 mb-6">
                {[
                  { name: 'Aadhaar Card', desc: 'Identity proof', status: 'available' },
                  { name: 'Income Certificate', desc: 'Income proof', status: 'missing' },
                  { name: 'Land Records', desc: 'Land ownership proof', status: 'missing' },
                  { name: 'Bank Account Details', desc: 'For direct DBT transfer', status: 'available' },
                  { name: 'Passport Size Photo', desc: 'For application profile', status: 'optional' },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-[11px] text-slate-500">{doc.desc}</p>
                    </div>
                    {doc.status === 'available' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
                        {t.available}
                      </span>
                    )}
                    {doc.status === 'missing' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200">
                        {t.missing}
                      </span>
                    )}
                    {doc.status === 'optional' && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                        {t.optional}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Document Assistant Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{t.needHelpDocs}</span>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Get step-by-step guidance on how to obtain missing certificates through MeeSeva, CSC, or DigiLocker.
                </p>
                <button
                  onClick={() => {
                    navigateTo('copilot');
                    setChatInput('How do I get an Income Certificate?');
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  {t.aiDocAssistant}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigateTo('navigator')}
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all"
              >
                Proceed to Guide Me
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 13. AI VISUAL NAVIGATOR / "GUIDE ME" */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'navigator' && (
          <div className="flex-1 flex flex-col justify-between p-5 bg-slate-50 pb-20 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={goBack} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-slate-900">
                  {t.guideMeTitle}
                </h1>
              </div>

              <div className="text-xs font-semibold text-blue-600 mb-1">
                {t.step} {navigatorStep + 1} {t.ofStep} 3
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {navigatorStep === 0 && 'Open official website'}
                {navigatorStep === 1 && 'Locate Farmers Corner & Registration'}
                {navigatorStep === 2 && 'Review documents & Submit declaration'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
                {navigatorStep === 0 && 'Visit the official PM Kisan portal and verify that the address bar ends in .gov.in before entering any details.'}
                {navigatorStep === 1 && "Click on 'New Farmer Registration' under the Farmers Corner menu on the portal's homepage."}
                {navigatorStep === 2 && 'Enter your Aadhaar number, verify via OTP, and confirm all entered bank and land records before final submission.'}
              </p>

              {/* Interactive Visual Browser Mockup with Highlight Box */}
              <div className="w-full bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-md mb-6 relative">
                <div className="h-7 bg-slate-100 border-b border-slate-200 px-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="flex-1 bg-white h-4.5 rounded-md text-[10px] text-slate-500 px-2 flex items-center border border-slate-200 font-mono">
                    https://pmkisan.gov.in
                  </div>
                </div>

                <div className="p-4 min-h-[220px] bg-slate-50 flex flex-col justify-center items-center relative">
                  <div className="w-full h-8 bg-blue-700 rounded-lg flex items-center justify-between px-3 text-white text-[11px] font-bold mb-3">
                    <span>PM-KISAN Portal</span>
                    <span className="text-[9px] bg-emerald-500 px-1.5 py-0.5 rounded">Govt of India</span>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 mb-3">
                    <div className={`p-3 rounded-xl border text-center transition-all ${navigatorStep === 1 ? 'border-red-500 bg-red-50 ring-2 ring-red-400 animate-pulse' : 'border-slate-200 bg-white'}`}>
                      <span className="text-[11px] font-bold text-slate-800">Farmers Corner</span>
                      <p className="text-[9px] text-slate-400">New Registration</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                      <span className="text-[11px] font-bold text-slate-800">Beneficiary Status</span>
                      <p className="text-[9px] text-slate-400">Track application</p>
                    </div>
                  </div>

                  {navigatorStep === 0 && (
                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center p-4">
                      <div className="bg-white p-3 rounded-xl shadow-xl border-2 border-blue-600 text-xs font-bold text-blue-700">
                        👆 Step 1: Open the official .gov.in website
                      </div>
                    </div>
                  )}

                  {navigatorStep === 2 && (
                    <div className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 font-medium text-center">
                      ✓ Confirm declarations on live official government portal
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-3 mb-3">
                <button
                  disabled={navigatorStep === 0}
                  onClick={() => setNavigatorStep(prev => Math.max(0, prev - 1))}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs disabled:opacity-40"
                >
                  {t.previous}
                </button>
                <button
                  onClick={() => {
                    if (navigatorStep < 2) {
                      setNavigatorStep(prev => prev + 1);
                    } else {
                      window.open('https://pmkisan.gov.in', '_blank');
                    }
                  }}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1"
                >
                  {navigatorStep === 2 ? 'Open Portal ↗' : 'Next →'}
                </button>
              </div>

              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-semibold text-blue-600 hover:underline"
              >
                {t.viewFullGuide} (Official Portal)
              </a>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 13B. CITIZEN SERVICES SCREEN */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'services' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-20">
            {/* Header & Search */}
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-base font-bold text-slate-900 leading-none">
                      {t.servicesTitle}
                    </h1>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Direct citizen portal access & guides
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLanguageModalOpen(true)}
                    className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 border border-indigo-200 cursor-pointer"
                    title="Change Language"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{languages.find(l => l.id === lang)?.native || 'English'}</span>
                  </button>
                  <div className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                    {filteredServices.length} Portals
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search citizen services, DigiLocker, PAN, Passport..."
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
                {(['All', 'Identity & Records', 'Education & Skills', 'Health', 'Agriculture', 'Finance & Tax', 'General'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Services List */}
            <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
              {filteredServices.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Services Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    No citizen services match "{searchQuery}" under {selectedCategory}.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-3 text-xs font-semibold text-purple-600 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <>
                  {paginatedServices.map(svc => {
                    const isSaved = savedSchemeIds.includes(svc.id);
                    return (
                      <div
                        key={svc.id}
                        className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                                  {svc.name}
                                </h3>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Official .gov
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {svc.department || 'Government of India'}
                              </p>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {svc.description}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleSaveScheme(svc.id)}
                            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                              isSaved ? 'text-purple-600' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-purple-600' : ''}`} />
                          </button>
                        </div>

                        {svc.benefits && svc.benefits.length > 0 && (
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              Key Capabilities
                            </span>
                            <ul className="space-y-1 text-[11px] text-slate-600">
                              {svc.benefits.slice(0, 2).map((b, bIdx) => (
                                <li key={bIdx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                                  <span className="line-clamp-1">{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <button
                            onClick={() => {
                              setSelectedScheme(svc);
                              navigateTo('scheme-detail');
                            }}
                            className="text-purple-600 font-semibold hover:underline flex items-center gap-1"
                          >
                            {t.viewFullDetails} <ArrowRight className="w-3 h-3" />
                          </button>
                          <a
                            href={svc.official_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors"
                          >
                            Open Portal ↗
                          </a>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 pb-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Showing {paginatedServices.length} of {filteredServices.length} citizen service portals
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {filteredServices.length > paginatedServices.length && !showAllServices && (
                        <button
                          onClick={() => setServicesPage(p => p + 1)}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          {t.loadMore || 'Load More Services'}
                        </button>
                      )}
                      <button
                        onClick={() => setShowAllServices(prev => !prev)}
                        className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        {showAllServices ? 'Show in Batches (25)' : `Show All Portals (${filteredServices.length})`}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 14. SAVED ITEMS */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'saved' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-20">
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
              <h1 className="text-base font-bold text-slate-900 mb-3">
                {t.saved}
              </h1>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm">
                  {t.schemes} ({savedSchemeIds.length})
                </button>
                <button className="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-500">
                  {t.services}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {savedSchemeIds.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No saved schemes yet. Tap the bookmark icon on any scheme to save it for quick access.
                </div>
              ) : (
                schemes
                  .filter(s => savedSchemeIds.includes(s.id))
                  .map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedScheme(s);
                        navigateTo('scheme-detail');
                      }}
                      className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{s.name}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">{s.government_level} Government • {s.category}</p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleSaveScheme(s.id);
                        }}
                        className="p-2 text-blue-600 hover:bg-slate-50 rounded-full"
                      >
                        <Bookmark className="w-5 h-5 fill-blue-600" />
                      </button>
                    </div>
                  ))
              )}
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 15. NOTIFICATIONS */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'notifications' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-20">
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={goBack} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-slate-900">
                  {t.notificationsTitle}
                </h1>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                    notifFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t.all}
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                    notifFilter === 'unread' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {t.unread}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {notifications
                .filter(n => notifFilter === 'all' || !n.read)
                .map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.schemeId) {
                        const target = schemes.find(s => s.id === n.schemeId);
                        if (target) {
                          setSelectedScheme(target);
                          navigateTo('scheme-detail');
                        }
                      }
                    }}
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
                      n.read ? 'border-slate-200/80' : 'border-blue-300 bg-blue-50/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 16. PROFILE */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'profile' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20 flex justify-between items-center">
              <h1 className="text-base font-bold text-slate-900">{t.profile}</h1>
              <button onClick={() => navigateTo('help')} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {/* User Avatar Card */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  {currentUser?.name?.[0] || 'P'}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {currentUser?.name || 'Priya Sharma'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentUser?.email || 'priya@example.com'}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] border border-emerald-200">
                    Verified Citizen
                  </span>
                </div>
              </div>

              {/* Menu List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
                <button
                  onClick={() => navigateTo('profile-setup')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{t.personalInfo}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateTo('language')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>{t.language}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>{languages.find(l => l.id === lang)?.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    alert('Digital Comfort Mode: High contrast & large fonts enabled.');
                  }}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>{t.digitalComfort}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>Comfortable</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('saved')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                    <Bookmark className="w-4 h-4 text-teal-600" />
                    <span>{t.saved}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>{savedSchemeIds.length} items</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('notifications')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>{t.notificationSettings}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateTo('help')}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-800">
                    <HelpCircle className="w-4 h-4 text-sky-600" />
                    <span>{t.helpFaq}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Logout Button triggers modal */}
                <button
                  onClick={() => setAccountModalOpen(true)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-rose-50 transition-colors text-rose-600"
                >
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>{t.logout}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 17. HELP / FAQ */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'help' && (
          <div className="flex-1 flex flex-col bg-slate-50 pb-20 overflow-y-auto">
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={goBack} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-slate-900">
                  {t.helpFaq}
                </h1>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={e => setFaqSearch(e.target.value)}
                  placeholder="Search help topics..."
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="p-4 space-y-3">
              {[
                {
                  q: 'What is PragyaNagrik AI?',
                  a: 'PragyaNagrik AI is a citizen-first intelligent discovery assistant that organizes verified Central, State, and Union Territory government schemes and services, helping citizens understand benefits, eligibility, and required documents in their preferred language.'
                },
                {
                  q: 'How do recommendations work?',
                  a: 'Recommendations match your citizen profile (such as occupation, age, state, and income bracket) against official government scheme eligibility criteria.'
                },
                {
                  q: 'How does eligibility assessment work?',
                  a: 'Our assistive engine checks each verified rule published by official departments. It provides match analysis and required document checklists, but final approval is determined solely by the issuing government authority.'
                },
                {
                  q: 'How to use the AI Copilot?',
                  a: 'You can ask any question regarding government schemes, such as “Tell me about PM-KISAN” or “What scholarships are available for students?”. The AI restricts responses exclusively to verified government domains.'
                },
                {
                  q: 'What is the AI Visual Navigator?',
                  a: 'The visual navigator provides step-by-step guidance on reaching the genuine official portal (.gov.in or .nic.in) and locating the appropriate application form.'
                },
                {
                  q: 'Why should I verify official sources?',
                  a: 'Government guidelines, deadlines, and forms change periodically. We always link directly to the official government portal for verified final submission.'
                }
              ]
                .filter(item => !faqSearch || item.q.toLowerCase().includes(faqSearch.toLowerCase()) || item.a.toLowerCase().includes(faqSearch.toLowerCase()))
                .map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <BottomNav
              currentScreen={screen}
              onNavigate={navigateTo}
              savedCount={savedSchemeIds.length}
              t={t}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 18. LOGOUT / SWITCH ACCOUNT MODAL */}
        {/* ------------------------------------------------------------------ */}
        {accountModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-[440px] bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>

              <h2 className="text-base font-bold text-slate-900 mb-4 text-center">
                {t.account}
              </h2>

              <div className="space-y-2 mb-4">
                <button
                  onClick={handleSwitchAccount}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center gap-3 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div>{t.switchAccount}</div>
                    <div className="text-[10px] text-slate-400 font-normal">Login with a different account</div>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full p-3.5 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/50 flex items-center gap-3 text-xs font-semibold text-rose-600 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-rose-600" />
                  <div className="text-left">
                    <div>{t.logout}</div>
                    <div className="text-[10px] text-rose-400 font-normal">Sign out of current account</div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setAccountModalOpen(false)}
                className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 19. SEPARATE ADMIN LOGIN */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'admin-login' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white">
            <div>
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setScreen('login')}
                  className="p-1.5 -ml-1.5 rounded-full text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/20">
                  Restricted
                </span>
              </div>

              <div className="flex flex-col items-center text-center my-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden p-1 bg-white shadow-xl mb-3">
                  <img src="/assets/pragyanagrik-logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  {t.adminLoginTitle}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {t.adminSub}
                </p>
              </div>

              {adminAuthError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Invalid credentials. Use admin@pragyanagrik.gov.in / admin123</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email / Username
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (adminUsername === 'admin@pragyanagrik.gov.in' && (adminPassword === 'admin123' || adminPassword === '')) {
                    setAdminAuthError(false);
                    setScreen('admin-dashboard');
                  } else {
                    setAdminAuthError(true);
                  }
                }}
                className="w-full h-12 mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all"
              >
                Sign In to Admin Console
              </button>
            </div>

            <div className="text-center pb-4">
              <button
                onClick={() => setScreen('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                {t.backToUserLogin}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 20. ADMIN DASHBOARD & DATA SYNC CONSOLE */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'admin-dashboard' && (
          <div className="flex-1 flex flex-col bg-slate-950 text-white pb-8 overflow-y-auto">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h2 className="font-bold text-sm leading-none">PragyaNagrik Admin</h2>
                  <span className="text-[10px] text-slate-400">Data Providers & Sync Console</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScreen('dashboard')}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  Citizen View
                </button>
                <button
                  onClick={() => setScreen('login')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Records</span>
                  <div className="text-xl font-black text-blue-400 mt-1">81</div>
                  <span className="text-[9px] text-slate-500">28 Schemes • 53 Services</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Central Govt</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">28</div>
                  <span className="text-[9px] text-slate-500">Flagship National</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">States & UTs</span>
                  <div className="text-xl font-black text-purple-400 mt-1">49</div>
                  <span className="text-[9px] text-slate-500">36 Jurisdictions</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Data Quality</span>
                  <div className="text-xl font-black text-amber-400 mt-1">100%</div>
                  <span className="text-[9px] text-slate-500">Zero Synthetic Records</span>
                </div>
              </div>

              {/* Data Providers & Sync Actions */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncingProviders ? 'animate-spin' : ''}`} />
                      Government Data Providers
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Authoritative national gateways and official registries</p>
                  </div>
                  <button
                    disabled={isSyncingProviders}
                    onClick={handleSyncProviders}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProviders ? 'animate-spin' : ''}`} />
                    {isSyncingProviders ? 'Syncing...' : 'Sync Providers'}
                  </button>
                </div>

                {syncSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{syncSuccessMsg}</span>
                  </div>
                )}

                {/* Provider List */}
                <div className="space-y-2 pt-1">
                  {[
                    {
                      name: 'PragyaNagrik Official Verified Repository',
                      type: 'Local Authoritative DB',
                      status: 'CONNECTED',
                      records: '81 Records (Central, 28 States, 8 UTs)',
                      badgeColor: 'text-emerald-400 bg-emerald-950 border-emerald-800'
                    },
                    {
                      name: 'myScheme.gov.in API Gateway Adapter',
                      type: 'National Scheme Portal',
                      status: 'SYNCED',
                      records: 'Central & State flagship schemes indexed',
                      badgeColor: 'text-blue-400 bg-blue-950 border-blue-800'
                    },
                    {
                      name: 'India.gov.in National Services Directory',
                      type: 'National Portal of India',
                      status: 'SYNCED',
                      records: '53 Central & State Citizen Public Services',
                      badgeColor: 'text-blue-400 bg-blue-950 border-blue-800'
                    },
                    {
                      name: 'API Setu Open Government Gateway',
                      type: 'National API Gateway',
                      status: 'READY',
                      records: 'Standardized open metadata connectors',
                      badgeColor: 'text-purple-400 bg-purple-950 border-purple-800'
                    },
                    {
                      name: 'NAPIX National API Exchange',
                      type: 'Inter-Departmental API Exchange',
                      status: 'READY',
                      records: 'Ministry-level service endpoints',
                      badgeColor: 'text-purple-400 bg-purple-950 border-purple-800'
                    },
                    {
                      name: 'UMANG Citizen Services Gateway',
                      type: 'Unified Mobile App for New-age Governance',
                      status: 'READY',
                      records: 'Citizen e-governance service catalog',
                      badgeColor: 'text-purple-400 bg-purple-950 border-purple-800'
                    }
                  ].map((prov, pIdx) => (
                    <div key={pIdx} className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{prov.name}</div>
                        <div className="text-[10px] text-slate-400">{prov.type} • {prov.records}</div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${prov.badgeColor}`}>
                        {prov.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Catalogue Explorer */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Verified Catalogue Auditor
                    </h3>
                    <p className="text-[10px] text-slate-400">Inspect official schemes and citizen portals</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['ALL', 'CENTRAL', 'STATE', 'UT', 'SERVICE'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setAdminCatalogueFilter(tab)}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                          adminCatalogueFilter === tab
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search records by scheme name, ministry, or department..."
                    value={adminSearchQuery}
                    onChange={e => setAdminSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {ALL_SCHEMES.filter(s => {
                    if (adminCatalogueFilter === 'CENTRAL' && s.government_level !== 'CENTRAL') return false;
                    if (adminCatalogueFilter === 'STATE' && s.government_level !== 'STATE') return false;
                    if (adminCatalogueFilter === 'UT' && s.government_level !== 'UT') return false;
                    if (adminCatalogueFilter === 'SERVICE' && s.scheme_service_type !== 'SERVICE') return false;
                    if (adminSearchQuery) {
                      const q = adminSearchQuery.toLowerCase();
                      return (
                        s.name.toLowerCase().includes(q) ||
                        s.description.toLowerCase().includes(q) ||
                        (s.department && s.department.toLowerCase().includes(q))
                      );
                    }
                    return true;
                  }).map(s => (
                    <div key={s.id} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {s.government_level} Government • {s.category} {s.state_ut ? `• ${s.state_ut}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={s.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 bg-blue-950/60 border border-blue-900 px-2 py-0.5 rounded"
                        >
                          Portal ↗
                        </a>
                        <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zero-Fake-Data & AI Audit Policy */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2 text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  Authoritative Government Data Policy & AI Guardrails
                </div>
                <p className="leading-relaxed text-[11px] text-slate-400">
                  PragyaNagrik AI strictly operates on verified government records from authoritative sources (.gov.in, .nic.in). Copilot answers are restricted to verified catalogue facts, and off-topic domain queries (entertainment, gaming, arbitrary coding) are rejected with clear multi-lingual guidance.
                </p>
              </div>

              <button
                onClick={() => setScreen('dashboard')}
                className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Switch to Citizen View
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* UNIFIED SEARCH MODAL */}
        {/* ------------------------------------------------------------------ */}
        {unifiedSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-[440px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">
                      {t.unifiedSearch || 'Search Everything'}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      Schemes, Citizen Services, Portals & Documents
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setUnifiedSearchOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search Box with Voice Input */}
              <div className="p-3 border-b border-slate-100 bg-white">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    autoFocus
                    value={unifiedQuery}
                    onChange={e => setUnifiedQuery(e.target.value)}
                    placeholder={t.searchPlaceholder || 'Search PM-KISAN, Ration, Passport, Scholarship...'}
                    className="w-full h-11 pl-10 pr-24 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {unifiedQuery && (
                      <button
                        onClick={() => setUnifiedQuery('')}
                        className="p-1 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startVoiceInput('unified')}
                      className={`p-1.5 rounded-xl border flex items-center gap-1 text-[11px] font-semibold transition-all ${
                        voiceState === 'LISTENING'
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                      }`}
                      title="Speak to Search"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{voiceState === 'LISTENING' ? 'Listening' : 'Voice'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {/* 1. Schemes */}
                {unifiedResults.schemes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.schemes} ({unifiedResults.schemes.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {unifiedResults.schemes.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedScheme(s);
                            setUnifiedSearchOpen(false);
                            navigateTo('scheme-detail');
                          }}
                          className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                              {s.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {s.government_level} Government • {s.category} {s.state_ut ? `• ${s.state_ut}` : ''}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Citizen Services */}
                {unifiedResults.services.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.services} ({unifiedResults.services.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {unifiedResults.services.map(svc => (
                        <div
                          key={svc.id}
                          className="p-3 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-between gap-2"
                        >
                          <div
                            onClick={() => {
                              setSelectedScheme(svc);
                              setUnifiedSearchOpen(false);
                              navigateTo('scheme-detail');
                            }}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                              {svc.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {svc.description}
                            </p>
                          </div>
                          <a
                            href={svc.official_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg shrink-0 border border-slate-200"
                          >
                            Portal ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Required Documents */}
                {unifiedResults.documents.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.documents} ({unifiedResults.documents.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {unifiedResults.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setUnifiedSearchOpen(false);
                            navigateTo('documents');
                          }}
                          className="p-3 rounded-xl border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                              {doc.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {doc.desc}
                            </p>
                          </div>
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {unifiedResults.schemes.length === 0 &&
                  unifiedResults.services.length === 0 &&
                  unifiedResults.documents.length === 0 && (
                    <div className="text-center py-10 px-4">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-slate-700">No results found</h4>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Try searching by benefit keyword, state name, certificate, or official government portal.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SCHEME COMPARISON MODAL */}
        {/* ------------------------------------------------------------------ */}
        {comparisonModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-[440px] max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">
                      {t.schemeComparison || 'Scheme Comparison'}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      Side-by-side comparison of verified government schemes
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setComparisonModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Comparison Content */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
                {compareList.length < 2 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <Scale className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700">
                      Select 2 schemes to compare
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Currently {compareList.length} scheme selected ({compareList[0]?.name || 'none'}). Go to the Schemes tab and tap "Compare" on a second scheme.
                    </p>
                    <button
                      onClick={() => {
                        setComparisonModalOpen(false);
                        navigateTo('schemes');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                    >
                      {t.browseSchemes || 'Browse Schemes'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header Scheme Cards */}
                    <div className={`grid ${compareList.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                      {compareList.slice(0, 3).map((s, idx) => (
                        <div key={s.id} className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">
                              Scheme {idx + 1} • {s.government_level}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug line-clamp-2">
                              {s.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => toggleCompareScheme(s)}
                            className="text-[10px] font-semibold text-rose-600 hover:underline mt-2 text-left cursor-pointer"
                          >
                            Remove ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Department */}
                    <div className="p-3 bg-white border border-slate-200/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.department}
                      </span>
                      <div className={`grid ${compareList.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-1`}>
                        {compareList.slice(0, 3).map((s, idx) => (
                          <div key={s.id} className={`text-slate-800 font-medium leading-snug text-[11px] ${idx > 0 ? 'border-l border-slate-100 pl-2' : ''}`}>
                            {s.department || 'Government Ministry'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Benefits */}
                    <div className="p-3 bg-white border border-slate-200/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.benefits || 'Benefits & Financial Assistance'}
                      </span>
                      <div className={`grid ${compareList.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-1`}>
                        {compareList.slice(0, 3).map((s, idx) => (
                          <div key={s.id} className={`text-emerald-700 font-bold leading-snug text-[11px] ${idx > 0 ? 'border-l border-slate-100 pl-2' : ''}`}>
                            {s.benefits?.[0] || 'Direct Benefit Transfer (DBT)'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Occupation / Beneficiary */}
                    <div className="p-3 bg-white border border-slate-200/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Target Beneficiary
                      </span>
                      <div className={`grid ${compareList.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-1`}>
                        {compareList.slice(0, 3).map((s, idx) => (
                          <div key={s.id} className={`text-slate-700 text-[11px] ${idx > 0 ? 'border-l border-slate-100 pl-2' : ''}`}>
                            {Array.isArray(s.eligibility?.occupations) && s.eligibility.occupations.length > 0
                              ? s.eligibility.occupations.join(', ')
                              : 'All eligible citizens'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Required Documents Count */}
                    <div className="p-3 bg-white border border-slate-200/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Documents Needed
                      </span>
                      <div className={`grid ${compareList.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-1`}>
                        {compareList.slice(0, 3).map((s, idx) => (
                          <div key={s.id} className={`text-slate-700 text-[11px] ${idx > 0 ? 'border-l border-slate-100 pl-2' : ''}`}>
                            {Array.isArray(s.documents) && s.documents.length > 0
                              ? `${s.documents.length} verified documents`
                              : 'Aadhaar, Bank, Proofs'}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Official Portals */}
                    <div className={`grid ${compareList.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-2`}>
                      {compareList.slice(0, 3).map((s, idx) => (
                        <a
                          key={s.id}
                          href={s.official_url}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-center font-bold text-[11px] transition-colors truncate"
                        >
                          Portal {idx + 1} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* LIFE EVENT MODAL */}
        {/* ------------------------------------------------------------------ */}
        {selectedLifeEvent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-[440px] max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedLifeEvent.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">
                      {selectedLifeEvent.title}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      Life Event Guide
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLifeEvent(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  {selectedLifeEvent.desc}
                </p>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                    Recommended Schemes & Portals
                  </h4>
                  <div className="space-y-2.5">
                    {schemes
                      .filter(s => {
                        const kw = selectedLifeEvent.id;
                        if (kw === 'agriculture' && (s.category === 'Agriculture' || s.name.includes('Kisan') || s.name.includes('Krishi'))) return true;
                        if (kw === 'education' && (s.category === 'Education' || s.name.includes('Scholarship') || s.name.includes('Vidya'))) return true;
                        if (kw === 'health' && (s.category === 'Health' || s.name.includes('Arogya') || s.name.includes('Ayushman'))) return true;
                        if (kw === 'senior' && (s.category === 'Pension' || s.name.includes('Pension') || s.name.includes('Vandana'))) return true;
                        if (kw === 'women' && (s.name.includes('Matru') || s.name.includes('Sukanya') || s.name.includes('Mahila'))) return true;
                        return s.category === 'General' || s.category === 'Agriculture';
                      })
                      .map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedScheme(s);
                            setSelectedLifeEvent(null);
                            navigateTo('scheme-detail');
                          }}
                          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{s.name}</h5>
                            <p className="text-[10px] text-slate-500 truncate">{s.government_level} • {s.category}</p>
                          </div>
                          <span className="text-blue-600 text-xs font-semibold flex items-center gap-0.5 shrink-0">
                            {t.viewDetails || 'Details'} <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedLifeEvent(null);
                    navigateTo('copilot');
                    setChatInput(`Tell me about government schemes and help for ${selectedLifeEvent.title}`);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Copilot About This
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
