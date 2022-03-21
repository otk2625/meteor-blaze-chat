import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo'
//import { Rooms } from '../server/main.js'
//import { Session } from 'meteor/session'
import './main.html';
import './createRoom.html';
import './roomList.html';
import './roomHeader.html';
import './messageInput.html';
import './messageList.html';

//컬렉션 선언
Rooms = new Mongo.Collection("rooms");
Messages = new Mongo.Collection("messages")

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Template.createRoom.events({
  "click button[name=saveRoom]" (evt,tmpl) {
      Rooms.insert(
          {_id : tmpl.find("input[name=roomId]").value
              ,name : tmpl.find("input[name=roomId]").value
              ,owner : Meteor.userId()
              ,userList : [Meteor.userId()]
          }
      );

      tmpl.find("input[name=roomId]").value = "";
  }
});

Template.roomList.onCreated(function(){
  
  var self = this;
  self.roomListSub = self.subscribe("roomList");
})

Template.roomList.onDestroyed(function(){

  var self = this;
  self.roomListSub.stop();
})

Template.roomList.helpers({
  list(){
      return Rooms.find();
      
  }
})

Template.roomListItem.events({
  "click a[name=selectRoom]" (){
    Session.set("viewMode","chatRoom");
    Session.set("currentRoom",this._id);
  }
})

//동적 라우팅 registerHelper 모든 템플릿에서 사용이가능하다
Template.registerHelper("currentMode", () => {
  if(!Session.get("viewMode")) Session.set("viewMode", "chatMain");
  return Session.get("viewMode");
})

//header
Template.roomHeader.helpers({
  roonName() {
    return Session.get("currentRoom");
  }
})

//홈 버튼
Template.roomHeader.events({
  "click a[name=goChatMain]"() {
    Session.set("viewMode","chatMain");
  }
})

  //messageInput구현
  Template.messageInput.events({
    
    "click button[name=sendMessage]" (evt, tmpl) {
      tmpl.sendMessage();
    },

    "keyup input[name=messageText]" (evt, tmpl) {
      if(evt.keyCode == 13){
        tmpl.sendMessage();
      }
    }
  });
  
  //기존 코드를 메서드로 재사용하기 위함
  Template.messageInput.onCreated(function(){
    var instance = this;

    instance.sendMessage = () => {
      //기존 소스 코드 재사용가능
      // 1. 텍스트 박스 메시지 값 가져오기
      //var txBox = tmpl.find("input[name=messageText]");
      var txBox = instance.find("input[name=messageText]");
      var message = txBox.value;
      if (!message) return;

      // 2. 메시지 insert
      var messageObj = {
        timestamp : (new Date()).getTime(),
        msg : message,
        roomId : Session.get("currentRoom"),
        owner : Meteor.userId(),
        username : Meteor.user().username,
        email : Meteor.user().emails[0].address
      };

      Messages.insert(messageObj);

      // 3. 텍스트 박스 초기화
      txBox.value="";
      txBox.focus();
    }
  })



  //messageList
  Template.messageList.onCreated(function(){
    
    var inst = this;
    inst.messageSub = inst.subscribe("messages", Session.get("currentRoom"),30);
  });

  Template.messageList.onDestroyed(function(){
    
    var inst = this;
    inst.messageSub.stop();
  });

  Template.messageList.helpers({
    messages() {
     
      return Messages.find({},{sort:{timestamp:1}});
    }
  });