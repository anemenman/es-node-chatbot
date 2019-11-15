module.exports = {

    index: async function (chatbot) {
        var constants = require('./constants');
        var encode = require('hashcode').hashCode;

        var elasticsearch = require('elasticsearch');
        var client = new elasticsearch.Client({
            host: constants.ELASTICSEARCH_HOST
        });

        await client.create({
            index: 'chatbot',
            type: 'chatbot',
            id: encode().value(chatbot.id),
            body: {
                question: chatbot.question,
                question_keywords: await module.exports.analyze(chatbot.question, client),
                type: chatbot.type,
                answer: chatbot.answer
            }
        });
    },

    analyze: async function(text, client) {
        const responseAnalyze = await client.indices.analyze({
            index: 'chatbot',
            body: {
                "analyzer": "morphology_analyzer",
                "text": text
            }
        });

        var analyzeTokens = [];

        if (responseAnalyze) {
            responseAnalyze.tokens.forEach(function (token) {
                analyzeTokens.push(token.token);
            });
        }

        return analyzeTokens;
    },

    indexBulk: async function (chatbots) {
        var constants = require('./constants');

        var elasticsearch = require('elasticsearch');
        var client = new elasticsearch.Client({
            host: constants.ELASTICSEARCH_HOST
        });
        var encode = require('hashcode').hashCode;

        var chatbotsBulk = [];
        chatbots.forEach(async function (chatbot) {
            var analyzeTokens = await module.exports.analyze(chatbot.question, client);
            chatbot.question_keywords = analyzeTokens.join(" ");
            chatbotsBulk.push({
                index:  {
                    _index: 'chatbot',
                    _type: 'chatbot',
                    _id: encode().value(chatbot.id)
                }
            });
            chatbotsBulk.push(chatbot);
        });

        await client.bulk({
           body: chatbotsBulk
        });
    },

    search: async function (text, history) {

        var constants = require('./constants');

        var elasticsearch = require('elasticsearch');
        var client = new elasticsearch.Client({
            host: constants.ELASTICSEARCH_HOST
        });

        var analyzeTokens = await module.exports.analyze(text, client);

        const response = await client.search({
            index: 'chatbot',
            type: 'chatbot',
            body: {
                query: {
                    bool: {
                        should: [
                            {
                                match: {"question_keywords.ngram_morphology": text}
                            }
                        ]
                    }
                }
            }
        });
        var results = [];
        var resultAnswer = undefined;
        var resultProbability = 0;
        var resultQuestion = undefined;

        if (response) {
            response.hits.hits.forEach(function (hit) {
                var probability = require('../lib/matcher').matchProbability(
                    hit._source.question_keywords.toString().split(","),
                    analyzeTokens);
                if(probability >= 1){
                    resultProbability = probability;
                    resultAnswer = hit._source.answer;
                    resultQuestion = hit._source.question;
                }
                else if(probability < 1 && probability >= 0.5) {
                    results.push({
                        probability: probability,
                        question: hit._source.question,
                        answer: hit._source.answer
                    });
                }
            });
        }

        if(resultProbability < 1) {
            results.sort(function(a, b) {
                if(a.probability < b.probability) {
                    return -1;
                }
                if(a.probability > b.probability) {
                    return 1;
                }
                return 0;
            });
            history.results = results;
            return  module.exports.nextQuestion(history);
        }

        return resultAnswer;
    },

    nextQuestion: function(history){
        var constants = require('./constants');
        var result = history.results[history.results.length - 1];
        return result === undefined ? constants.NO_FOUND_ANSWER : constants.MAYBE_ANSWER + result.question;
    },

    nextAnswer: function (history){
        var constants = require('./constants');
        var result = history.results.pop();
        return result === undefined ? constants.NO_FOUND_ANSWER : result.answer;
    },

    ping: async function (text) {
        await client.ping({
            requestTimeout: 30000
        }, function (error) {
            if (error) {
                console.error('elasticsearch cluster is down!');
            } else {
                console.log('Everything is ok');
            }
        });
    }
};