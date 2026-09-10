"""Conservative multilingual intent classifier; it never supplies scheme facts."""
from dataclasses import dataclass

@dataclass
class Intent:
    name: str
    government_level: str | None = None
    state_ut: str | None = None
    record_type: str | None = None

UNSUPPORTED = ("movie","film","cricket","match score","joke","recipe","python program","celebrity","weather","बॉलीवुड","क्रिकेट","फिल्म","సినిమా","క్రికెట్","జోక్","వాతావరణం")
GREETINGS = ("hello","hi","hey","namaste","नमस्ते","हेलो","నమస్తే","హలో")
DOCS = ("document","documents","certificate","proof","दस्तावेज","कागजात","పత్రాలు","డాక్యుమెంట్")
ELIGIBILITY = ("eligible","eligibility","qualify","पात्र","अर्हता","అర్హత")
BENEFITS = ("benefit","benefits","amount","लाभ","फायदे","ప్రయోజన")
APPLY = ("apply","application","how do i","process","दर्ज","आवेदन","कैसे","దరఖాస్తు","ఎలా")
OFFICIAL = ("official portal","official link","website","आधिकारिक","వెబ్‌సైట్","పోర్టల్")
SERVICES = ("service","services","aadhaar","birth certificate","caste certificate","सेवा","आधार","जन्म प्रमाण","సేవ","ఆధార్","జనన ధృవీకరణ")
STATES = {"andhra pradesh":"Andhra Pradesh","telangana":"Telangana","tamil nadu":"Tamil Nadu","karnataka":"Karnataka","kerala":"Kerala","maharashtra":"Maharashtra","delhi":"Delhi","उत्तर प्रदेश":"Uttar Pradesh","तेलंगाना":"Telangana","ఆంధ్రప్రదేశ్":"Andhra Pradesh","తెలంగాణ":"Telangana"}

def classify(message: str) -> Intent:
    text = message.casefold().strip()
    if any(x in text for x in UNSUPPORTED): return Intent("UNSUPPORTED_DOMAIN")
    if text in GREETINGS or (len(text.split()) <= 2 and any(x in text for x in GREETINGS)): return Intent("GREETING")
    state = next((value for key,value in STATES.items() if key in text), None)
    level = "CENTRAL" if any(x in text for x in ("central","केंद्रीय","केंद्र","కేంద్ర")) else None
    if any(x in text for x in DOCS): return Intent("REQUIRED_DOCUMENTS",level,state)
    if any(x in text for x in ELIGIBILITY): return Intent("ELIGIBILITY",level,state)
    if any(x in text for x in BENEFITS): return Intent("BENEFITS",level,state)
    if any(x in text for x in APPLY): return Intent("APPLICATION_PROCESS",level,state,"SERVICE" if any(x in text for x in SERVICES) else None)
    if any(x in text for x in OFFICIAL): return Intent("OFFICIAL_PORTAL",level,state)
    if any(x in text for x in SERVICES): return Intent("SERVICE_SEARCH",level,state,"SERVICE")
    if "compare" in text or "तुलना" in text or "పోల్చ" in text: return Intent("SCHEME_COMPARISON",level,state)
    if "recommend" in text or "for me" in text or "मेरे लिए" in text or "నాకు" in text: return Intent("PROFILE_BASED_RECOMMENDATION",level,state)
    if state: return Intent("STATE_SCHEME_SEARCH",level,state)
    if level: return Intent("CENTRAL_SCHEME_SEARCH",level)
    if any(x in text for x in ("scheme","schemes","योजना","योजनाएं","పథకం","పథకాలు")): return Intent("SCHEME_SEARCH")
    return Intent("AMBIGUOUS_QUERY")
