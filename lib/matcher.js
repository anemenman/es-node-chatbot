module.exports = {

    matchProbability: function (tokens1, tokens2) {

        var match = 0;
        tokens1.forEach(function (t1) {
            tokens2.forEach(function (t2) {
                if (t1.trim() === t2.trim()) {
                    match++;
                }
            });
        });

        tokens2.forEach(function (t1) {
            tokens1.forEach(function (t2) {
                if (t1.trim() === t2.trim()) {
                    match++;
                }
            });
        });

        return tokens1.length + tokens2.length > 0 ? match / (tokens1.length + tokens2.length) : 0;
    }
};