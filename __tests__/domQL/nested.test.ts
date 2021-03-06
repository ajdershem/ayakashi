//tslint:disable
import "jest-extended";
import {JSDOM} from "jsdom";
//tslint:enable

import {domQuery} from "../../src/domQL/domQL";

const dom = new JSDOM(`
    <style>
        .listValues {
            color: red;
        }
        #justADiv {
            background-color: black;
        }
    </style>
    <div id="a_div" style="display:none;font-size:32px">
        <ul id="myList" style="display:none">
            <li id="element1" class="listValues" data-my="test">value 1</li>
            <li id="element2" class="listValues" data-my="test2">value 2</li>
            <li id="element3" class="listValues" data-my2="test2">value 3</li>
        </ul>
    </div>
    <div id="justADiv" style="display:none"></div>
    <span class="mySpanClass1"></span>
    <span class="mySpanClass2"></span>
`);

describe("nested queries", function() {
    it("AND", function() {
        const results = domQuery({
            where: {
                and: [{
                    class: {
                        eq: "listValues"
                    }
                }, {
                    dataKey: {
                        eq: "my"
                    }
                }, {
                    dataValue: {
                        eq: "test"
                    }
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(1);
        expect(results[0]).toBe(dom.window.document.querySelector("[data-my=\"test\"]"));
    });

    it("OR", function() {
        const results = domQuery({
            where: {
                or: [{
                    id: {
                        eq: "myList"
                    }
                }, {
                    className: {
                        like: "list"
                    }
                }, {
                    "style-background-color": {
                        eq: "black"
                    }
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(5);
    });

    it("nested neq", function() {
        const results = domQuery({
            where: {
                and: [{
                    className: {
                        like: "list"
                    }
                }, {
                    id: {
                        neq: "element2"
                    }
                }, {
                    dataValue: {
                        neq: "test2"
                    }
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(1);
        expect(results).toEqual([
            dom.window.document.getElementById("element1")
        ]);
    });

    it("oh god", function() {
        const results = domQuery({
            where: {
                or: [{
                    id: {
                        eq: "a_div"
                    }
                }, {
                    or: [{
                        id: {
                            eq: "element2"
                        }
                    }, {
                        and: [{
                            dataKey: {
                                eq: "my"
                            }
                        }, {
                            className: {
                                eq: "listValues"
                            }
                        }, {
                            or: [{
                                dataKey: {
                                    like: "my2"
                                }
                            }, {
                                "style-color": {
                                    eq: "red"
                                }
                            }]
                        }]
                    }]
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(3);
    });

    it("should raise an error for an invalid operator", function() {
        expect(() => domQuery({
            //@ts-ignore
            where: {
                invalidOperator: [{
                    className: {
                        eq: "listValues"
                    }
                }, {
                    dataKey: {
                        eq: "my"
                    }
                }, {
                    dataValue: {
                        eq: "test"
                    }
                }]
            }
        }, {
            env: dom.window
        })).toThrowError(/Invalid operator/);
    });

    it("should raise an error for an invalid operator (nested)", function() {
        expect(() => domQuery({
            where: {
                //@ts-ignore
                and: [{
                    className: {
                        eq: "listValues"
                    }
                }, {
                    dataKey: {
                        eq: "my"
                    }
                }, {
                    dataValue: {
                        //@ts-ignore
                        invalidOperator: "test"
                    }
                }]
            }
        }, {
            env: dom.window
        })).toThrowError(/Invalid operator/);
    });

    it("should raise an error for an invalid operator (super nested)", function() {
        expect(() => domQuery({
            where: {
                //@ts-ignore
                or: [{
                    id: {
                        eq: "a_div"
                    }
                }, {
                    or: [{
                        id: {
                            eq: "element2"
                        }
                    }, {
                        and: [{
                            dataKey: {
                                eq: "my"
                            }
                        }, {
                            className: {
                                eq: "listValues"
                            }
                        }, {
                            invalidOperator: [{
                                dataKey: {
                                    like: "my2"
                                }
                            }, {
                                "style-color": {
                                    eq: "red"
                                }
                            }]
                        }]
                    }]
                }]
            }
        }, {
            env: dom.window
        })).toThrowError(/Invalid operator/);
    });

    it("only divs", function() {
        const results = domQuery({
            where: {
                and: [{
                    "style-display": {
                        eq: "none"
                    }
                }, {
                    "style-font-size": {
                        neq: "32px"
                    }
                }, {
                    tagName: {
                        eq: "DIV"
                    }
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(1);
        expect(results[0]).toBe(dom.window.document.getElementById("justADiv"));
    });

    it("nested OR inside an AND when OR is first", function() {
        const results = domQuery({
            where: {
                and: [{
                    or: [{
                        id: {
                            eq: "element1"
                        }
                    }, {
                        id: {
                            eq: "element2"
                        }
                    }]
                }, {
                    tagName: {
                        eq: "li"
                    }
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(2);
        expect(results[0]).toBe(dom.window.document.getElementById("element1"));
        expect(results[1]).toBe(dom.window.document.getElementById("element2"));
    });

    it("nested OR inside an AND when OR is second", function() {
        const results = domQuery({
            where: {
                and: [{
                    tagName: {
                        eq: "li"
                    }
                }, {
                    or: [{
                        id: {
                            eq: "element1"
                        }
                    }, {
                        id: {
                            eq: "element2"
                        }
                    }]
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(2);
        expect(results[0]).toBe(dom.window.document.getElementById("element1"));
        expect(results[1]).toBe(dom.window.document.getElementById("element2"));
    });

    it("nested AND inside an OR when AND is first", function() {
        const results = domQuery({
            where: {
                or: [{
                    and: [{
                        tagName: {
                            eq: "li"
                        }
                    }, {
                        dataValue: {
                            eq: "test"
                        }
                    }]
                }, {
                    tagName: {
                        eq: "div"
                    }
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(3);
        expect(results[0]).toBe(dom.window.document.getElementById("a_div"));
        expect(results[1]).toBe(dom.window.document.getElementById("element1"));
        expect(results[2]).toBe(dom.window.document.getElementById("justADiv"));
    });

    it("nested AND inside an OR when AND is second", function() {
        const results = domQuery({
            where: {
                or: [{
                    tagName: {
                        eq: "div"
                    }
                }, {
                    and: [{
                        tagName: {
                            eq: "li"
                        }
                    }, {
                        dataValue: {
                            eq: "test"
                        }
                    }]
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(3);
        expect(results[0]).toBe(dom.window.document.getElementById("a_div"));
        expect(results[1]).toBe(dom.window.document.getElementById("element1"));
        expect(results[2]).toBe(dom.window.document.getElementById("justADiv"));
    });

    test("same operators in a single level", function() {
        const results = domQuery({
            where: {
                or: [{
                    and: [{
                        tagName: {
                            eq: "span"
                        }
                    }, {
                        class: {
                            eq: "mySpanClass1"
                        }
                    }]
                }, {
                    and: [{
                        tagName: {
                            eq: "span"
                        }
                    }, {
                        class: {
                            eq: "mySpanClass2"
                        }
                    }]
                }]
            }
        }, {
            env: dom.window
        });
        expect(results).toBeArrayOfSize(2);
    });
});
