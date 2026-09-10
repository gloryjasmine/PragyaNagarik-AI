import { Profile, Scheme } from '../types';
import { classifyIntent } from './intent_service';
import { searchSchemes, getSchemeById } from './scheme_service';
import { recommendSchemes } from './recommendation_service';

const OFF_TOPIC: Record<string, string> = {
  en: "I am designed exclusively to assist with Indian Central, State, and UT government schemes, services, eligibility, required documents, and official application procedures. Please ask a question related to government schemes or citizen services.",
  hi: "मैं केवल भारतीय केंद्र, राज्य और केंद्र शासित प्रदेश की सरकारी योजनाओं, सेवाओं, पात्रता, आवश्यक दस्तावेज़ों और आधिकारिक आवेदन प्रक्रियाओं में सहायता के लिए हूँ। कृपया सरकारी योजनाओं या नागरिक सेवाओं से संबंधित प्रश्न पूछें।",
  te: "నేను భారత కేంద్ర, రాష్ట్ర మరియు కేంద్రపాలిత ప్రాంతాల ప్రభుత్వ పథకాలు, సేవలు, అర్హత, అవసరమైన పత్రాలు మరియు అధికారిక దరఖాస్తు ప్రక్రియలలో సహాయం చేయడానికి ప్రత్యేకంగా రూపొందించబడ్డాను. దయచేసి ప్రభుత్వ పథకాలు లేదా పౌర సేవలకు సంబంధించిన ప్రశ్న అడగండి.",
  ta: "நான் இந்திய மத்திய, மாநில மற்றும் யூனியன் பிரதேச அரசு திட்டங்கள், சேவைகள், தகுதி, தேவையான ஆவணங்கள் மற்றும் அதிகாரப்பூர்வ விண்ணப்ப நடைமுறைகளுக்கு மட்டுமே உதவ வடிவமைக்கப்பட்டுள்ளேன். அரசு திட்டங்கள் தொடர்பான கேள்விகளை கேளுங்கள்.",
  bn: "আমি শুধুমাত্র ভারতীয় কেন্দ্রীয়, রাজ্য এবং কেন্দ্রশাসিত অঞ্চলের সরকারি প্রকল্প, পরিষেবা, যোগ্যতা, প্রয়োজনীয় নথিপত্র এবং আবেদন প্রক্রিয়ায় সহায়তার জন্য প্রস্তুত। অনুগ্রহ করে সরকারি প্রকল্প সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন।",
  mr: "मी केवळ भारतीय केंद्र, राज्य आणि केंद्रशासित प्रदेशांच्या सरकारी योजना, सेवा, पात्रता, आवश्यक कागदपत्रे आणि अधिकृत अर्ज प्रक्रियेत मदत करण्यासाठी तयार केलेला आहे. कृपया सरकारी योजना किंवा नागरिक सेवांशी संबंधित प्रश्न विचारा.",
  gu: "હું ફક્ત ભારતીય કેન્દ્ર, રાજ્ય અને કેન્દ્રશાસિત પ્રદેશોની સરકારી યોજનાઓ, સેવાઓ, પાત્રતા, જરૂરી દસ્તાવેજો અને અધિકૃત અરજી પ્રક્રિયાઓમાં સહાય કરવા માટે રચાયેલ છું. કૃપા કરીને સરકારી યોજનાઓ સંબંધિત પ્રશ્ન પૂછો.",
  kn: "ನಾನು ಭಾರತೀಯ ಕೇಂದ್ರ, ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಗಳ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಸೇವೆಗಳು, ಅರ್ಹತೆ, ಅಗತ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಅಧಿಕೃತ ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಗಳಲ್ಲಿ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.",
  ml: "ഇന്ത്യൻ കേന്ദ്ര, സംസ്ഥാന, കേന്ദ്രഭരണ പ്രദേശങ്ങളിലെ സർക്കാർ പദ്ധതികൾ, സേവനങ്ങൾ, അർഹത, ആവശ്യമായ രേഖകൾ, ഔദ്യോഗിക അപേക്ഷാ നടപടികൾ എന്നിവയിൽ സഹായിക്കാൻ മാത്രമാണ് ഞാൻ രൂപകൽപ്പന ചെയ്തിട്ടുള്ളത്. ദയവായി സർക്കാർ പദ്ധതികളുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങൾ ചോദിക്കുക.",
  pa: "ਮੈਂ ਸਿਰਫ਼ ਭਾਰਤੀ ਕੇਂਦਰ, ਰਾਜ ਅਤੇ ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼ਾਂ ਦੀਆਂ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ, ਸੇਵਾਵਾਂ, ਯੋਗਤਾ, ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਅਤੇ ਅਧਿਕਾਰਤ ਅਰਜ਼ੀ ਪ੍ਰਕਿਰਿਆਵਾਂ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਨਾਲ ਸਬੰਧਤ ਸਵਾਲ ਪੁੱਛੋ।",
  or: "ମୁଁ କେବଳ ଭାରତୀୟ କେନ୍ଦ୍ର, ରାଜ୍ୟ ଏବଂ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳର ସରକାରୀ ଯୋଜନା, ସେବା, ଯୋଗ୍ୟତା, ଆବଶ୍ୟକୀୟ ଦସ୍ତାବିଜ ଏବଂ ସରକାରୀ ଆବେଦନ ପ୍ରକ୍ରିୟାରେ ସାହାଯ୍ୟ କରିବା ପାଇଁ ଡିଜାଇନ୍ ହୋଇଛି। ଦୟାକରି ସରକାରୀ ଯୋଜନା ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।",
  as: "মই কেৱল ভাৰতীয় কেন্দ্ৰীয়, ৰাজ্যিক আৰু কেন্দ্ৰীয় শাসিত অঞ্চলৰ চৰকাৰী আঁচনি, সেৱা, যোগ্যতা, প্ৰয়োজনীয় নথিপত্ৰ আৰু চৰকাৰী আবেদন প্ৰক্ৰিয়াত সহায় কৰিবলৈ তৈয়াৰ কৰা হৈছে। অনুগ্ৰহ কৰি চৰকাৰী আঁচনি সম্পৰ্কীয় প্ৰশ্ন সোধক।",
  ur: "میں صرف ہندوستانی مرکزی، ریاستی اور مرکز کے زیر انتظام علاقوں کی سرکاری اسکیموں، خدمات، اہلیت، مطلوبہ دستاویزات اور سرکاری درخواست کے طریقہ کار میں مدد کے لیے ڈیزائن کیا گیا ہوں۔ براہ کرم سرکاری اسکیموں سے متعلق سوال پوچھیں۔",
  sa: "अहं केवलं भारतीयकेन्द्र-राज्य-केन्द्रशासितप्रदेशानां सर्वकारीययोजनासु, सेवायाम्, पात्रतायां, आवश्यकपत्रेषु च साहाय्यार्थं निर्मितः अस्मि। कृपया सर्वकारीययोजनाविषयकं प्रश्नं पृच्छतु।",
  ne: "म केवल भारतीय केन्द्र, राज्य र केन्द्र शासित प्रदेशका सरकारी योजनाहरू, सेवाहरू, योग्यता, आवश्यक कागजातहरू र आधिकारिक आवेदन प्रक्रियाहरूमा मद्दत गर्नका लागि तयार गरिएको हुँ। कृपया सरकारी योजनाहरूसँग सम्बन्धित प्रश्न सोध्नुहोस्।",
  kok: "हांव फकत भारतीय केंद्र, राज्य आनी केंद्रशासित प्रदेशांच्या सरकारी येवजण्यां, सेवा, पात्रता, गर्जेचीं कागादां आनी अधिकृत अर्ज प्रक्रियेंत मजत करपा खातीर आसां। उपकार करून सरकारी येवजण्यां विशीं प्रस्न विचारात.",
  mai: "हम केवल भारतीय केन्द्र, राज्य आ केन्द्र शासित प्रदेशक सरकारी योजना सभ, सेवा सभ, पात्रता, आवश्यक कागजात आ आधिकारिक आवेदन प्रक्रिया मे मदद लेल बनल छी। कृपया सरकारी योजना सं संबंधित प्रश्न पूछू।",
  doi: "मूँ सिर्फ भारतीय केंद्र, राज्य ते केंद्र शासित प्रदेशें दियां सरकारी योजनां, सेवां, पात्रता, जरूरी दस्तावेजें ते सरकारी अर्जी प्रक्रिया च मदद लेई तेयार कीता गेआ हां। कृपया सरकारी योजनां कन्नै सरबंधत सवाल पुच्छो।",
  brx: "आं खालि भारत हादत, राज्य आरो केन्द्रासासित ओनसोलनि सरकारि आँचनिफोर, सिबिथायफोर, गोहो, गोनां फोरमान बिलाइ आरो आबेदन खान्थिआव हेफाजाब होनो थाखायसो बानायजादों।",
  sat: "ᱤᱧ ᱫᱚ ᱥᱩᱢᱩᱝ ᱵᱷᱟᱨᱚᱛ ᱥᱚᱨᱠᱟᱨ, ᱯᱚᱱᱚᱛ ᱟᱨ ᱛᱟᱞᱢᱟ ᱥᱟᱥᱚᱱᱮᱫ ᱮᱞᱟᱠᱟ ᱨᱮᱱᱟᱜ ᱥᱚᱨᱠᱟᱨᱤ ᱡᱚᱡᱚᱱᱟ, ᱥᱮᱵᱟ, ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱠᱟᱜᱚᱡᱽ ᱟᱨ ᱟᱨᱫᱟᱥ ᱦᱚᱨᱟ ᱨᱮ ᱜᱚᱲᱚ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱱᱟᱹᱧ᱾",
  ks: "بہٕ چھُس صِرِف ہندوستٲنؠ مرکٔزی، رِیاستی تہٕ یوٹین ہٕندؠ سَرکٲری سکیٖمَن، خٕدماتَن، اہلیَتھ، ضۆروٗری دَستاویزاتَن تہٕ سَرکٲری دَرخواست کَرنٕکِس طٔریٖقَس مَنٛز مَدَتھ کَرنہٕ خٲطرٕ بَنٲوِتھ।",
  sd: "مان رڳو هندستاني مرڪزي، رياستي ۽ مرڪز جي انتظام هيٺ علائقن جي سرڪاري اسڪيمن، خدمتن، قابليت، گهربل دستاويزن ۽ سرڪاري درخواست جي طريقيڪار ۾ مدد لاءِ ٺاهيو ويو آهيان.",
  mni: "ঐহাক্না ভারতকী কেন্দ্র, রাজ্য অমসুং য়ুনিয়ন তেরিতোরীগী লৈঙাক্কী থৌরাংশিং, শেবাশিং, যোগ্য ওইবা, মথৌ তাবা চে-চাংশিং অমসুং এপ্লিকেসনগী থৌওংশিংদা খক্তা মতেং পাংনবা শেম্বনি।"
};

