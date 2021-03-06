//tslint:disable
import "jest-extended";
//tslint:enable
import {getRandomPort} from "../../../src/utils/getRandomPort";
import {startResultServer, ResultServer} from "../../utils/resultServer";
import {Config} from "../../../src/runner/parseConfig";
import {stringifyConfig} from "../../utils/stringifyConfig";
import {exec} from "child_process";

let resultServer: ResultServer;
let port: number;

jest.setTimeout(600000);

describe("yieldEach tests", function() {
    beforeEach(async function() {
        port = await getRandomPort();
        resultServer = await startResultServer(port);
    });

    afterEach(async function() {
        return resultServer.close();
    });

    test("returns correct results", function(done) {
        const config: Config = {
            config: {
                protocolPort: 0,
                bridgePort: 0,
                workers: 1
            },
            waterfall: [{
                type: "renderlessScraper",
                module: "getData",
                config: {
                    retries: 5
                }
            }, {
                type: "script",
                module: "deliverResults",
                params: {
                    port: port
                },
                config: {
                    retries: 5
                }
            }]
        };
        const strConfig = stringifyConfig(config);
        exec(`node lib/cli/cli.js run ./__tests__/__e2e__/yieldEach/test_files --clean --jsonConfig '${strConfig}'`, function() {
            const results: {
                data: number[]
            }[] = resultServer.getResults();
            expect(results).toBeArrayOfSize(30);
            done();
        });
    });
});
