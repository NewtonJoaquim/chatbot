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
    debug: true,
    interactive_replies: true
});

controller.middleware.receive.use(function(bot, message, next){
    if(typeof message.text !== "undefined"){
        message.text = message.text.toLowerCase();
    }
    rasa.receive(bot, message, next);
});

let bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.changeEars(function (patterns, message) {
    return rasa.hears(patterns, message);
  });


controller.setupWebserver(3000, function (err, webserver) {
// Configure a route to receive webhooks from slack
    controller.createWebhookEndpoints(webserver);
});

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
                        "name": "yes",
                        "text": "yes",
                        "type": "button",
                        "value": "yes"
                    },
                    {
                        "name": "no",
                        "text": "no",
                        "type": "button",
                        "value": "no"
                    },
                    {
                        "name": "maybe",
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