const GREETING: Record<string, string> = {
  en: "Namaste! 👋 I can help you discover Indian government schemes and services, check eligibility, verify documents, and guide your application. Which scheme or benefit would you like to explore?",
  hi: "नमस्ते! 👋 मैं भारतीय सरकारी योजनाओं, नागरिक सेवाओं, पात्रता, दस्तावेज़ों और आवेदन प्रक्रिया में आपकी सहायता कर सकता हूँ। आप किस योजना या सेवा के बारे में जानना चाहते हैं?",
  te: "నమస్తే! 👋 భారత ప్రభుత్వ పథకాలు, సేవలు, అర్హత, పత్రాలు మరియు దరఖాస్తు ప్రక్రియలో నేను మీకు సహాయం చేయగలను. మీరు ఏ పథకం లేదా ప్రయోజనం గురించి తెలుసుకోవాలనుకుంటున్నారు?",
  ta: "வணக்கம்! 👋 இந்திய அரசு திட்டங்கள், சேவைகள், தகுதி, ஆவணங்கள் மற்றும் விண்ணப்ப வழிகாட்டலில் நான் உங்களுக்கு உதவ முடியும். நீங்கள் எதைப் பற்றி அறிய விரும்புகிறீர்கள்?",
  bn: "নমস্কার! 👋 আমি ভারতীয় সরকারি প্রকল্প, পরিষেবা, যোগ্যতা, নথিপত্র এবং আবেদন নির্দেশিকায় আপনাকে সহায়তা করতে পারি। আপনি কোন প্রকল্প সম্পর্কে জানতে চান?",
  mr: "नमस्ते! 👋 मी भारतीय सरकारी योजना, नागरिक सेवा, पात्रता, कागदपत्रे आणि अर्ज प्रक्रियेत आपली मदत करू शकतो. आपण कोणत्या योजनेबद्दल जाणून घेऊ इच्छिता?",
  gu: "નમસ્તે! 👋 હું ભારતીય સરકારી યોજનાઓ, સેવાઓ, પાત્રતા, દસ્તાવેજો અને અરજી માર્ગદર્શનમાં તમને મદદ કરી શકું છું. તમે કઈ યોજના વિશે જાણવા માગો છો?",
  kn: "ನಮಸ್ಕಾರ! 👋 ನಾನು ಭಾರತೀಯ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಸೇವೆಗಳು, ಅರ್ಹತೆ, ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಜಿ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಯಾವ ಯೋಜನೆಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
  ml: "നമസ്കാരം! 👋 ഇന്ത്യൻ സർക്കാർ പദ്ധതികൾ, സേവനങ്ങൾ, അർഹത, രേഖകൾ, അപേക്ഷാ മാർഗ്ഗനിർദ്ദേശം എന്നിവയിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും. ഏത് പദ്ധതിയെക്കുറിച്ചാണ് അറിയേണ്ടത്?",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 👋 ਮੈਂ ਭਾਰਤੀ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ, ਸੇਵਾਵਾਂ, ਯੋਗਤਾ, ਦਸਤਾਵੇਜ਼ਾਂ ਅਤੇ ਅਰਜ਼ੀ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਕਿਸ ਯੋਜਨਾ ਬਾਰੇ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
  or: "ନମସ୍କାର! 👋 ମୁଁ ଭାରତୀୟ ସରକାରୀ ଯୋଜନା, ସେବା, ଯୋଗ୍ୟତା, ଦସ୍ତାବିଜ ଏବଂ ଆବେଦନ ନିର୍ଦ୍ଦେଶିକାରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ଆପଣ କେଉଁ ଯୋଜନା ବିଷୟରେ ଜାଣିବାକୁ ଚାହାଁନ୍ତି?",
  as: "নমস্কাৰ! 👋 মই ভাৰতীয় চৰকাৰী আঁচনি, সেৱা, যোগ্যতা, নথিপত্ৰ আৰু আবেদন প্ৰক্ৰিয়াত আপোনাক সহায় কৰিব পাৰোঁ। আপুনি কোনখন আঁচনিৰ বিষয়ে জানিব বিচাৰে?",
  ur: "نمستے! 👋 میں ہندوستانی سرکاری اسکیموں، خدمات، اہلیت، دستاویزات، اور درخواست کی رہنمائی میں آپ کی مدد کر سکتا ہوں۔ آپ کس اسکیم کے بارے में جاننا چاہتے ہیں؟"
};

