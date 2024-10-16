# MLD

# Infos  
[nf18](https://nf18.ens.utc.fr/cours/03Drel2-umlr_web/co/rel2.html)  

# Utilisateurs  
Users(#id:int, email:String, lname:String, fname:String, password:String, telephone:String, creationDate:Date, status:bool, role=>Role:int, organisation=>Organisation:long)  
Role(#id:int, role:String)  

# Organisation  
Organisation(#siren:long, name:String, typeOrg=>TypeOrg:int, address:String)  
TypeOrg(#id:int, type:String)

# Fiche de Poste - Offres d'emploi
JobSheet(#id:int, title:String, status=>Status:int, manager:String, jobType=>jobType:int, location:String, rythme:String, salary:int, description:String, organisation=>Organisation:long)  
Status(#id:int, status:string)  
JobType(#id:int, jobType:String)  
JobOffer(#number:int, jobSheet=>JobSheet:int, state:String, endDate:Date, requestedDocuments:String, nbDocuments:int)  

# Candidatures
Application(#user=>Users:int, #jobOffer=>JobOffer:int, date:Date)
Piece(#id:int, application=>Application, data:binary)  
