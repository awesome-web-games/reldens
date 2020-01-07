/**
 *
 * Reldens - Respawn Area
 *
 * This will generate and activate the respawn areas.
 *
 */

const { RespawnModel } = require('./model');

class RespawnArea
{

    constructor(layer, world)
    {
        this.layer = layer;
        this.world = world;
        this.instancesCreated = {};
    }

    async activateObjectsRespawn()
    {
        this.parseMapForRespawnTiles();
        this.layerObjects = this.world.objectsManager.roomObjectsByLayer[this.layer.name];
        this.respawnAreas = await RespawnModel.query().where('layer', this.layer.name);
        for(let idx in this.respawnAreas){
            let respawnArea = this.respawnAreas[idx];
            if(
                {}.hasOwnProperty.call(this.layerObjects, respawnArea.object_id)
                && {}.hasOwnProperty.call(this.layerObjects[respawnArea.object_id], 'respawn')
            ){
                let multipleObj = this.layerObjects[respawnArea.object_id];
                let objClass = multipleObj.classInstance;
                let {tilewidth, tileheight } = this.world.mapJson;
                for(let qty=0; qty < respawnArea.instances_limit; qty++){
                    // prepare to save the object:
                    if(!{}.hasOwnProperty.call(this.instancesCreated, respawnArea.id)){
                        this.instancesCreated[respawnArea.id] = [];
                    }
                    // create object index:
                    let objectIndex = this.layer.name + '-' + respawnArea.id + '-' + (this.instancesCreated[respawnArea.id].length);
                    multipleObj.objProps.client_key = objectIndex;
                    // multipleObj.objProps.clientParams.key = objectIndex;
                    // get random tile:
                    let randomTileIndex = this.respawnTiles[Math.floor(Math.random() * this.respawnTiles.length)];
                    let tileData = this.respawnTilesData[randomTileIndex];
                    // add tile data to the object and create object instance:
                    Object.assign(multipleObj.objProps, tileData);
                    let objInstance = new objClass(multipleObj.objProps);
                    let assetsArr = [];
                    for(let assetData of multipleObj.objProps.objects_assets){
                        assetsArr.push(assetData.asset_key);
                        break; // @TODO: TEMP.
                    }
                    objInstance.clientParams.asset_key = assetsArr[0];
                    objInstance.clientParams.enabled = true;
                    // objInstance.clientParams.key = objectIndex;
                    this.instancesCreated[respawnArea.id].push(objInstance);
                    this.world.objectsManager.objectsAnimationsData[objectIndex] = objInstance.clientParams;
                    this.world.objectsManager.roomObjectsById[objectIndex] = objInstance;
                    let { x, y } = tileData;
                    this.world.createWorldObject(objInstance, objectIndex, tilewidth, tileheight, x, y);
                }
            }
        }
    }

    parseMapForRespawnTiles()
    {
        let layerData = this.layer.data;
        this.respawnTiles = [];
        this.respawnTilesData = {};
        let mapW = this.world.mapJson.width,
            mapH = this.world.mapJson.height,
            tileW = this.world.mapJson.tilewidth,
            tileH = this.world.mapJson.tileheight;
        for(let c = 0; c < mapW; c++){
            let posX = c * tileW + (tileW/2);
            for(let r = 0; r < mapH; r++){
                // position in pixels:
                let posY = r * tileH + (tileH/2);
                let tileIndex = r * mapW + c;
                let tile = layerData[tileIndex];
                // if tile is not zero then it's available for respawn:
                if(tile !== 0){
                    this.respawnTiles.push(tileIndex);
                    this.respawnTilesData[tileIndex] = {x: posX, y: posY, tile: tile, tile_index: tileIndex};
                }
            }
        }
    }

}

module.exports.RespawnArea = RespawnArea;
