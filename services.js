

const NounProject = require('the-noun-project');
const mysql = require('mysql');
const config = require("./config.json");

np = new NounProject(config.noun);

const limit = 5;

const conn1 = mysql.createConnection(config.conn1);

const conn2 = mysql.createConnection(config.conn2);

const connFinal =  mysql.createConnection(config.conn3);

//funcion para obtener un icono de nounproject
const getIconNoun = (id) => {

    let iconPromise = new Promise((resolve, reject) => {
        np.getIconById(id, (err, data) => {

            if(err) {
                reject(err);
                return;
            };
            resolve(data);
        });
    });

    return iconPromise;

}

//funcion para obtener tags de nounProject
const getTagsNoun = (nounId) => {
    let iconWithTagsPromise = new Promise(async (resolve, reject) => {
        try {

            let iconPromise = await getIconNoun(nounId);
            let iconUrl = iconPromise.icon.icon_url;

            let newIcon = ((tagsJSON) => {

                let tags = [];

                for(tagJSON of tagsJSON){
                    tags.push(tagJSON.slug);
                }

                return tags;

            })(iconPromise.icon.tags)

            resolve(newIcon)

        } catch(e){
            reject(e);
        }
    })

    return iconWithTagsPromise;
}

//obtener svg de la base de datos interna
const getIconSVG = (interalId) => {

    let connectPromise = new Promise((resolve, reject) => {

        conn2.query("SELECT svg FROM elementos WHERE elementos.tipo = 'ICONO' AND elementos.idElemento = ?", [interalId] ,  (error, results, fields) => {
            
            if (error) {
                reject(error);
                return;
            }
            
            if(!results.length){
                reject("Without Results");
                return;
            }

            let svg = results[0].svg;

            resolve(svg);
            
        });

    })

    return connectPromise;
}

//obtener ids de la base de datos intermedia
const getIds = (offset) => {

    let connectPromise = new Promise((resolve, reject) => {

        conn2.query('SELECT nounId, disenadorId AS internalId FROM icons_uploads LIMIT ? OFFSET ?', [limit, offset] ,  (error, results, fields) => {
            
            if (error) {
                reject(error);
                return;
            }
            
            if(!results.length){
                reject("Without Results");
                return;
            }

            //let idIcons = results.map((result) => result.nounId);

            resolve(results)
            
        });

    })

    return connectPromise;
}

//obtener id de tag si existe
const getTag = (tag) => {

    let selectPromise = new Promise((resolve, reject) => {

        connFinal.query('SELECT id FROM tags WHERE valor = ?', [tag] ,  (error, results, fields) => {
            
            if (error) {
                reject(error);
                return;
            }
            
            if(!results.length){
                reject("tag no result");
                return;
            }

            resolve(results.id)
            
        });

    })

    return selectPromise;

}

//crear la tag
const createTag = (tag) => {

    let createPromise = new Promise((resolve, reject) => {

        connFinal.query('INSERT INTO tags (valor) VALUES ?', {valor: tag} ,  (error, results, fields) => {
                    
            if (error) {
                reject(error);
                return;
            }
           
            resolve(results.insertId)
            
        });
    })

    return createPromise;

}

//crear u obtener id de la tag
const getOrCreateTag = (tag) => {

        let principalPromise = new Promise( async (resolve, reject) => {
            
            try {

                let selectedTagId = await getTag(tag);
                resolve(selectedTagId);
            
            } catch (e) {

                if(e != "tag no result"){
                    reject(e)
                    return;  
                } 

                try {
                    
                    let createdTagId = await createTag(tag);
                    resolve(createdTagId);

                } catch(e) {
                    reject(e)
                }  

            }
        })

        return principalPromise;

}

//obtener id de icono si existe
const getIcon = (nounId) => {

    let selectPromise = new Promise((resolve, reject) => {

        connFinal.query('SELECT id FROM iconos WHERE nounId = ?', [nounId] ,  (error, results, fields) => {
            
            if (error) {
                reject(error);
                return;
            }
            
            if(!results.length){
                reject("icon no result");
                return;
            }

            resolve(results.id)
            
        });

    })

    return selectPromise;

}

//crear el icono
const createIcon = (svg, nounId) => {

    let createPromise = new Promise((resolve, reject) => {

        connFinal.query('INSERT INTO iconos (svg, nounId) VALUES (?,?)', [svg, nounId] ,  (error, results, fields) => {
                    
            if (error) {
                reject(error);
                return;
            }
           
            resolve(results.insertId) 
        });
    })

    return createPromise;

}

//crear u obtener id del icono
const getOrCreateIcon = (svg, nounId) => {

    let principalPromise = new Promise( async (resolve, reject) => {
            
        try {

            let selectedIconId = await getIcon(nounId);
            resolve(selectedIconId);
        
        } catch (e) {

            if(e != "icon no result"){
                reject(e)
                return;  
            } 

            try {
                
                let createdIconId = await createIcon(svg, nounId);
                resolve(createdIconId);

            } catch(e) {
                reject(e)
            }  

        }
    })

    return principalPromise;

}

const createRelationship = (idIcon, idTag) => {

    let createPromise = new Promise((resolve, reject) => {

        connFinal.query('INSERT INTO iconos_has_tags (iconos_id, tags_id) VALUES (?, ?)', [idIcon, idTag] ,  (error, results, fields) => {
                    
            if (error) {
                reject(error);
                return;
            }
           
            resolve(results.insertId)
            
        });
    })

    return createPromise;


}


module.exports = {
    getTagsNoun: getTagsNoun,
    getIconSVG: getIconSVG, 
    getIds: getIds,
    getOrCreateTag: getOrCreateTag,
    getOrCreateIcon: getOrCreateIcon,
    createRelationship: createRelationship
}
