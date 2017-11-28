let Botkit = require('botkit');

let controller = Botkit.slackbot({
    debug: true,
});

let bot = controller.spawn({
    token: 'xoxb-277941660369-9RtY3EcyKeSDQ9fnJ9kOIWHt'
}).startRTM();


controller.hears(['oi', 'olá'], 'direct_message,direct_mention,mention', function(bot, message) {
    let helloText = "Olá, humano, como posso ajudar?";

    bot.reply(message, helloText);
});
