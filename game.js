$(document).ready(function(){

  var pusher = new Pusher('699f7eb715ff1922a8f2', {
      cluster: 'us2',
      forceTLS: true
    });

    var channel = pusher.subscribe('all');
    channel.bind('client-waveNotification', function(data) {
      console.log(data);
    });


  function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
  var width;
  var height;
  var xMax = 75;
  var yMax = 75;
  var n = 6.65;
  var r = 2;
  var players = [{x:15, y:20, username: "Bob"}, {x:15, y:21, username: "Kate"}, {x:16, y:21, username: "Carl"}, {x:17, y:21, username: "Joan"}];
  var neighbours = [];
  var cycle = 0;

  var road = [{start: {x:Math.floor(xMax/2),y:0}, end: {x:Math.floor(xMax/2),y:yMax}},
              {start: {x:Math.floor(xMax/2) - 10,y:0}, end: {x:Math.floor(xMax/2) - 10,y:yMax}},
              {start: {x:Math.floor(xMax/2) + 10,y:0}, end: {x:Math.floor(xMax/2) + 10,y:yMax}}]
  var walls = [{type: "y", c: "supermarket", start: {x:0,y:Math.floor(yMax/3)}, end: {x:Math.floor(xMax/2) - 15,y:Math.floor(yMax/3)}},
               {type: "y", c: "supermarket", start: {x:0,y:Math.floor(yMax/3) + 1}, end: {x:Math.floor(xMax/2) - 15,y:Math.floor(yMax/3) + 1}},
               {type: "x", c: "supermarket", start: {x:Math.floor(xMax/2) - 17,y:0}, end: {x:Math.floor(xMax/2) - 17,y:Math.floor(yMax/3) - 4}},
               {type: "x", c: "supermarket", start: {x:Math.floor(xMax/2) - 16,y:0}, end: {x:Math.floor(xMax/2) - 16,y:Math.floor(yMax/3) - 4}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 20,y:Math.floor(yMax/6)}, end: {x:xMax,y:Math.floor(yMax/6)}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 20,y:Math.floor(yMax/6)+1}, end: {x:xMax,y:Math.floor(yMax/6)+1}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 20,y:Math.floor(yMax/6)-10}, end: {x:Math.floor(xMax/2) + 22,y:Math.floor(yMax/6)-10}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 20,y:Math.floor(yMax/6)-9}, end: {x:Math.floor(xMax/2) + 22,y:Math.floor(yMax/6)-9}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 26,y:Math.floor(yMax/6)-10}, end: {x:Math.floor(xMax/2) + 28,y:Math.floor(yMax/6)-10}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 26,y:Math.floor(yMax/6)-9}, end: {x:Math.floor(xMax/2) + 28,y:Math.floor(yMax/6)-9}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 32,y:Math.floor(yMax/6)-10}, end: {x:xMax,y:Math.floor(yMax/6)-10}},
               {type: "y", c: "pamenar", start: {x:Math.floor(xMax/2) + 32,y:Math.floor(yMax/6)-9}, end: {x:xMax,y:Math.floor(yMax/6)-9}}]
  var zones = [{name: "Supermarket", x1: 0, x2: Math.floor(xMax/2) - 17, y1: 0, y2: Math.floor(yMax/3)},
               {name: "Pamenar", x1: Math.floor(xMax/2) + 20, x2: xMax, y1: 0, y2: Math.floor(yMax/6)}]
  var cars = [];

  var user = {
    x: Math.floor(Math.random() * Math.floor(xMax-1)),
    y: Math.floor(Math.random() * Math.floor(yMax-1)),
    id: makeid(6),
    username: null,
    isNeighbour: function(p){
      return (p.x <= this.x + 1) && (p.x >= this.x - 1) 
        && (p.y >= this.y - 1) && (p.y <= this.y + 1);
    },
    isWallNeighbour: function(w, direction){
      if(w.type == "x"){
        switch(direction){
          case "left":
            return (w.start.x == this.x - 1) && (this.y >= w.start.y) && (this.y < w.end.y);
            break; 
          case "right":
            return (w.start.x == this.x + 1) && (this.y >= w.start.y) && (this.y < w.end.y);
            break; 
          case "up":
            return (w.start.x == this.x) && (this.y == w.end.y);
            break;
          case "down":
            return (w.start.x == this.x)  && (this.y == w.start.y);
              break;
        }
      }
      else{
        switch(direction){
          case "up":
            return (w.start.y == this.y - 1) && (this.x >= w.start.x) && (this.x < w.end.x);
            break; 
          case "down":
            return (w.start.y == this.y + 1) && (this.x >= w.start.x) && (this. x < w.end.x);
            break; 
          case "right":
            return (w.start.y == this.y) && (this.x == w.start.x-1);
            break;
          case "left":
            return (w.start.y == this.y)  && (this.x == w.end.x);
              break;
        }
      }
    },
    neighbours: function(){
      return players.filter(p => this.isNeighbour(p));
    },
    blocked: function(direction){
      return walls.filter(w => this.isWallNeighbour(w, direction)).length > 0;
    },
    neighbourString: function(){
      switch(neighbours.length){
        case 0:
          message = `No one`;
        case 1:
          message = `${neighbours[0].username}`;
          break;
        case 2:
          message = `${neighbours[0].username} and ${neighbours[1].username}`;
          break;
        default:
          message = `${neighbours[0].username}, ${neighbours[1].username}, and ${neighbours.length - 2} other${neighbours.length - 2 > 1 ? "s" : ""}`;
          break;
      }
      return message;
    },
    wave: function(){
      $(".chat-notice").remove();
      cn = this.neighbours();
      if(cn.length > 0){
        // WAVE HERE
        cn.forEach(c => channel.trigger("client-waveNotification", {fromId: this.id, fromName: this.username, toName: c.username}))
        //fake bit
        //cn.forEach(n => $(`<div class="chat-message"> ${this.username} waved at ${n.username}.</div>`).appendTo("#chat-body").fadeOut(5000, function() {$(this).remove();}));

        $(`<div class="chat-notice success">Sent a wave to ${this.neighbourString()}</div>`).appendTo("#chat-top").fadeOut(3000, function() {
          $(this).remove();
        });
      }
      else{
        $(`<div class="chat-notice warning">There's no one around to wave to...</div>`).appendTo("#chat-top").fadeOut(3000, function() {
          $(this).remove();
        });
      }
    },
    isInZone: function(z){
      return (this.x >= z.x1 && this.x <= z.x2 && this.y >= z.y1 && this.y <= z.y2);
    },
    zone: function(){
      currentZones = zones.filter(z => this.isInZone(z));
      if (currentZones.length > 0){
        return `You are currently in <b>${currentZones[0].name}.</b>`;
      }
      else{
        return `You are currently in <b>Kensington Market.</b>`;
      }
    }
  };

  console.log(user.id);

  var ctx;
  var alive;
  var intervalId;

  $(document).keydown(function(e) {
    console.log(e.which);
    switch(e.which) {
      // movement
        case 37: // left
          if(!user.blocked("left")) user.x--;
          if(user.x < 0){
            user.x = 0;
          } 
          break;

        case 38: // up
          if(!user.blocked("up")) user.y--;
          if(user.y < 0){
            user.y = 0;
          }
          break;

        case 39: // right
          if(!user.blocked("right")) user.x++;
          if(user.x >= xMax){
            user.x = xMax-1;
          }
          break;

        case 40: // down
          if(!user.blocked("down")) user.y++;
          if(user.y >= yMax){
            user.y = yMax-1;
          }
          break;

       // actions 
        case 87: // wave
          user.wave()
        default: return; // exit this handler for other keys
    }


    updateNeighbours();
    $("#chat-header").html(`Thanks for social distancing, <b>${user.username}</b>. Welcome to the chat! ${user.zone()}`);
    redrawGame();

    e.preventDefault(); // prevent the default action (scroll / move caret)
  });
  
  function updateNeighbours(){
    neighbours = user.neighbours();
    if (neighbours.length > 0){

      message = user.neighbourString();

      switch(neighbours.length){
        case 0:
          message = `${message} is nearby!`;
        case 1:
          message = `${message} is nearby!`;
          break;
        case 2:
          message = `${message} are nearby!`;
          break;
        default:
          message = `${message} ${neighbours.length - 2 > 1 ? "are" : "is"} nearby!`;
          break;
      }

      $(".chat-notice").remove();
      $("#chat-top").append(`<div class="chat-notice notice">${message} <b>Press W to send a wave!</b></div>`);
    }
    else{
      $(".chat-notice").remove();
    }
  }

  function Cell(coord, type){
    var i = coord.x*n+n/2;
    var j = coord.y*n+n/2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(i, j, r, 0, 2*Math.PI);

    if (type == "user"){
      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";
      ctx.stroke();
      ctx.fillStyle = "red";
      ctx.fill();
    }
    if (type == "other"){
      ctx.lineWidth = 3;
      ctx.strokeStyle = user.isNeighbour(coord) ? "red" : "white";
      ctx.stroke();
      ctx.fillStyle = "blue";
      ctx.fill();
    }

    if (type == "road"){
      ctx.fillStyle = "#ffcc00";
      ctx.fill();
    }

    if (type == "supermarket"){
      ctx.fillStyle = `rgb(215,140,90)`;
      ctx.fill();
    }

    if (type == "pamenar"){
      ctx.fillStyle = `rgb(215,140,90)`;
      ctx.fill();
    }

    if (type == "club"){
      ctx.fillStyle = `rgba(${255*(Math.sin(cycle + i)+1)/2},${255*(Math.cos(cycle + j)+1)/2},${255*(Math.sin(cycle)+1)/2}, 0.2)`;
      ctx.fill();
    }
  }
  
  function redrawGame(){
    ctx.clearRect(0, 0, width, height);

    // background cells
    /*for (var y = 0; y < yMax; y++){
      for (var x = 0; x < xMax; x++){
        Cell({x: x, y: y}, 0);
      }
    }*/

    // backgrounds....
    // road
    road.forEach(function(r){
      for (var y = r.start.y; y < r.end.y; y++){
        Cell({x: r.start.x, y: y}, "road");
      }
    });

    // club vibez
    for (var y = 0; y < Math.floor(yMax/3); y++){
      for (var x = 0; x < Math.floor(xMax/2) - 15; x++){
        Cell({x: x, y: y}, "club");
      }
    }

    // foregrounds
    // walls
    walls.forEach(function(r){
      if(r.type == "y"){
        for (var x = r.start.x; x < r.end.x; x++){
          Cell({x: x, y: r.start.y}, r.c);
        }
      }
      else{
        for (var y = r.start.y; y < r.end.y; y++){
          Cell({x: r.start.x, y: y}, r.c);
        }
      }
    });

    

    players.forEach(p => Cell(p, "other"));
    Cell(user, "user")
  }

  function clock(){
    cycle++;
    redrawGame();
  }
  
  function init(){
    ctx = $("#canvas")[0].getContext('2d');
    height = $("#canvas").width();
    width = $("#canvas").height();

    //cycle = 0;
    redrawGame();
    setInterval(function() {clock()}, 75);
  }

  function setUser(){
     // get username
    var username = null;
    while (username == null){
      username = prompt("Please enter your name"); 
    } 
    user.username = username;
    $("#chat-header").html(`Thanks for social distancing, <b>${user.username}</b>. Welcome to the chat! ${user.zone()}`);
  }

  setUser();
  init();
});