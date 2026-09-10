from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.scheme import Profile
from app.services import scheme_service
from app.services.recommendation_service import recommend
from app.services.eligibility_service import evaluate
from app.services.navigator_service import guide
from app.ai.orchestrator import answer

app=FastAPI(title="PRAGYANAGARIK AI API",version="1.0.0")
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:3000","http://localhost:8081"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
def ok(data, message="Success"): return {"success":True,"data":data,"message":message}
@app.get("/health")
def health(): return ok({"status":"healthy"})
@app.get("/api/schemes")
def schemes(q:str="", government_level:str|None=None, state_ut:str|None=None, category:str|None=None, scheme_service_type:str|None=None):
 return ok(scheme_service.search(q, government_level, state_ut, category, scheme_service_type))
@app.get("/api/catalogue/filters")
def catalogue_filters(): return ok(scheme_service.filters())
@app.get("/api/schemes/{scheme_id}")
def scheme(scheme_id:str):
 s=scheme_service.get_scheme(scheme_id)
 if not s: raise HTTPException(404,"Scheme not found")
 return ok(s)
@app.post("/api/recommendations")
def recommendations(profile:Profile): return ok(recommend(profile))
@app.post("/api/eligibility/{scheme_id}")
def eligibility(scheme_id:str,profile:Profile):
 s=scheme_service.get_scheme(scheme_id)
 if not s: raise HTTPException(404,"Scheme not found")
 return ok(evaluate(s,profile))
@app.get("/api/navigator/{scheme_id}")
def navigator(scheme_id:str): return ok(guide(scheme_id))
@app.post("/api/copilot/chat")
def chat(payload:dict): return ok(answer(payload.get("message",""),Profile(**payload.get("profile",{})),payload.get("history",[])))