const NOT_FOUND: Record<string, string> = {
  en: "I couldn't find verified information for that request in the official government catalogue. Please try searching with a specific scheme name (e.g., PM-KISAN, PMAY), citizen service (e.g., DigiLocker), State/UT, or beneficiary category.",
  hi: "मुझे आधिकारिक सरकारी कैटलॉग में इस अनुरोध के लिए कोई सत्यापित जानकारी नहीं मिली। कृपया किसी विशिष्ट योजना के नाम (उदा. पीएम-किसान, पीएमएवाई), सेवा (उदा. डिजिलॉकर), राज्य या श्रेणी से खोजें।",
  te: "అధికారిక ప్రభుత్వ కేటలాగ్‌లో ఈ అభ్యర్థన కోసం ధృవీకరించబడిన సమాచారం దొరకలేదు. దయచేసి నిర్దిష్ట పథకం పేరు (ఉదా. PM-KISAN, PMAY), సేవ (ఉదా. డిజిలాకర్), రాష్ట్రం లేదా వర్గంతో శోధించండి.",
  ta: "அதிகாரப்பூர்வ அரசு பட்டியலில் இந்த கோரிக்கைக்கு சரிபார்க்கப்பட்ட தகவல் கிடைக்கவில்லை. குறிப்பிட்ட திட்டத்தின் பெயர் (எ.கா. PM-KISAN), சேவை அல்லது மாநிலத்தின் பெயருடன் முயற்சிக்கவும்.",
  bn: "সরকারি ক্যাটালগে এই অনুরোধের জন্য কোনো যাচাইকৃত তথ্য পাওয়া যায়নি। অনুগ্রহ করে কোনো নির্দিষ্ট প্রকল্পের নাম (যেমন PM-KISAN), পরিষেবা বা রাজ্যের নাম দিয়ে অনুসন্ধান করুন।",
  mr: "अधिकृत सरकारी कॅटलॉगमध्ये या विनंतीसाठी कोणतीही पडताळणी केलेली माहिती आढळली नाही. कृपया विशिष्ट योजनेचे नाव (उदा. PM-KISAN), सेवा किंवा राज्यासह शोधा.",
  gu: "સત્તાવાર સરકારી કેટલોગમાં આ વિનંતી માટે કોઈ ચકાસાયેલ માહિતી મળી નથી. કૃપા કરીને ચોક્કસ યોજનાના નામ (દા.ત. PM-KISAN), સેવા અથવા રાજ્ય સાથે શોધો.",
  kn: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಈ ವಿನಂತಿಗೆ ಯಾವುದೇ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿರ್ದಿಷ್ಟ ಯೋಜನೆಯ ಹೆಸರು (ಉದಾ. PM-KISAN), ಸೇವೆ ಅಥವಾ ರಾಜ್ಯದೊಂದಿಗೆ ಹುಡುಕಿ.",
  ml: "ഔദ്യോഗിക സർക്കാർ കാറ്റലോഗിൽ ഈ അഭ്യർത്ഥനയ്ക്ക് സാധുവായ വിവരങ്ങളൊന്നും കണ്ടെത്താനായില്ല. ദയവായി ഒരു നിർദ്ദിഷ്ട പദ്ധതിയുടെ പേര് (ഉദാ. PM-KISAN), സേവനം അല്ലെങ്കിൽ സംസ്ഥാനം ഉപയോഗിച്ച് തിരയുക.",
  pa: "ਸਰਕਾਰੀ ਕੈਟਾਲਾਗ ਵਿੱਚ ਇਸ ਬੇਨਤੀ ਲਈ ਕੋਈ ਪ੍ਰਮਾਣਿਤ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਕਿਸੇ ਵਿਸ਼ੇਸ਼ ਯੋਜਨਾ ਦਾ ਨਾਮ (ਜਿਵੇਂ PM-KISAN), ਸੇਵਾ ਜਾਂ ਰਾਜ ਲਿਖ ਕੇ ਖੋਜ ਕਰੋ।",
  or: "ସରକାରୀ କ୍ୟାଟାଲଗ୍‌ରେ ଏହି ଅନୁରୋଧ ପାଇଁ କୌଣସି ଯାଞ୍ଚ ହୋଇଥିବା ସୂଚନା ମିଳିଲା ନାହିଁ। ଦୟାକରି କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଯୋଜନାର ନାମ (ଯଥା PM-KISAN), ସେବା କିମ୍ବା ରାଜ୍ୟ ସହିତ ସନ୍ଧାନ କରନ୍ତୁ।",
  as: "চৰকাৰী তালিকাত এই অনুৰোধৰ বাবে কোনো তথ্য পোৱা নগ’ল। অনুগ্ৰহ কৰি কোনো নিৰ্দিষ্ট আঁচনিৰ নাম (যেনে PM-KISAN), সেৱা বা ৰাজ্যৰ নাম দি সন্ধান কৰক।",
  ur: "سرکاری کیٹلاگ میں اس درخواست کے لیے کوئی تصدیق شدہ معلومات نہیں ملیں۔ براہ کرم کسی مخصوص اسکیم کے نام (جیسے PM-KISAN)، سروس یا ریاست کے ساتھ تلاش کریں۔"
};

