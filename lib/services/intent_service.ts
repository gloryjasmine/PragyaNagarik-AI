export interface Intent {
  name: string;
  government_level?: string | null;
  state_ut?: string | null;
  record_type?: string | null;
}

const UNSUPPORTED = [
  'movie', 'film', 'cinema', 'mirchi', 'bahubali', 'pushpa', 'song', 'songs', 'music',
  'actor', 'actress', 'hero', 'heroine', 'director', 'trailer', 'box office',
  'bollywood', 'hollywood', 'tollywood', 'kollywood',
  'cricket', 'match', 'match score', 'score', 'ipl', 'football', 'fifa', 'who won', 'player', 'game', 'sports',
  'python', 'code', 'coding', 'programming', 'program', 'javascript', 'java', 'c++', 'html', 'css', 'developer',
  'joke', 'jokes', 'funny', 'comedy', 'laugh', 'riddle',
  'recipe', 'recipes', 'cook', 'cooking', 'dish', 'food', 'restaurant', 'dinner',
  'weather', 'forecast', 'temperature', 'rain', 'climate',
  'celebrity', 'gossip', 'horoscope', 'astrology', 'crypto', 'bitcoin', 'stocks',
  // Multilingual keywords
  'बॉलीवुड', 'क्रिकेट', 'फिल्म', 'सिनेमा', 'गाना', 'अभिनेता', 'हीरो', 'मैच', 'कोड', 'प्रोग्रामिंग', 'जोक', 'चुटकुला', 'रेसिपी', 'व्यंजन', 'मौसम',
  'సినిమా', 'క్రికెట్', 'జోక్', 'వాతావరణం', 'పాట', 'నటుడు', 'హీరో', 'మ్యాచ్', 'కోడ్', 'ప్రోగ్రామింగ్', 'వంటకం', 'రెసిపీ', 'మిర్చి',
  'திரைப்படம்', 'படம்', 'பாடல்', 'நடிகர்', 'கிரிக்கெட்', 'போட்டி', 'குறியீடு', 'நகைச்சுவை', 'சமையல்', 'வானிலை',
  'চলচ্চিত্র', 'সিনেমা', 'গান', 'অভিনেতা', 'ক্রিকেট', 'ম্যাচ', 'কোড', 'কৌতুক', 'রান্না', 'আবহাওয়া',
  'ಚಲನಚಿತ್ರ', 'ಸಿನಿಮಾ', 'ಹಾಡು', 'ನಟ', 'ಕ್ರಿಕೆಟ್', 'ಪಂದ್ಯ', 'ಕೋಡ್', 'ಹಾಸ್ಯ', 'ಅಡುಗೆ', 'ಹವಾಮಾನ',
  'സിനിമ', 'ചിത്രം', 'പാട്ട്', 'നടൻ', 'ക്രിക്കറ്റ്', 'മത്സരം', 'കോഡ്', 'തമാശ', 'പാചകം', 'കാലാവസ്ഥ',
  'चित्रपट', 'गाणे', 'सामना', 'विनोद', 'हवामान',
  'ચલચિત્ર', 'ગીત', 'મેચ', 'વાનગી',
  'ਫ਼ਿਲਮ', 'ਗੀਤ', 'ਅਦਾਕਾਰ', 'ਚੁਟਕਲਾ', 'ਮੌਸਮ',
  'ଚଳଚ୍ଚିତ୍ର', 'ଗୀତ', 'ମ୍ୟାଚ', 'ରୋଷେଇ', 'ପାଣିପାଗ',
  'চলচ্চিত্ৰ', 'ধেমালি', 'ৰন্ধন', 'বতৰ',
  'فلم', 'سینما', 'گانا', 'اداکار', 'کرکٹ', 'میچ', 'کوڈ', 'لطیفہ', 'ترکیب', 'موسم'
];

const GREETINGS = ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हेलो', 'నమస్తే', 'హలో'];
const DOCS = ['document', 'documents', 'proof', 'what documents', 'required documents', 'checklist', 'दस्तावेज', 'कागजात', 'పత్రాలు', 'డాక్యుమెంట్'];
const ELIGIBILITY = ['eligible', 'eligibility', 'qualify', 'who can apply', 'criteria', 'पात्र', 'पात्रता', 'अर्हता', 'అర్హత'];
const BENEFITS = ['benefit', 'benefits', 'amount', 'subsidy', 'assistance', 'लाभ', 'फायदे', 'ప్రయోజన'];
const APPLY = ['apply', 'application', 'how do i apply', 'how to apply', 'how can i apply', 'how do i get', 'process', 'procedure', 'दर्ज', 'आवेदन', 'कैसे', 'దరఖాస్తు', 'ఎలా'];
const OFFICIAL = ['official portal', 'official link', 'website', 'url', 'portal', 'आधिकारिक', 'వెబ్‌సైట్', 'పోర్టల్'];
const CERTIFICATE_SERVICES = [
  'income certificate', 'caste certificate', 'birth certificate', 'death certificate',
  'domicile certificate', 'residence certificate', 'nativity certificate', 'community certificate',
  'ration card', 'rice card', 'driving licence', 'driving license', 'passport', 'pan card', 'aadhaar',
  'voter id', 'land record', '1-b', 'adangal', 'pahani', 'rtc bhoomi', 'encumbrance certificate',
  'आय प्रमाण पत्र', 'जाति प्रमाण पत्र', 'निवास प्रमाण पत्र', 'जन्म प्रमाण पत्र',
  'ఆదాయ ధృవీకరణ', 'కుల ధృవీకరణ', 'నివాస ధృవీకరణ', 'రేషన్ కార్డు'
];
const SERVICES = ['service', 'services', 'citizen service', 'e-district', 'meeseva', 'seva kendra', 'सेवा', 'सेवाएं', 'సేవ', 'సేవలు', ...CERTIFICATE_SERVICES];

