"""RAG answer layer: catalogue records are the sole factual source."""
from app.ai.intent_service import classify
from app.schemas.scheme import Profile
from app.services.scheme_service import search, get_scheme
from app.services.recommendation_service import recommend

OFF_TOPIC={"en":"I’m designed to help with Indian government schemes and services. Please ask about a scheme, service, eligibility, documents, benefits, or an application process.","hi":"मैं भारतीय सरकारी योजनाओं और सेवाओं में सहायता के लिए बना हूँ। कृपया योजना, सेवा, पात्रता, दस्तावेज़, लाभ या आवेदन प्रक्रिया के बारे में पूछें।","te":"నేను భారత ప్రభుత్వ పథకాలు మరియు సేవలలో సహాయం చేయడానికి రూపొందించబడ్డాను. దయచేసి పథకం, సేవ, అర్హత, పత్రాలు, ప్రయోజనాలు లేదా దరఖాస్తు ప్రక్రియ గురించి అడగండి."}
GREETING={"en":"Hello! 👋 I can help you discover Indian government schemes and services, check eligibility, understand documents, and find official portals. What would you like to explore?","hi":"नमस्ते! मैं सरकारी योजनाओं, सेवाओं, पात्रता, दस्तावेज़ों और आधिकारिक पोर्टलों में मदद कर सकता हूँ।","te":"నమస్తే! ప్రభుత్వ పథకాలు, సేవలు, అర్హత, పత్రాలు మరియు అధికారిక పోర్టల్స్ గురించి నేను సహాయం చేయగలను."}
def _lang(profile): return profile.preferred_language if profile.preferred_language in OFF_TOPIC else "en"
def _match(message, records):
 text="".join(ch for ch in message.casefold() if ch.isalnum()); exact=[s for s in records if "".join(ch for ch in s.name.casefold() if ch.isalnum()) in text]; return exact or records
def _format(s, intent):
 parts=[s.name,f"What it is: {s.description}"]
 if intent in {"BENEFITS","SCHEME_INFORMATION","SCHEME_SEARCH","STATE_SCHEME_SEARCH","CENTRAL_SCHEME_SEARCH"} and s.benefits: parts.append("Benefits: "+"; ".join(s.benefits))
 if intent=="ELIGIBILITY": parts.append("Eligibility: "+("Verified profile rules are available for this record." if s.eligibility else "No verified eligibility rules are currently in the catalogue."))
 if intent=="REQUIRED_DOCUMENTS": parts.append("Required documents: "+("; ".join(d["name"] for d in s.documents) if s.documents else "No verified document checklist is currently in the catalogue."))
 if intent in {"APPLICATION_PROCESS","OFFICIAL_PORTAL"} and s.application_url: parts.append("Apply on Official Portal: "+s.application_url)
 parts += [f"Government: {s.government_level}",f"Department: {s.department}" if s.department else "","Official source: "+s.official_url,f"Last verified: {s.last_verified_date}" if s.last_verified_date else ""]
 return "\n".join(x for x in parts if x)
def answer(message: str, profile: Profile, history=None):
 intent=classify(message); lang=_lang(profile)
 if intent.name=="UNSUPPORTED_DOMAIN": return {"answer":OFF_TOPIC[lang],"schemes":[],"verification_note":""}
 if intent.name=="GREETING": return {"answer":GREETING[lang],"schemes":[],"verification_note":""}
 state=(intent.state_ut or profile.state) if intent.name in {"STATE_SCHEME_SEARCH","PROFILE_BASED_RECOMMENDATION"} else intent.state_ut
 records=search(message,intent.government_level,state,None,intent.record_type) or search("",intent.government_level,state,None,intent.record_type)
 if not records and history:
  previous=next((get_scheme(x.get("scheme_id","")) for x in reversed(history) if x.get("scheme_id")),None); records=[previous] if previous else []
 if intent.name=="PROFILE_BASED_RECOMMENDATION": records=[x["scheme"] for x in recommend(profile)[:5] if x["scheme"].is_active]
 records=_match(message,records)[:5]
 if not records:
  text="Could you tell me the scheme/service name, State or Union Territory, or what you need help with?" if intent.name=="AMBIGUOUS_QUERY" else "I couldn't find verified information for that request in the current government catalogue. Try a scheme name, service, State/UT, or category."
  return {"answer":text,"schemes":[],"verification_note":"No verified catalogue record matched."}
 if intent.name in {"SCHEME_SEARCH","SERVICE_SEARCH","STATE_SCHEME_SEARCH","CENTRAL_SCHEME_SEARCH","PROFILE_BASED_RECOMMENDATION","SCHEME_COMPARISON"}: answer_text="\n\n".join(_format(s,"SCHEME_INFORMATION") for s in records)
 else: answer_text=_format(records[0],intent.name)
 return {"answer":answer_text,"schemes":records,"verification_note":"Facts and links are limited to verified catalogue records.","intent":intent.name,"context_scheme_id":records[0].id}