const AMBIGUOUS_MSG: Record<string, string> = {
  en: "Could you please specify the government scheme, citizen service, or State/UT you need assistance with? (For example: PM-KISAN, Ayushman Bharat, student scholarships, or birth certificate services)",
  hi: "क्या आप कृपया उस सरकारी योजना, नागरिक सेवा या राज्य/केंद्र शासित प्रदेश का नाम बता सकते हैं जिसके बारे में आप सहायता चाहते हैं? (उदाहरण: पीएम-किसान, छात्रवृत्ति, या जन्म प्रमाण पत्र)",
  te: "దయచేసి మీకు సహాయం కావలసిన ప్రభుత్వ పథకం, పౌర సేవ లేదా రాష్ట్రం/కేంద్రపాలిత ప్రాంతాన్ని పేర్కొనగలరా? (ఉదాహరణకు: PM-KISAN, విద్యార్థి స్కాలర్‌షిప్‌లు లేదా ధృవీకరణ పత్రాలు)",
  ta: "உங்களுக்கு உதவி தேவைப்படும் அரசு திட்டம், குடிமக்கள் சேவை அல்லது மாநிலம்/யூனியன் பிரதேசத்தை குறிப்பிட முடியுமா? (எ.கா: PM-KISAN, ஆயுஷ்மான் பாரத்)",
  bn: "আপনি কোন সরকারি প্রকল্প বা নাগরিক পরিষেবা সম্পর্কে জানতে চান তা দয়া করে উল্লেখ করবেন? (যেমন: PM-KISAN, আয়ুষ্মান ভারত)",
  mr: "तुम्हाला कोणत्या सरकारी योजनेबद्दल किंवा नागरिक सेवेबद्दल मदत हवी आहे ते कृपया सांगू शकाल का? (उदा. PM-KISAN, शिष्यवृत्ती)",
  gu: "તમને કઈ સરકારી યોજના અથવા નાગરિક સેવા વિશે સહાય જોઈએ છે તે સ્પષ્ટ કરશો? (દા.ત. PM-KISAN)",
  kn: "ದಯವಿಟ್ಟು ನಿಮಗೆ ಸಹಾಯ ಬೇಕಾಗಿರುವ ಸರ್ಕಾರಿ ಯೋಜನೆ ಅಥವಾ ನಾಗರಿಕ ಸೇವೆಯನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಬಹುದೇ? (ಉದಾ: PM-KISAN)",
  ml: "ഏത് സർക്കാർ പദ്ധതിയെക്കുറിച്ചോ പൗര സേവനത്തെക്കുറിച്ചോ ആണ് വിവരങ്ങൾ ആവശ്യമെന്ന് വ്യക്തമാക്കാമോ? (ഉദാ: PM-KISAN)",
  pa: "ਕੀ ਤੁਸੀਂ ਸਰਕਾਰੀ ਯੋਜਨਾ ਜਾਂ ਸੇਵਾ ਦਾ ਨਾਮ ਦੱਸ ਸਕਦੇ ਹੋ ਜਿਸ ਬਾਰੇ ਤੁਹਾਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ? (ਜਿਵੇਂ PM-KISAN)",
  or: "ଆପଣ କେଉଁ ସରକାରୀ ଯୋଜନା ବା ସେବା ବିଷୟରେ ଜାଣିବାକୁ ଚାହାଁନ୍ତି ଦୟାକରି କହିବେ କି? (ଯଥା PM-KISAN)",
  as: "আপুনি কোনখন চৰকাৰী আঁচনি বা সেৱাৰ বিষয়ে জানিব বিচাৰে অনুগ্ৰহ কৰি ক’ব নেকি? (যেনে: PM-KISAN)",
  ur: "کیا آپ اس سرکاری اسکیم یا شہری خدمت کی وضاحت کر سکتے ہیں جس میں آپ کو مدد کی ضرورت ہے؟ (مثال: PM-KISAN)"
};

