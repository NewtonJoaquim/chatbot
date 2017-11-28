let Botkit = require('botkit');
let http = require('http');

http.createServer(function(request, response){
    
        //The following code will print out the incoming request text
        request.pipe(response);
    
}).listen(5000, 'localhost');
    
console.log('Listening on port 5000...');

let rasa = require('botkit-rasa')({rasa_uri: 'http://localhost:5000'});

let controller = Botkit.slackbot({
    debug: true,
});

let bot = controller.spawn({
    token: 'xoxb-278381929907-9DhjqzqaF3trXOc3IAB18EcL'
}).startRTM();


//controller.hears(['oi', 'olá'], 'direct_message,direct_mention,mention', function(bot, message) {
//    let helloText = "Olá, humano, como posso ajudar?";

//    bot.reply(message, helloText);
//});

controller.middleware.receive.use(rasa.receive);
/*
controller.hears(['cumprimento'],'message_received', rasa.hears, function(bot, message) {

    console.log('Intent:', message.intent);
    console.log('Entities:', message.entities);    

});
*/

// Override hears method in botkit
controller.changeEars(function (patterns, message) {
    return rasa.hears(patterns, message);
});

controller.setupWebserver(5000, function (err, webserver) {
    // Configure a route to receive webhooks from slack
    controller.createWebhookEndpoints(webserver);
});

controller.hears(['cumprimento'], 'direct_message,direct_mention,mention',function (bot, message) {
    let reply = 'Try pressing the power button for 30 seconds. ';
    reply += 'Bring the phone to the service center if it does not start. ';
    reply += 'Dont forget to carry your warranty card.';
    bot.reply(message, reply);
});