let env = require('node-env-file');
let filessystem = require('fs');

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
    redirectUri: process.env.redirectUri,
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

//bot.configureIncomingWebhook({url:process.env.incomingWebhook});

controller.changeEars(function (patterns, message) {
    return rasa.hears(patterns, message);
});


controller.setupWebserver(3000, function (err, webserver) {
// Configure a route to receive webhooks from slack
    controller.createWebhookEndpoints(webserver);
    controller.createOauthEndpoints(webserver);
});

//auxiliar variable to control duplicate replies
let alreadySent = 1;

controller.hears(['cumprimento'],'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    let res = "Diz ai chapa, quer saber o que?";
    console.log(bot.identity);
    if(alreadySent == 0){
        alreadySent = 1;
        return;
    }
    alreadySent = 0;
    setTimeout(function(){bot.reply(message, res)}, 600);
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
    if(alreadySent == 0){
        alreadySent = 1;
        return;
    }
    alreadySent = 0;
    bot.reply(message, messageB);
});

let command_message = "";

controller.hears(['perguntar_comando'], 'direct_message,direct_mention,mention', rasa.hears, function(bot, message) {
    console.log(message);
    let res = "";
    if(message.entities.length == 0){
        console.log('Deu null');
        res = "Belezinha, qual o comando bro?";
    }
    else{
        switch(message.entities[0].value){
            case 'push':
                console.log('Deu push');
                res = "O comando push serve para levar alterações do seu repositório local para o repositório remoto";
                break;
            case 'pull':
                console.log('Deu pull');
                res = "O comando pull serve para trazer alterações do respositório remoto para o seu repositório local.";
                break;
            case 'commit':
                console.log('commit');
                res = "O comando commit serve para registrar uma nova versão do seu codigo.";
                break;
            case 'merge':
                console.log('merge');
                res = "o comando merge serve para atualizar o codigo de uma branch com as atualizações de uma outra branch.";
                break;
            case 'checkout':
                console.log('Deu checkout');
                res = "O comando checkout serve para ir pra outra branch";
                break;
        }
    }
    if(alreadySent == 0){
        alreadySent = 1;
        return;
    }
    alreadySent = 0;
    if(message.intent.confidence <= 0.7){
        setTimeout(function(){bot.reply(message, "não entendi oque você falou")}, 600);
        return;
    }
    setTimeout(function(){bot.reply(message, res)}, 600);
    setTimeout(function(){bot.reply(message, feedback_button())}, 2000);
    command_message = message;
});

controller.on('interactive_message_callback', function(bot, message){
    switch(message.callback_id){
        case "button_feedback":
            switch(message.actions[0].name){
                case "button_click_no" :
                    bot.reply(message, response1_feedback());
                    break;
                case "button_click_yes" :
                    bot.reply(message, "Obrigado pelo feedback!");
                    break;        
            }
            break;
        case "button_response_feedback":
            let dir = __dirname + '/feedback/' ;
            
            if (!filessystem.existsSync(dir)){
                filessystem.mkdirSync(dir);
            }

            let feedback = '';
            switch(message.actions[0].name){
                case "insuf_info" :
                    bot.reply(message, "Obrigado pelo feedback!");
                    feedback = "informação insuficiente";
                    break;
                case "wrong_answer" :
                    bot.startConversation(message, function(err, convo){
                        convo.addQuestion("Qual comando você esperava?", function(response, convo){
                            convo.say("sua resposta (" + response.text + ") sera armazenada para analise.");
                            convo.next();
                        },{}, 'default');
                        feedback = response.text;
                    })
                    break;
                case "other":
                    bot.startConversation(message, function(err, convo){
                        convo.addQuestion("Fale-me do seu problema", function(response, convo){
                            convo.say("sua resposta (" + response.text + ") sera armazenada para analise.");
                            convo.next();
                        }, {}, 'default');
                        feedback = response.text;
                    })
                    break;
            }
    }
})

function feedback_button(){
    const messageB = {
        "attachments": [
            {
                "text": "Essa mensagem foi útil?",
                "callback_id": "button_feedback",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "button_click_yes",
                        "text": "sim",
                        "type": "button",
                        "value": "yes"
                    },
                    {
                        "name": "button_click_no",
                        "text": "não",
                        "type": "button",
                        "value": "no"
                    }
                ]
            }
        ]
    };

    return messageB;
}

function response1_feedback(){
    let responseB = {
        "attachments": [
            {
                "text": "Pode nos informar o problema?",
                "callback_id": "button_response_feedback",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "insuf_info",
                        "text": "Informação insuficiente",
                        "type": "button",
                        "value": "insuf"
                    },
                    {
                        "name": "wrong_answer",
                        "text": "Não era a resposta que eu queria",
                        "type": "button",
                        "value": "wrong"
                    },
                    {
                        "name":"other",
                        "text":"Outro",
                        "type":"button",
                        "value":"other",
                    }
                ]
            }
        ]
    }
    return responseB;
}