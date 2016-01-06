//token=xoxb-17294834835-cb3Em3LKCdk5TQMlPO3yQWC3 node bot.js

var Botkit = require('./lib/Botkit.js');
var os = require('os');

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
 debug: false,
});

controller.spawn({
  token: process.env.token
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});


controller.hears(['hello','hi','sup'],'direct_message,direct_mention,mention',function(bot,message) {
    bot.reply(message,"Hi there! I'm owlfred, the OSSF bot. To call me, just mention me or dm me a command, and I will do whatever you tell me! Type @owlfred help to learn more about available commands!");
})

controller.hears(['i love you'],'direct_message,direct_mention,mention',function(bot,message) {
	
    bot.reply(message,"I love you too :hearts:");
})

controller.hears(['jingle bells'],'direct_message,direct_mention,mention',function(bot,message) {
    bot.reply(message,"Merry christmas everyone, and a happy new year! :smile:");
})

controller.hears(['fuck','shit','hell','bitch','damn','testswearword'],'ambient',function(bot,message) {
    bot.startPrivateConversation(message,function(err,dm) {
    	dm.say('Please don\'t swear! Use better language! An OSSF leader has been notified about your behavior.');
  	})
  	console.log('A user just used bad language.')
  	bot.reply(message,"@pooja195: @jess: @rvc: A user just used bad language! Please delete the comment above and take further action from here.");
})

controller.on('user_channel_join',function(bot,message) {

	  bot.reply(message,"Welcome to chat!");

});	

controller.on('bot_channel_join',function(bot,message) {

	  bot.reply(message,"Owlfred deployed. I will now monitor chat for you.");

});	

controller.hears(['yolo'],'direct_message,direct_mention,mention',function(bot,message) {
  bot.reply(message,{
    text: 'swag',
  },function(err,resp) {
    console.log(err,resp);
  });
});

controller.hears(['dm me'],'direct_message,direct_mention',function(bot,message) {
  bot.startConversation(message,function(err,convo) {
    convo.say('Whatever you say!');
  });

  bot.startPrivateConversation(message,function(err,dm) {
    dm.say('What\'s up?');
  })

});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot,message) {
  var matches = message.text.match(/call me (.*)/i);
  var name = matches[1];
  controller.storage.users.get(message.user,function(err,user) {
    if (!user) {
      user = {
        id: message.user,
      }
    }
    user.name = name;
    controller.storage.users.save(user,function(err,id) {
      bot.reply(message,"Got it. I will call you " + user.name + " from now on.");
    })
  })
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot,message) {

  controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message,"Your name is " + user.name);
    } else {
      bot.reply(message,"I don't know yet!");
    }
  })
});


controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot,message) {

  bot.startConversation(message,function(err,convo) {
    convo.ask("Are you sure you want me to shutdown?",[
      {
        pattern: bot.utterances.yes,
        callback: function(response,convo) {
          convo.say("Bye!");
          convo.next();
          setTimeout(function() {
            process.exit();
          },3000);
        }
      },
      {
        pattern: bot.utterances.no,
        default:true,
        callback: function(response,convo) {
          convo.say("*Phew!*");
          convo.next();
        }
      }
    ])
  })
});

function formatUptime(uptime) {
  var unit = 'second';
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'minute';
  }
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'hour';
  }
  if (uptime != 1) {
    unit = unit +'s';
  }

  uptime = uptime + ' ' + unit;
  return uptime;
}

controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot,message) {

  var hostname = os.hostname();
  var uptime = formatUptime(process.uptime());

  bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name +'>. I have been running for ' + uptime + ' on ' + hostname + ".");

});