function getLang(profile?: Profile): string {
  const lang = profile?.preferred_language || 'en';
  return OFF_TOPIC[lang] ? lang : 'en';
}

function matchRecords(message: string, records: Scheme[]): Scheme[] {
  const cleanMsg = message.toLowerCase().trim();
  if (!cleanMsg) return [];
  
  // Try exact or high confidence matching
  const exact = records.filter(s => {
    const sName = s.name.toLowerCase();
    const sId = s.id.toLowerCase();
    const sCat = (s.category || '').toLowerCase();
    return cleanMsg.includes(sName) || sName.includes(cleanMsg) || cleanMsg.includes(sId) || sId.includes(cleanMsg) || (sCat && cleanMsg.includes(sCat));
  });

  return exact;
}

const LABELS: Record<string, { desc: string; ben: string; elig: string; docs: string; apply: string; gov: string; dept: string; src: string; ver: string }> = {
  hi: { desc: 'विवरण', ben: 'प्रमुख लाभ', elig: 'पात्रता', docs: 'आवश्यक दस्तावेज़', apply: 'आधिकारिक पोर्टल पर आवेदन करें', gov: 'सरकार', dept: 'विभाग', src: 'आधिकारिक स्रोत', ver: 'अंतिम सत्यापन' },
  te: { desc: 'వివరణ', ben: 'ప్రయోజనాలు', elig: 'అర్హత', docs: 'అవసరమైన పత్రాలు', apply: 'ఆధికారిక పోర్టల్ లో దరఖాస్తు', gov: 'ప్రభుత్వం', dept: 'శాఖ', src: 'అధికారిక మూలం', ver: 'చివరి ధృవీకరణ' },
  ta: { desc: 'விளக்கம்', ben: 'நன்மைகள்', elig: 'தகுதி', docs: 'தேவையான ஆவணங்கள்', apply: 'அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்கவும்', gov: 'அரசு', dept: 'துறை', src: 'அதிகாரப்பூர்வ ஆதாரம்', ver: 'கடைசி சரிபார்ப்பு' },
  en: { desc: 'What it is', ben: 'Benefits', elig: 'Eligibility', docs: 'Required documents', apply: 'Apply on Official Portal', gov: 'Government', dept: 'Department', src: 'Official source', ver: 'Last verified' }
};

