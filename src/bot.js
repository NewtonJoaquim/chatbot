let env = require('node-env-file');

env(__dirname + '/.env');

/*if (!process.env.token) {
  usage_tip();
  // process.exit(1);
}*/

let Botkit = require('botkit');
let rasa = require('botkit-rasa')({
    rasa_uri: 'http://localhost:5000',
    rasa_project: 'gente'
});

let controller = Botkit.slackbot({
    clientId: process.env.clientID,
    clientSecret: process.env.clientSecret,
    scopes: ['bot'],
    redirectUri: 'https://2d855797.ngrok.io/oauth',
    json_file_store: __dirname + '/.data/db/',
    debug: true,
    interactive_replies: true
});

controller.startTicking();

controller.middleware.receive.use(function(bot, message, next){
    if(typeof message.text !== "undefined"){
        message.text = message.text.toLowerCase();
    }
    rasa.receive(bot, message, next);
});

let bot = controller.spawn({
    token: process.env.token
}).startRTM();

bot.configureIncomingWebhook({url:"https://hooks.slack.com/services/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"});

controller.changeEars(function (patterns, message) {
    return rasa.hears(patterns, message);
  });


controller.setupWebserver(3000, function (err, webserver) {
// Configure a route to receive webhooks from slack
    controller.createWebhookEndpoints(webserver);
    controller.createOauthEndpoints(webserver);
});


/*controller.hears('[botoes_teste]', 'direct_message', rasa.hears, function(bot,message){
    
    bot.startConversation(message, function(err, convo) {
        
            convo.ask({
                attachments:[
                    {
                        title: 'Do you want to proceed?',
                        callback_id: '123',
                        attachment_type: 'default',
                        actions: [
                            {
                                "name":"yes",
                                "text": "Yes",
                                "value": "yes",
                                "type": "button",
                            },
                            {
                                "name":"no",
                                "text": "No",
                                "value": "no",
                                "type": "button",
                            }
                        ]
                    }
                ]
            },[
                {
                    pattern: "yes",
                    callback: function(reply, convo) {
                        convo.say('FABULOUS!');
                        convo.next();
                        // do something awesome here.
                    }
                },
                {
                    pattern: "no",
                    callback: function(reply, convo) {
                        convo.say('Too bad');
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(reply, convo) {
                        // do nothing
                    }
                }
            ]);
        });
    });*/

controller.hears(['cumprimento'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "Diz ai chapa, quer saber o que?";
    console.log('Intent:', message.intent);
    bot.reply(message, res);
});

controller.hears(['cumprimento'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "Olá confrade, como posso ajudá-lo?";
    console.log('Intent:', message.intent);
    bot.reply(message, res);
});

controller.hears(['botoes_teste'],'direct_message,direct_mention,mention',rasa.hears,function(bot,message) {
    console.log("Entrou aqui");
    const messageB = {
        "text": "This is your first interactive message",
        "attachments": [
            {
                "text": "Building buttons is easy right?",
                "fallback": "Shame... buttons aren't supported in this land",
                "callback_id": "button_tutorial",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "button_click_yes",
                        "text": "yes",
                        "type": "button",
                        "value": "yes"
                    },
                    {
                        "name": "button_click_no",
                        "text": "no",
                        "type": "button",
                        "value": "no"
                    },
                    {
                        "name": "button_click_maybe",
                        "text": "maybe",
                        "type": "button",
                        "value": "maybe",
                        "style": "danger"
                    }
                ]
            }
        ]
    };
    bot.reply(message, messageB);
});

controller.hears(['perguntar_comando'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "";
    if(message.entities.length == 0){
        console.log('Deu null');
        res = "Belezinha, qual o comando bro?";
    }
    else{
        switch(message.entities[0].value){
            case 'push':
                console.log('Deu push');
                res = "push";
                break;
            case 'pull':
                console.log('Deu pull');
                res = "pull";
                break;
            case 'commit':
                console.log('Deu commit');
                res = "commit";
                break;
            case 'merge':
                console.log('Deu merge');
                res = "merge";
                break;
            case 'checkout':
                console.log('Deu checkout');
                res = "checkout";
                break;
        }
    }
    bot.reply(message, res);
});

controller.on('interactive_message_callback', function(bot, message){
    bot.reply(message, "Interagindo com o botao " + message.callback_id);
    bot.reply(message, "voce clicou na opcao: " + message.actions[0].name)
   // bot.reply(message, message.value);
})

