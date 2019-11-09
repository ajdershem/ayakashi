const deliverResults = require("../../../../../../utils/deliverResults");

module.exports = async function(ayakashi, input, params) {
    await ayakashi.load(`http://localhost:${params.staticServerPort}`);

    const cookies = await ayakashi.getCookies();

    await deliverResults(params.port, {
        cookies: cookies
    });
};