function formatScheme(s: Scheme, intent: string, lang = 'en'): string {
  const lbl = LABELS[lang] || LABELS.en;
  const parts: string[] = [s.name, `${lbl.desc}: ${s.description}`];

  if (
    ['BENEFITS', 'SCHEME_INFORMATION', 'SCHEME_SEARCH', 'STATE_SCHEME_SEARCH', 'CENTRAL_SCHEME_SEARCH'].includes(
      intent
    ) &&
    s.benefits &&
    s.benefits.length > 0
  ) {
    parts.push(`${lbl.ben}: ` + s.benefits.join('; '));
  }

  if (intent === 'ELIGIBILITY') {
    parts.push(
      `${lbl.elig}: ` +
        (s.eligibility && Object.keys(s.eligibility).length > 0
          ? 'Verified profile rules are available for this record.'
          : 'No verified eligibility rules are currently in the catalogue.')
    );
  }

  if (intent === 'REQUIRED_DOCUMENTS') {
    parts.push(
      `${lbl.docs}: ` +
        (s.documents && s.documents.length > 0
          ? s.documents.map(d => d.name).join('; ')
          : 'No verified document checklist is currently in the catalogue.')
    );
  }

  if (['APPLICATION_PROCESS', 'OFFICIAL_PORTAL'].includes(intent) && s.application_url) {
    parts.push(`${lbl.apply}: ` + s.application_url);
  }

  parts.push(
    `${lbl.gov}: ${s.government_level}`,
    s.department ? `${lbl.dept}: ${s.department}` : '',
    `${lbl.src}: ${s.official_url}`,
    s.last_verified_date ? `${lbl.ver}: ${s.last_verified_date}` : ''
  );

  return parts.filter(Boolean).join('\n');
}

