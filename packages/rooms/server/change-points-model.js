/**
 *
 * Reldens - RoomsChangePointsModel
 *
 * Rooms Change Points storage model, this class will load, add, edit, delete the values in the storage.
 *
 */

const { Model } = require('objection');
const { RoomsModel } = require('./model');

class RoomsChangePointsModel extends Model
{

    static get tableName()
    {
        return 'rooms_change_points';
    }

    static get relationMappings()
    {
        return {
            parent_room: {
                relation: Model.BelongsToOneRelation,
                modelClass: RoomsModel,
                join: {
                    from: 'rooms_change_points.room_id',
                    to: 'rooms.id'
                }
            },
            next_room: {
                relation: Model.HasOneRelation,
                modelClass: RoomsModel,
                join: {
                    from: 'rooms_change_points.next_room_id',
                    to: 'rooms.id'
                }
            }
        }
    }

}

module.exports.RoomsChangePointsModel = RoomsChangePointsModel;
