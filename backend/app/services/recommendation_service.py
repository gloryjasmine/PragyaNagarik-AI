from app.schemas.scheme import Profile
from app.services.scheme_service import SCHEMES
from app.services.eligibility_service import evaluate
def recommend(profile: Profile):
    results=[]
    for scheme in SCHEMES:
        result=evaluate(scheme, profile)
        relevance=result['score']
        if profile.occupation and profile.occupation in scheme.eligibility.get('occupations',[]): relevance=max(relevance, 80)
        results.append({"scheme":scheme, "match_score":relevance, "why":[f"Your {m} matches the available scheme rule." for m in result['matched_conditions']] or ["This scheme may be relevant to your situation; check the official criteria."], "eligibility":result})
    return sorted(results,key=lambda x:x['match_score'],reverse=True)
