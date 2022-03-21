import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Rooms = new Mongo.Collection("rooms");
Messages = new Mongo.Collection("messages");


//엑세스 접근 허용
Rooms.allow({
  insert (userId, doc) {
    return (userId && doc.owner === userId);
  }
});
//엑세스 접근 허용
Messages.allow({
  insert (userId, doc) {
    return (userId && doc.owner === userId);
  }
})

//발행
Meteor.publish("roomList", function(){

  return Rooms.find();
});
Meteor.publish("messages", function(roomId,count){
  if(!roomId){
    console.error("채팅방 식별자 부재");
    return [];
  }else{
    return Messages.find({roomId:roomId},{sort: {timestamp: -1}, limit:count});
  }
})

Meteor.startup(() => {
  if(!Rooms.findOne({_id:"MeteorSchool"})) {
    console.log("확인 테스트");
    /*사용자 등록*/
    var usr1 = Accounts.createUser({
        username : "와글이"
        ,email : "waggle@gmail.com"
        ,password : "12345678"
    });
    var usr2 = Accounts.createUser({
        username : "수다쟁이"
        ,email : "ppillip@gmail.com"
        ,password : "dnflemf"
    });

    /*채팅방 등록*/
    Rooms.insert({
        _id : "MeteorSchool",
        name: "MeteorSchool",
        owner: usr1,            /* 방장은 와글이 */
        userList : [usr1,usr2],    /* 채팅방 참여자 */
        createdAt : (new Date()).getTime()
    });

}
});
