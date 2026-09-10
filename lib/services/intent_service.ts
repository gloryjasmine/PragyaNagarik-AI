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
const DOCS = ['document', 'documents', 'certificate', 'proof', 'दस्तावेज', 'कागजात', 'పత్రాలు', 'డాక్యుమెంట్'];
const ELIGIBILITY = ['eligible', 'eligibility', 'qualify', 'पात्र', 'अर्हता', 'అర్హత'];
const BENEFITS = ['benefit', 'benefits', 'amount', 'लाभ', 'फायदे', 'ప్రయోజన'];
const APPLY = ['apply', 'application', 'how do i', 'process', 'दर्ज', 'आवेदन', 'कैसे', 'దరఖాస్తు', 'ఎలా'];
const OFFICIAL = ['official portal', 'official link', 'website', 'आधिकारिक', 'వెబ్‌సైట్', 'పోర్టల్'];
const SERVICES = ['service', 'services', 'aadhaar', 'birth certificate', 'caste certificate', 'सेवा', 'आधार', 'जन्म प्रमाण', 'సేవ', 'ఆధార్', 'జనన ధృవీకరణ'];

const STATES: Record<string, string> = {
  'andhra pradesh': 'Andhra Pradesh',
  'telangana': 'Telangana',
  'tamil nadu': 'Tamil Nadu',
  'karnataka': 'Karnataka',
  'kerala': 'Kerala',
  'maharashtra': 'Maharashtra',
  'delhi': 'Delhi',
  'उत्तर प्रदेश': 'Uttar Pradesh',
  'तेलंगाना': 'Telangana',
  'ఆంధ్రప్రదేశ్': 'Andhra Pradesh',
  'తెలంగాణ': 'Telangana',
  'bihar': 'Bihar',
  'gujarat': 'Gujarat',
  'punjab': 'Punjab',
  'rajasthan': 'Rajasthan',
  'west bengal': 'West Bengal',
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
    if (text.includes(key)) {
      state = val;
      break;
    }
  }

  const isCentral = ['central', 'केंद्रीय', 'केंद्र', 'కేంద్ర'].some(x => text.includes(x));
  const level = isCentral ? 'CENTRAL' : null;

  if (DOCS.some(x => text.includes(x))) return { name: 'REQUIRED_DOCUMENTS', government_level: level, state_ut: state };
  if (ELIGIBILITY.some(x => text.includes(x))) return { name: 'ELIGIBILITY', government_level: level, state_ut: state };
  if (BENEFITS.some(x => text.includes(x))) return { name: 'BENEFITS', government_level: level, state_ut: state };
  if (APPLY.some(x => text.includes(x))) {
    const isService = SERVICES.some(x => text.includes(x));
    return { name: 'APPLICATION_PROCESS', government_level: level, state_ut: state, record_type: isService ? 'SERVICE' : null };
  }
  if (OFFICIAL.some(x => text.includes(x))) return { name: 'OFFICIAL_PORTAL', government_level: level, state_ut: state };
  if (SERVICES.some(x => text.includes(x))) return { name: 'SERVICE_SEARCH', government_level: level, state_ut: state, record_type: 'SERVICE' };
  if (text.includes('compare') || text.includes('तुलना') || text.includes('పోల్చ')) return { name: 'SCHEME_COMPARISON', government_level: level, state_ut: state };
  if (text.includes('recommend') || text.includes('for me') || text.includes('मेरे लिए') || text.includes('నాకు')) {
    return { name: 'PROFILE_BASED_RECOMMENDATION', government_level: level, state_ut: state };
  }
  if (state) return { name: 'STATE_SCHEME_SEARCH', government_level: level, state_ut: state };
  if (level) return { name: 'CENTRAL_SCHEME_SEARCH', government_level: level };
  if (['scheme', 'schemes', 'योजना', 'योजनाएं', 'పథకం', 'పథకాలు'].some(x => text.includes(x))) {
    return { name: 'SCHEME_SEARCH' };
  }

  return { name: 'AMBIGUOUS_QUERY' };
}
