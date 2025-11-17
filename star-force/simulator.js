
onmessage = function (event) {
    const { level, startingStars, endingStars, rates, boomTable, starCatching, safeguard, thirty, boomReduction, simulations } = event.data;

    let results = [];

    for (let sim = 0; sim < simulations; sim++) {
        let totalCost = 0;
        let booms = 0;
        let currentStars = startingStars;

        while (currentStars < endingStars) {
            const cost = getCost(level, currentStars, safeguard, thirty);
            totalCost += cost;

            const roll = Math.random();
            const successRate = starCatching ? rates[currentStars].success * 1.05 : rates[currentStars].success;
            const destroyRate = (1 - successRate) * rates[currentStars].destroy * (boomReduction && currentStars < 21 ? 0.7 : 1);

            if (roll < successRate) {
                currentStars += 1;
            } else if (roll < successRate + destroyRate) {
                if (!safeguard || currentStars > 17) {
                    booms += 1;
                    currentStars = boomTable[currentStars];
                }
            }
        }
        results.push({ totalCost, booms });
    }

    postMessage(results);
}

function getCost(level, currentStars, safeguard, thirty) {
    const exponent = currentStars <= 9 ? 1 : 2.7;
    const denominators = {
        11: 22000,
        12: 15000,
        13: 11000,
        14: 7500,
    };
    const denominator = currentStars <= 10 ? 2500 :
        currentStars >= 15 ? 20000 :
            denominators[currentStars];
    const extraMults = {
        17: 4 / 3,
        18: 20 / 7,
        19: 40 / 9,
        20: 1,
        21: 8 / 5,
    }
    const extraMult = currentStars > 16 && currentStars < 22 ? extraMults[currentStars] : 1;
    const baseCost = 100 * Math.round(extraMult * Math.pow(10 * Math.floor(level / 10), 3) * Math.pow((currentStars + 1), exponent) / denominator + 10);
    const finalCost = thirty ? Math.round(baseCost * 0.7 / 100) * 100 : baseCost;
    if (safeguard && currentStars >= 15 && currentStars <= 17) {
        return finalCost + baseCost * 2;
    } else {
        return finalCost;
    }
}