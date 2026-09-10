"""Read-only, official-source nationwide catalogue."""
from app.schemas.scheme import Scheme

OFFICIAL_DIRECTORY = "https://www.india.gov.in/services/state"
VERIFIED_ON = "2026-09-10"
JURISDICTIONS = [
    ("Andhra Pradesh", "STATE"), ("Arunachal Pradesh", "STATE"), ("Assam", "STATE"), ("Bihar", "STATE"), ("Chhattisgarh", "STATE"), ("Goa", "STATE"), ("Gujarat", "STATE"), ("Haryana", "STATE"), ("Himachal Pradesh", "STATE"), ("Jharkhand", "STATE"), ("Karnataka", "STATE"), ("Kerala", "STATE"), ("Madhya Pradesh", "STATE"), ("Maharashtra", "STATE"), ("Manipur", "STATE"), ("Meghalaya", "STATE"), ("Mizoram", "STATE"), ("Nagaland", "STATE"), ("Odisha", "STATE"), ("Punjab", "STATE"), ("Rajasthan", "STATE"), ("Sikkim", "STATE"), ("Tamil Nadu", "STATE"), ("Telangana", "STATE"), ("Tripura", "STATE"), ("Uttar Pradesh", "STATE"), ("Uttarakhand", "STATE"), ("West Bengal", "STATE"),
    ("Andaman and Nicobar Islands", "UT"), ("Chandigarh", "UT"), ("Dadra and Nagar Haveli and Daman and Diu", "UT"), ("Delhi", "UT"), ("Jammu and Kashmir", "UT"), ("Ladakh", "UT"), ("Lakshadweep", "UT"), ("Puducherry", "UT"),
]

CENTRAL = [
    Scheme(id="nsp", name="National Scholarship Portal", description="Official portal for participating scholarship schemes; individual eligibility and documents vary by scholarship.", category="Education", benefits=["Scholarship discovery", "Official applications"], eligibility={"occupations":["Student"]}, official_url="https://scholarships.gov.in/", application_url="https://scholarships.gov.in/", department="Ministry of Education", verification_status="OFFICIAL_SOURCE", last_verified_date=VERIFIED_ON),
    Scheme(id="pmkisan", name="PM-KISAN", description="Income support scheme for eligible landholding farmer families. Check current conditions on the official portal.", category="Agriculture", benefits=["Income support"], eligibility={"occupations":["Farmer"]}, official_url="https://pmkisan.gov.in/", application_url="https://pmkisan.gov.in/", department="Ministry of Agriculture and Farmers Welfare", verification_status="OFFICIAL_SOURCE", last_verified_date=VERIFIED_ON),
    Scheme(id="pmay", name="Pradhan Mantri Awas Yojana", description="Housing assistance programme. Component eligibility and documents are maintained on the official portal.", category="Housing", benefits=["Housing assistance"], eligibility={}, official_url="https://pmaymis.gov.in/", application_url="https://pmaymis.gov.in/", department="Ministry of Housing and Urban Affairs", verification_status="OFFICIAL_SOURCE", last_verified_date=VERIFIED_ON),
    Scheme(id="mudra", name="Pradhan Mantri MUDRA Yojana", description="Credit support through eligible lending institutions for micro enterprises.", category="Entrepreneurship", benefits=["Business credit"], eligibility={"occupations":["Entrepreneur", "Worker"]}, official_url="https://www.mudra.org.in/", application_url="https://www.mudra.org.in/", department="Ministry of Finance", verification_status="OFFICIAL_SOURCE", last_verified_date=VERIFIED_ON),
    Scheme(id="digilocker", name="DigiLocker", description="Official digital document wallet service of the Government of India.", category="Digital services", benefits=["Digital document access"], eligibility={}, official_url="https://www.digilocker.gov.in/", application_url="https://www.digilocker.gov.in/", department="Ministry of Electronics and Information Technology", scheme_service_type="SERVICE", verification_status="OFFICIAL_SOURCE", last_verified_date=VERIFIED_ON),
]

def _jurisdiction_directories():
    """Verified discovery record per State/UT; never claims unverified programme facts."""
    return [Scheme(id=f"directory-{name.lower().replace(' and ','-').replace(' ','-')}", name=f"{name} government services directory", description=f"Official National Portal discovery entry for {name} government services. Individual service details must be checked on the linked official source.", category="Government services", benefits=["Official service discovery"], eligibility={}, official_url=OFFICIAL_DIRECTORY, application_url=None, state=name, state_ut=name, government_level=level, scheme_service_type="SERVICE", department="National Portal of India (NIC)", verification_status="OFFICIAL_SOURCE", last_verified_date=VERIFIED_ON) for name, level in JURISDICTIONS]

SCHEMES = CENTRAL + _jurisdiction_directories()

def search(query="", government_level=None, state_ut=None, category=None, scheme_service_type=None):
    q = query.casefold().strip()
    def matches(s):
        text = " ".join([s.name, s.description, s.category, s.state_ut or "", s.department or ""]).casefold()
        return (not q or q in text) and (not government_level or s.government_level == government_level.upper()) and (not state_ut or (s.state_ut or "").casefold() == state_ut.casefold()) and (not category or s.category.casefold() == category.casefold()) and (not scheme_service_type or s.scheme_service_type == scheme_service_type.upper()) and s.is_active
    return [s for s in SCHEMES if matches(s)]

def get_scheme(scheme_id): return next((s for s in SCHEMES if s.id == scheme_id and s.is_active), None)

def filters():
    return {"government_levels":["CENTRAL","STATE","UT"],"scheme_service_types":["SCHEME","SERVICE"],"state_uts":[{"name":name,"government_level":level} for name,level in JURISDICTIONS],"categories":sorted({s.category for s in SCHEMES})}
