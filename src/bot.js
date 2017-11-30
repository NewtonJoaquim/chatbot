let Botkit = require('botkit');
let rasa = require('botkit-rasa')({
    rasa_uri: 'http://localhost:5000',
    rasa_project: 'gente'
});

let controller = Botkit.slackbot({
    debug: true,
});

//controller.middleware.receive.use(rasa.receive);
controller.middleware.receive.use(function(bot, message, next){
    if(typeof message.text !== "undefined"){
        message.text = message.text.toLowerCase();
    }
    rasa.receive(bot, message, next);
});

let bot = controller.spawn({
    token: 'xoxb-278381929907-a5KbOK4bfiXiNXaSNOclgjrF'
}).startRTM();

controller.changeEars(function (patterns, message) {
    return rasa.hears(patterns, message);
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

controller.hears(['perguntar_comando'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "";
    if(message.entities.length == 0){
        console.log('Deu null');
        res = "Belezinha, qual o comando bro?";
    }
    else{
        switch(message.entities[0].value){
            //case null:
            //    console.log('Deu null');
            //    res = "Belezinha, qual o comando bro?";
            //    break;
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
