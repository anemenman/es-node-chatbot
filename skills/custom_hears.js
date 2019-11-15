let userHistory = new Map();

module.exports = function (controller) {

    controller.on('message_received', async function(bot, message) {

        if(!userHistory.has(message.user)){
            userHistory.set(message.user, {results: []});
        }

        var constants = require('../lib/constants');
        var analyzer = require('../lib/analyzer');
        if(message.text.toLowerCase() === constants.USER_ANSWER_NO &&
            Object.keys(userHistory.get(message.user)).length > 0){
            analyzer.nextAnswer(userHistory.get(message.user));
            bot.reply(message, await analyzer.nextQuestion(userHistory.get(message.user)));

        } else if(message.text.toLowerCase() === constants.USER_ANSWER_YES &&
            Object.keys(userHistory.get(message.user)).length > 0){
            bot.reply(message, await analyzer.nextAnswer(userHistory.get(message.user)));
            userHistory.set(message.user, {results: []});
        } else {
            bot.reply(message, await analyzer.search(message.text, userHistory.get(message.user)));
        }
    });
}
