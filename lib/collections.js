import { Mongo } from 'meteor/mongo';

export const Rooms = new Mongo.Collection("rooms");
export const Messages = new Mongo.Collection("messages");