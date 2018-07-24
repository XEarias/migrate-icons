const services = require ("./services.js");

const getTagsNoun = services.getTagsNoun;
const getIconSVG = services.getIconSVG;
const getIds = services.getIds;
const getOrCreateTag = services.getOrCreateTag;
const getOrCreateIcon = services.getOrCreateIcon;
const createRelationship = services.createRelationship;

(async ()=>{
    
    let continuar = true;
    let offset = 0

    while(continuar){

        try{

            let idsIcons = await getIds(offset);

            for (idsIcon of idsIcons){
                
                try {
                    let nounId = idsIcon.nounId;
                    let internalId = idsIcon.internalId;
                    
                    let tags = await getTagsNoun(nounId);

                    let svg = await getIconSVG(internalId);

                    let icon = {
                        tags: tags,
                        svg: svg
                    }

                    //creamos el icono
                    iconId = await getOrCreateIcon(nounId);

                    for (tag of icon.tags){
                        
                        try {
                            
                            let tagId = await getOrCreateTag(tag);
                            let relCreated = await createRelationship(iconId, tagId);

                        } catch(e) {
                            console.log(e);
                        }

                    }

                } catch(e){
                    console.log(e);
                }
            }
           
        } catch (e){
            console.log(e)
            break;
           
        } finally {
            offset += limit; 
            
        }

       
    }

   
})()