export function answerCopilot(
  message: string,
  profile: Profile = {},
  history: Array<{ scheme_id?: string }> = []
) {
  const intent = classifyIntent(message);
  const lang = getLang(profile);

  // 1. Off-topic/Domain restriction check: NEVER return a scheme
  if (intent.name === 'UNSUPPORTED_DOMAIN') {
    return {
      answer: OFF_TOPIC[lang] || OFF_TOPIC['en'],
      schemes: [],
      verification_note: '',
      intent: 'UNSUPPORTED_DOMAIN',
    };
  }

  // 2. Polite greeting
  if (intent.name === 'GREETING') {
    return {
      answer: GREETING[lang] || GREETING['en'],
      schemes: [],
      verification_note: '',
      intent: 'GREETING',
    };
  }

  const state =
    intent.name === 'STATE_SCHEME_SEARCH' || intent.name === 'PROFILE_BASED_RECOMMENDATION'
      ? intent.state_ut || profile.state
      : intent.state_ut;

  // 3. Search verified catalogue for relevant records
  let records =
    searchSchemes(message, intent.government_level, state, null, intent.record_type) || [];

  // 4. CRITICAL FIX: Only check context history if the intent is a genuine follow-up question
  // regarding documents, eligibility, benefits, or application process!
  const isFollowUpIntent = ['REQUIRED_DOCUMENTS', 'ELIGIBILITY', 'BENEFITS', 'APPLICATION_PROCESS', 'OFFICIAL_PORTAL'].includes(intent.name);
  if (records.length === 0 && isFollowUpIntent && history && history.length > 0) {
    const rev = [...history].reverse();
    const prev = rev.find(x => x.scheme_id);
    if (prev?.scheme_id) {
      const scheme = getSchemeById(prev.scheme_id);
      if (scheme) records = [scheme];
    }
  }

  // 5. Handle recommendation intent
  if (intent.name === 'PROFILE_BASED_RECOMMENDATION') {
    records = recommendSchemes(profile)
      .slice(0, 5)
      .map(x => x.scheme)
      .filter(s => s.is_active);
  }

  // 6. Refine matches based on user's query
  if (records.length > 1 && !isFollowUpIntent && intent.name !== 'PROFILE_BASED_RECOMMENDATION') {
    const refined = matchRecords(message, records);
    if (refined.length > 0) {
      records = refined;
    }
  }
  records = records.slice(0, 5);

  // 7. If NO verified records matched, NEVER invent a scheme or fallback to all schemes!
  if (records.length === 0) {
    const notFoundText =
      intent.name === 'AMBIGUOUS_QUERY'
        ? (AMBIGUOUS_MSG[lang] || AMBIGUOUS_MSG['en'])
        : (NOT_FOUND[lang] || NOT_FOUND['en']);
    return {
      answer: notFoundText,
      schemes: [],
      verification_note: '',
      intent: intent.name,
    };
  }

  // 8. Format verified response
  let answerText = '';
  if (
    [
      'SCHEME_SEARCH',
      'SERVICE_SEARCH',
      'STATE_SCHEME_SEARCH',
      'CENTRAL_SCHEME_SEARCH',
      'PROFILE_BASED_RECOMMENDATION',
      'SCHEME_COMPARISON',
    ].includes(intent.name)
  ) {
    answerText = records.map(s => formatScheme(s, 'SCHEME_INFORMATION', lang)).join('\n\n');
  } else {
    answerText = formatScheme(records[0], intent.name, lang);
  }

  return {
    answer: answerText,
    schemes: records,
    verification_note: 'Facts and links are limited to verified official government records.',
    intent: intent.name,
    context_scheme_id: records[0].id,
  };
}

