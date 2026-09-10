from app.schemas.scheme import Profile
from app.services.scheme_service import get_scheme
from app.services.eligibility_service import evaluate
def test_farmer_match():
    r=evaluate(get_scheme("pmkisan"),Profile(occupation="Farmer"))
    assert r['status']=="Eligible"
