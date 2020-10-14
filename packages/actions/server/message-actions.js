/**
 *
 * Reldens - MessageActions
 *
 * Server side messages actions.
 *
 */

const { Logger, EventsManager, sc } = require('@reldens/utils');
const { GameConst } = require('../../game/constants');
const { ActionsConst } = require('../../actions/constants');
const { ObjectsConst } = require('../../objects/constants');

class ActionsMessageActions
{

    parseMessageAndRunActions(client, data, room, playerSchema)
    {
        if(data.act === GameConst.ACTION && data.target){
            let validTarget = this.validateTarget(data.target, room);
            if(validTarget){
                let currentAction = this.preparePlayerCurrentAction(playerSchema, data);
                if(!currentAction){
                    return false;
                }
                // run skill validations (range, time, conditions, etc):
                if(!currentAction.validateRange(validTarget) || !currentAction.validate()){
                    return false;
                }
                // set the room:
                currentAction.room = room;
                EventsManager.emit('reldens.onMessageRunAction', data, playerSchema, validTarget, room)
                    .catch((err) => {
                        Logger.error(['Listener error on onMessageRunAction:', err]);
                    });
            }
        }
    }

    preparePlayerCurrentAction(playerSchema, data)
    {
        let runAction = data.type;
        // @TODO: temporal default action, we will always send the action type so it will never be "action".
        if(data.type === 'action'){
            // for pvp or pve the default action will be the attack-short:
            runAction = 'attackShort';
        }
        if(
            !runAction ||
            (
                // @TODO: remove .actions and use skills?
                !sc.hasOwn(playerSchema.actions, runAction)
                && !sc.hasOwn(playerSchema.skillsServer.classPath.currentSkills, runAction)
            )
        ){
            Logger.error(['Action not available:', runAction]);
            return false;
        }
        playerSchema.currentAction = runAction;
        return playerSchema.actions[runAction] ?
            playerSchema.actions[runAction] : playerSchema.skillsServer.classPath.currentSkills[runAction];
    }

    validateTarget(target, room)
    {
        let validTarget = false;
        if(target.type === GameConst.TYPE_PLAYER){
            validTarget = room.getPlayerFromState(target.id);
        }
        if(target.type === ObjectsConst.TYPE_OBJECT){
            validTarget = room.objectsManager.roomObjects[target.id];
        }
        if(target.type === ActionsConst.TARGET_POSITION){
            validTarget = target;
        }
        return validTarget;
    }

}

module.exports.ActionsMessageActions = new ActionsMessageActions();