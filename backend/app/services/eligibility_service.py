from app.schemas.scheme import Profile, Scheme

def evaluate(scheme: Scheme, profile: Profile):
    rules, matched, failed, missing = scheme.eligibility, [], [], []
    checks = [("state", profile.state), ("occupation", profile.occupation), ("age", profile.age), ("annual_income", profile.annual_income), ("category", profile.category)]
    for key, value in checks:
        if key not in rules: continue
        if value is None: missing.append(key.replace('_',' ')); continue
        rule = rules[key]
        ok = value in rule if isinstance(rule, list) else (value <= rule if key == "annual_income" else value == rule)
        (matched if ok else failed).append(key.replace('_',' '))
    score = max(0, round(100 * len(matched) / max(1, len(matched)+len(failed)+len(missing))))
    return {"status":"Eligible" if not failed else "Needs review", "score":score, "matched_conditions":matched, "failed_conditions":failed, "missing_information":missing, "required_documents":scheme.documents, "explanation":"This is an assistive match, not an approval. Verify every condition with the official source."}
