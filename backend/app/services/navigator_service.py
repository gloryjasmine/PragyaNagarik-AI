def guide(scheme_id: str):
    return {"scheme_id":scheme_id,"official_only":True,"steps":[
      {"id":"open","step_number":1,"title":"Open the official portal","instruction":"Tap Open official portal below. Check that the web address matches the official source.","screenshot_url":None,"highlight_x":20,"highlight_y":20,"highlight_width":60,"highlight_height":12},
      {"id":"find","step_number":2,"title":"Find the relevant service","instruction":"Use the portal's official menu or search. The exact labels can change, so follow the live portal.","screenshot_url":None,"highlight_x":15,"highlight_y":25,"highlight_width":70,"highlight_height":12},
      {"id":"review","step_number":3,"title":"Review before submitting","instruction":"Read the current eligibility, documents and declaration on the official page before sharing information.","screenshot_url":None,"highlight_x":15,"highlight_y":65,"highlight_width":70,"highlight_height":15}
    ]}