const STATES: Record<string, string> = {
  'andhra pradesh': 'Andhra Pradesh',
  'telangana': 'Telangana',
  'tamil nadu': 'Tamil Nadu',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'maharashtra': 'Maharashtra',
  'delhi': 'Delhi',
  'uttar pradesh': 'Uttar Pradesh',
  'bihar': 'Bihar',
  'gujarat': 'Gujarat',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'west bengal': 'West Bengal',
  'odisha': 'Odisha',
  'madhya pradesh': 'Madhya Pradesh',
  'haryana': 'Haryana',
  'jharkhand': 'Jharkhand',
  'assam': 'Assam',
  'chhattisgarh': 'Chhattisgarh',
  'uttarakhand': 'Uttarakhand',
  'himachal pradesh': 'Himachal Pradesh',
  'goa': 'Goa',
  'tripura': 'Tripura',
  'manipur': 'Manipur',
  'meghalaya': 'Meghalaya',
  'mizoram': 'Mizoram',
  'nagaland': 'Nagaland',
  'sikkim': 'Sikkim',
  'arunachal pradesh': 'Arunachal Pradesh',
  'jammu and kashmir': 'Jammu and Kashmir',
  'ladakh': 'Ladakh',
  'chandigarh': 'Chandigarh',
  'puducherry': 'Puducherry',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'उत्तर प्रदेश': 'Uttar Pradesh',
  'तेलंगाना': 'Telangana',
  'ఆంధ్రప్రదేశ్': 'Andhra Pradesh',
  'తెలంగాణ': 'Telangana',
};

export function classifyIntent(message: string): Intent {
  const text = message.toLowerCase().trim();

  if (UNSUPPORTED.some(x => text.includes(x))) {
    return { name: 'UNSUPPORTED_DOMAIN' };
  }

  if (GREETINGS.includes(text) || (text.split(/\s+/).length <= 2 && GREETINGS.some(x => text.includes(x)))) {
    return { name: 'GREETING' };
  }

  let state: string | null = null;
  for (const [key, val] of Object.entries(STATES)) {
    if (text.includes(key.toLowerCase())) {
      state = val;
      break;
    }
  }

  const isCentral = ['central', 'केंद्रीय', 'केंद्र', 'కేంద్ర'].some(x => text.includes(x));
  const level = isCentral ? 'CENTRAL' : null;

  // Profile-based recommendations check (MUST take precedence over general 'apply')
  const profileIndicators = [
    'recommend', 'recommendation', 'recommendations', 'profile', 'for me', 'based on my',
    'my profile', 'eligible for', 'schemes for me', 'can i apply for', 'suggestions for me',
    'मेरे लिए', 'मेरी प्रोफाइल', 'सुझाव', 'నాకు', 'నా అర్హత', 'ప్రొఫైల్'
  ];
  if (profileIndicators.some(x => text.includes(x))) {
    return { name: 'PROFILE_BASED_RECOMMENDATION', government_level: level, state_ut: state };
  }

  // Check specific citizen certificate services
  const isCertService = CERTIFICATE_SERVICES.some(x => text.includes(x));

  if (DOCS.some(x => text.includes(x))) {
    return { name: 'REQUIRED_DOCUMENTS', government_level: level, state_ut: state, record_type: isCertService ? 'SERVICE' : null };
  }
  if (ELIGIBILITY.some(x => text.includes(x))) {
    return { name: 'ELIGIBILITY', government_level: level, state_ut: state };
  }
  if (BENEFITS.some(x => text.includes(x))) {
    return { name: 'BENEFITS', government_level: level, state_ut: state };
  }
  if (APPLY.some(x => text.includes(x))) {
    const isService = isCertService || SERVICES.some(x => text.includes(x));
    return { name: 'APPLICATION_PROCESS', government_level: level, state_ut: state, record_type: isService ? 'SERVICE' : null };
  }
  if (OFFICIAL.some(x => text.includes(x))) {
    return { name: 'OFFICIAL_PORTAL', government_level: level, state_ut: state };
  }
  if (isCertService || SERVICES.some(x => text.includes(x))) {
    return { name: 'SERVICE_SEARCH', government_level: level, state_ut: state, record_type: 'SERVICE' };
  }
  if (text.includes('compare') || text.includes('तुलना') || text.includes('పోల్చ')) {
    return { name: 'SCHEME_COMPARISON', government_level: level, state_ut: state };
  }
  if (state) return { name: 'STATE_SCHEME_SEARCH', government_level: level, state_ut: state };
  if (level) return { name: 'CENTRAL_SCHEME_SEARCH', government_level: level };
  if (['scheme', 'schemes', 'योजना', 'योजनाएं', 'పథకం', 'పథకాలు'].some(x => text.includes(x))) {
    return { name: 'SCHEME_SEARCH' };
  }

  return { name: 'AMBIGUOUS_QUERY' };
}
