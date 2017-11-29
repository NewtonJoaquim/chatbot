let Botkit = require('botkit');
let rasa = require('botkit-rasa')({
    rasa_uri: 'http://localhost:5000',
    rasa_project: 'gente'
});

let controller = Botkit.slackbot({
    debug: true,
});

controller.middleware.receive.use(rasa.receive);

let bot = controller.spawn({
    token: 'xoxb-277941660369-403PYx3ZCs5NBl4xeVQTeY2S'
}).startRTM();

controller.changeEars(function (patterns, message) {
    return rasa.hears(patterns, message);
  });

controller.hears(['cumprimento'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "Diz ai chapa, quer saber o que?";
    console.log('Intent:', message.intent);
    bot.reply(message, res);
});

controller.hears(['pesquisa_comando'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "Belezinha, qual o comando bro?";
    bot.reply(message, res);
});

