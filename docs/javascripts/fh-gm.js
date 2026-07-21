(function () {
  "use strict";

  var API = "https://fh-builds.noirchicot.workers.dev";
  var root = document;
  var state = {campaigns:[],builds:[],busy:false};

  function byId(id) { return root.getElementById(id); }
  function safe(value) { return String(value == null ? "" : value).replace(/[&<>\"]/g,function(char){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char];}); }
  function campaignCode(value) { return String(value || "").trim().toUpperCase(); }
  function validCampaign(code) { return /^[A-Z0-9-]{2,24}$/.test(code); }
  function setNote(id,kind,message) { var element=byId(id);if(!element)return;element.className="note "+(kind||"");element.textContent=message||""; }
  function setWorkerStatus(kind,text) { var element=byId("workerStatus");if(!element)return;element.className="worker-status is-"+(kind||"idle");element.textContent=text||"Not connected"; }
  function endpointHelp(error) {
    if(error&&[404,405,501].indexOf(error.status)>=0)return "The deployed Worker is missing this admin endpoint. Apply WORKER-ADMIN-API.md, then redeploy it.";
    if(error&&error.status===409)return error.message||"This campaign or character already exists.";
    return error&&error.message||"Request failed.";
  }
  function token() { return byId("token").value.trim(); }
  function canonicalDdbUrl(raw) {
    var text=String(raw||"").trim();
    if(/^\d+$/.test(text))return "https://www.dndbeyond.com/characters/"+text;
    var url,match;
    try{url=new URL(text);match=url.pathname.match(/(?:^|\/)characters\/(\d+)(?:\/|$)/i);}catch(error){throw new Error("Paste a public HTTPS D&D Beyond character URL or numeric ID.");}
    if(url.protocol!=="https:"||url.hostname.replace(/^www\./,"").toLowerCase()!=="dndbeyond.com"||!match)throw new Error("Paste a public HTTPS D&D Beyond character URL or numeric ID.");
    return "https://www.dndbeyond.com/characters/"+match[1];
  }
  function routeCampaign() { try{return campaignCode(new URL(window.location.href).searchParams.get("campaign"));}catch(error){return "";} }
  function playerUrl(code,pseudo) { var url=new URL("player/",window.location.href);url.searchParams.set("campaign",code);url.searchParams.set("character",pseudo);return url.href; }

  async function gmApi(path,options) {
    options=options||{};
    var auth=token();
    if(!auth){var missing=new Error("Paste the GM token first.");missing.status=401;throw missing;}
    var controller=typeof AbortController!=="undefined"?new AbortController():null;
    var timeout=controller?setTimeout(function(){controller.abort();},45000):null;
    var headers=Object.assign({Authorization:"Bearer "+auth},options.body?{"Content-Type":"application/json"}:{},options.headers||{});
    try{
      var response=await fetch(API+path,Object.assign({},options,{headers:headers,signal:controller&&controller.signal}));
      var data=await response.json().catch(function(){return {};});
      if(!response.ok){var message=response.status===401?"unauthorized — check the GM token.":data.error||("HTTP "+response.status);var error=new Error(message);error.status=response.status;throw error;}
      return data;
    } catch(error) {
      if(error&&error.name==="AbortError"){var timedOut=new Error("The Worker did not answer within 45 seconds.");timedOut.status=504;throw timedOut;}
      throw error;
    } finally { if(timeout)clearTimeout(timeout); }
  }
  function gmPost(path,body) { return gmApi(path,{method:"POST",body:JSON.stringify(body||{})}); }
  function gmDelete(path) { return gmApi(path,{method:"DELETE"}); }

  function setCampaign(code,refresh) {
    code=campaignCode(code);
    ["campaign","importCampaign","lootCode"].forEach(function(id){var input=byId(id);if(input)input.value=code;});
    try{localStorage.setItem("fh-gm-campaign",code);localStorage.setItem("fh-gm-lootcode",code);}catch(error){}
    renderCampaigns(state.campaigns);
    if(refresh)refreshGm();
  }
  function renderCampaigns(campaigns) {
    state.campaigns=Array.isArray(campaigns)?campaigns:[];
    var selected=campaignCode(byId("campaign").value),list=byId("campaignList");
    list.innerHTML=state.campaigns.length?state.campaigns.map(function(campaign){var code=campaignCode(campaign.code);return "<span class=\"campaign-chip "+(code===selected?"is-selected":"")+"\"><button type=\"button\" class=\"campaign-select\" data-select-campaign=\""+safe(code)+"\"><b>"+safe(code)+"</b>"+(campaign.name?" <span>"+safe(campaign.name)+"</span>":"")+(campaign.characters!=null?" <small>"+Number(campaign.characters)+" PC</small>":"")+"</button><button type=\"button\" data-delete-campaign=\""+safe(code)+"\" aria-label=\"Delete "+safe(code)+"\">×</button></span>";}).join(""):"<span class=\"empty\">No campaigns yet.</span>";
  }
  function renderBuilds(builds,campaign) {
    state.builds=(Array.isArray(builds)?builds:[]).slice().sort(function(a,b){return String(b.updatedAt||"").localeCompare(String(a.updatedAt||""));});
    byId("characterHeading").textContent=campaign?"Campaign characters · "+campaign:"Campaign characters";
    byId("list").innerHTML=state.builds.length?"<table><tr><th>Player</th><th>Campaign</th><th>Last synced</th><th></th></tr>"+state.builds.map(function(build){var code=campaignCode(build.campaign),pseudo=String(build.pseudo||"");return "<tr><td class=\"nm\">"+safe(pseudo)+"</td><td>"+safe(code)+"</td><td class=\"dt\">"+safe(String(build.updatedAt||"").slice(0,16).replace("T"," "))+"</td><td class=\"actions\"><a class=\"btn ghost small\" data-open-player href=\""+safe(playerUrl(code,pseudo))+"\">Open sheet</a><button class=\"btn ghost small\" data-sync-player data-campaign=\""+safe(code)+"\" data-pseudo=\""+safe(pseudo)+"\">Sync DDB</button><button class=\"btn ghost small\" data-download data-campaign=\""+safe(code)+"\" data-pseudo=\""+safe(pseudo)+"\">Download</button><button class=\"btn danger small\" data-delete-player data-campaign=\""+safe(code)+"\" data-pseudo=\""+safe(pseudo)+"\">Delete</button></td></tr>";}).join("")+"</table>":"<div class=\"empty\">No characters"+(campaign?" for campaign “"+safe(campaign)+"”":"")+" yet.</div>";
  }

  async function refreshGm() {
    var button=byId("refresh"),campaign=campaignCode(byId("campaign").value);
    if(!token()){setWorkerStatus("idle","Token required");setNote("note","err","Paste the GM token first.");return;}
    button.disabled=true;setWorkerStatus("busy","Connecting…");setNote("note","","Loading characters and campaigns…");
    try{
      var buildData=await gmApi("/builds"+(campaign?"?campaign="+encodeURIComponent(campaign):""));
      renderBuilds(buildData.builds||[],campaign);
      try{
        var campaignData=await gmApi("/admin/campaigns");
        renderCampaigns(campaignData.campaigns||[]);setNote("campaignNote","ok","✓ "+(campaignData.campaigns||[]).length+" campaign(s)." );setWorkerStatus("ok","Worker connected");
        var warning=byId("workerNote");if(warning)warning.hidden=true;
      } catch(adminError) {
        var fallback=[];(buildData.builds||[]).forEach(function(build){var code=campaignCode(build.campaign);if(code&&!fallback.some(function(item){return item.code===code;}))fallback.push({code:code});});renderCampaigns(fallback);setNote("campaignNote","err",endpointHelp(adminError));setWorkerStatus("warn","Admin upgrade needed");
        var note=byId("workerNote");if(note)note.hidden=false;
      }
      try{localStorage.setItem("fh-gm-token",token());localStorage.setItem("fh-gm-campaign",campaign);}catch(error){}
      setNote("note","ok","✓ "+(buildData.builds||[]).length+" character(s)"+(campaign?" — campaign “"+campaign+"”":"")+"." );
    } catch(error) {
      setWorkerStatus(error&&error.status===401?"bad":"warn",error&&error.status===401?"Unauthorized":"Worker error");setNote("note","err","Could not list: "+endpointHelp(error));
    } finally { button.disabled=false; }
  }
  async function createCampaign() {
    var code=campaignCode(byId("newCampaignCode").value),name=byId("newCampaignName").value.trim(),button=byId("campaignAdd");
    if(!validCampaign(code)){setNote("campaignNote","err","Use 2–24 letters, numbers or hyphens.");return;}
    button.disabled=true;
    try{await gmPost("/admin/campaigns",{code:code,name:name});setCampaign(code,false);byId("newCampaignCode").value="";byId("newCampaignName").value="";setNote("campaignNote","ok","✓ Campaign "+code+" created.");await refreshGm();}
    catch(error){setNote("campaignNote","err",endpointHelp(error));}finally{button.disabled=false;}
  }
  async function importCharacter() {
    var code=campaignCode(byId("importCampaign").value),pseudo=byId("importPseudo").value.trim(),button=byId("importCharacter"),shareUrl;
    if(!validCampaign(code)){setNote("importNote","err","Choose a valid campaign code first.");return;}
    try{shareUrl=canonicalDdbUrl(byId("importUrl").value);}catch(error){setNote("importNote","err",error.message);return;}
    button.disabled=true;setNote("importNote","","Pulling and validating D&D Beyond…");
    try{var data=await gmPost("/admin/campaigns/"+encodeURIComponent(code)+"/characters/import",{shareUrl:shareUrl,pseudo:pseudo||undefined});var imported=data.pseudo||pseudo||"Character";setNote("importNote","ok","✓ "+imported+" imported into "+code+".");byId("importUrl").value="";byId("importPseudo").value="";setCampaign(code,false);await refreshGm();}
    catch(error){setNote("importNote","err",endpointHelp(error));}finally{button.disabled=false;}
  }
  async function addLoot() {
    var code=campaignCode(byId("lootCode").value),name=byId("lootName").value.trim(),button=byId("lootAdd");
    if(!validCampaign(code)){setNote("lootNote2","err","Choose a valid campaign code first.");return;}if(!name){setNote("lootNote2","err","Item name required.");return;}
    button.disabled=true;
    try{var response=await fetch(API+"/inv/"+encodeURIComponent(code),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name,qty:Number(byId("lootQty").value)||1,note:byId("lootNote").value.trim()})}),data=await response.json().catch(function(){return {};});if(!response.ok){var error=new Error(response.status===403?"unknown campaign code.":data.error||("HTTP "+response.status));error.status=response.status;throw error;}setCampaign(code,false);setNote("lootNote2","ok","✓ “"+data.item.name+"”"+(data.item.qty>1?" ×"+data.item.qty:"")+" added to "+code+".");byId("lootName").value="";byId("lootQty").value="1";byId("lootNote").value="";}
    catch(error){setNote("lootNote2","err","Could not add: "+error.message);}finally{button.disabled=false;}
  }
  async function deleteCampaign(code,button) {
    if(!window.confirm("Delete campaign "+code+", its characters, profiles and inventory? This cannot be undone."))return;
    button.disabled=true;try{await gmDelete("/admin/campaigns/"+encodeURIComponent(code));if(campaignCode(byId("campaign").value)===code)setCampaign("",false);setNote("campaignNote","ok","✓ Campaign "+code+" deleted.");await refreshGm();}catch(error){setNote("campaignNote","err",endpointHelp(error));}finally{button.disabled=false;}
  }
  async function characterAction(button) {
    var code=campaignCode(button.dataset.campaign),pseudo=button.dataset.pseudo;if(!code||!pseudo)return;
    button.disabled=true;var old=button.textContent;button.textContent="…";
    try{
      if(button.dataset.download!==undefined){var record=await gmApi("/builds/"+encodeURIComponent(code)+"/"+encodeURIComponent(pseudo)),blob=new Blob([JSON.stringify(record.build,null,2)],{type:"application/json"}),anchor=root.createElement("a");anchor.href=URL.createObjectURL(blob);anchor.download=pseudo.replace(/[^\w-]+/g,"_")+".fh.json";anchor.click();URL.revokeObjectURL(anchor.href);setNote("note","ok","✓ Downloaded “"+pseudo+"” ("+code+").");}
      else if(button.dataset.syncPlayer!==undefined){setNote("note","","Syncing "+pseudo+" from D&D Beyond…");await gmPost("/admin/campaigns/"+encodeURIComponent(code)+"/characters/"+encodeURIComponent(pseudo)+"/pull",{});setNote("note","ok","✓ "+pseudo+" refreshed from D&D Beyond.");await refreshGm();}
      else if(button.dataset.deletePlayer!==undefined){if(!window.confirm("Remove "+pseudo+" from campaign "+code+"?"))return;await gmDelete("/admin/campaigns/"+encodeURIComponent(code)+"/characters/"+encodeURIComponent(pseudo));setNote("note","ok","✓ "+pseudo+" removed from "+code+".");await refreshGm();}
    } catch(error){setNote("note","err",endpointHelp(error));}finally{button.disabled=false;button.textContent=old;}
  }
  function handleCampaignClick(event) { var select=event.target.closest("[data-select-campaign]");if(select){setCampaign(select.dataset.selectCampaign,true);return;}var remove=event.target.closest("[data-delete-campaign]");if(remove)deleteCampaign(campaignCode(remove.dataset.deleteCampaign),remove); }
  function handleCharacterClick(event) { var button=event.target.closest("button");if(button)characterAction(button); }
  function uppercaseInput(event) { event.target.value=campaignCode(event.target.value); }
  function init() {
    var storedCampaign="",storedToken="";try{storedCampaign=localStorage.getItem("fh-gm-campaign")||"";storedToken=localStorage.getItem("fh-gm-token")||"";}catch(error){}
    byId("token").value=storedToken;setCampaign(routeCampaign()||storedCampaign,false);
    byId("refresh").addEventListener("click",refreshGm);byId("campaignAdd").addEventListener("click",createCampaign);byId("importCharacter").addEventListener("click",importCharacter);byId("lootAdd").addEventListener("click",addLoot);byId("campaignList").addEventListener("click",handleCampaignClick);byId("list").addEventListener("click",handleCharacterClick);
    byId("token").addEventListener("keydown",function(event){if(event.key==="Enter")refreshGm();});byId("campaign").addEventListener("keydown",function(event){if(event.key==="Enter")refreshGm();});
    ["campaign","newCampaignCode","importCampaign","lootCode"].forEach(function(id){byId(id).addEventListener("input",uppercaseInput);});
    if(storedToken)setTimeout(refreshGm,0);
  }

  if(typeof globalThis!=="undefined")globalThis.__fhGm={state:state,canonicalDdbUrl:canonicalDdbUrl,campaignCode:campaignCode,playerUrl:playerUrl,renderCampaigns:renderCampaigns,renderBuilds:renderBuilds,refreshGm:refreshGm,createCampaign:createCampaign,importCharacter:importCharacter,addLoot:addLoot,characterAction:characterAction};
  if(root.readyState==="loading")root.addEventListener("DOMContentLoaded",init);else init();
})();
