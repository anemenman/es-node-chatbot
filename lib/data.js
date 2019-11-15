module.exports = {

    init: function () {
        var parse = require('csv-parse');

        var analyzer = require('../lib/analyzer');

        var encode = require('hashcode').hashCode;

        var chatbots = [];

        require("fs").createReadStream("./lib/data.csv")
            .pipe(parse({delimiter: ';'}))
            .on('data', function (csvrow) {
                chatbots.push({
                    id: encode().value(csvrow[0]),
                    question: csvrow[1],
                    type: csvrow[2],
                    answer: csvrow[3]
                });
            })
            .on('end', async function () {
                console.log("size ---> "+chatbots.length);
                await analyzer.indexBulk(chatbots);
            });
    }
};
