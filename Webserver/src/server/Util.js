"use strict";
const https = require('follow-redirects').https;

module.exports = class Util {
    _setHeaders(request, contentType) {
        switch (contentType) {
            case `JSON`: {
                request.headers['Content-Type'] = `application/json`;
                break;
            }
            case `FORM`: {
                request.headers['Content-Type'] = `application/x-www-form-urlencoded`;
                break;
            }
            case `SOAP`: {
                request.headers.SOAPAction = `''`;
                request.headers['Content-Type'] = `text/xml`;
                break;
            }
            default:
                throw new Error(`Unexpected contentType [${contentType}]`);
        }
    }

    server() {
        let output = {};
        const SERVER = process.env.SERVER;

        if (SERVER === 'Local') {
            output.url = `https://localhost:4001`
        } else {
            output.url = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;
        }
        return output;
    }

    makeCallout({ method, url, authorization, contentType, postData }) {
        return new Promise((resolve, reject) => {
            let urlParsed = new URL(url);
            // Build request
            let request = { method, maxRedirects: 20 };
            request.hostname = urlParsed.hostname;
            if (urlParsed.port) {
                request.port = urlParsed.port;
            }
            request.path = urlParsed.pathname;
            if (urlParsed.search) {
                request.path += `${urlParsed.search}`;
            }
            request.headers = {};
            if (authorization) {
                request.headers.Authorization = authorization;
            }
            if (contentType) {
                this._setHeaders(request, contentType);
            }

            // Make request
            const req = https.request(request, (res) => {
                let chunks = [];

                res.on("data", (chunk) => { chunks.push(chunk); });
                res.on("end", () => {
                    let body = Buffer.concat(chunks).toString();
                    try {
                        body = JSON.parse(body);
                    } catch (ex) {
                        // Ignore trying to convert
                    }
                    // console.log(res.statusCode, JSON.stringify(body));
                    resolve({
                        res: {
                            statusCode: res.statusCode,
                            headers: res.headers
                        }, body
                    });
                });
                res.on("error", (error) => { reject(error); });
            });

            // Post data
            if (postData) {
                if (typeof postData !== 'string') {
                    throw new Error('postData must be a string!');
                }
                req.write(postData);
            }

            req.end();
        })
    }

    toBase64(input) {
        return Buffer.from(input, 'utf8').toString('base64');
    }

    fromBase64(input) {
        return Buffer.from(input, 'base64').toString('utf8');
    }

    logInfo({ message, value }) {
        // console.log(`ℹ️  - ${message}`, value);
        console.log(
            `ℹ️  - ${message}`,
            value !== undefined ? JSON.stringify(value) : ''
        );
    }

    logError({ message, value }) {
        debugger;

        let output = [];
        output.push(`❌  *--- START ---*`);
        output.push(`❌  - ${message}`);
        // console.error(`❌  -`, value);
        let originalStack = this._removeStack(value);
        if (value) {
            output.push(
                `❌  - \n${this.errorToText(value)}`
            );
        }
        let stack = new Error().stack;
        stack = stack.split('\n');
        stack = stack.filter((line) => line.includes('/src/')); // && !line.includes('/Util.js')
        originalStack.forEach((line) => output.push(`❌  - ${line}`));
        stack.forEach((line) => output.push(`❌  - ${line}`));
        output.push(`❌  *--- END ---*`);
    }

    errorToText(error, nested = false) {
        if (error === null) return 'null';
        if (error === undefined) return 'undefined';
        if (typeof error === 'string') return error;

        const getValue = (object, key) => {
            let value = object[key];
            if (typeof value === 'object') {
                object[key] = this.errorToText(value, true);
            } else {
                object[key] = value;
            }
            return value;
        };

        let keys = [];
        let result = Object.create(error);
        for (let key of Object.keys(result)) {
            keys.push(key);
            if (key !== 'stack') {
                result[key] = getValue(result, key);
            }
        }
        for (let key of Object.getOwnPropertyNames(error)) {
            if (!keys.includes(key)) {
                keys.push(key);
                if (key !== 'stack') {
                    result[key] = getValue(result, key);
                }
            }
        }

        if (!nested) {
            result = JSON.stringify(result, null, 2);
        }
        return result;
    }

    _removeStack(error) {
        let output = [];
        try {
            if (!error) throw new Error();
            if (!error.stack) throw new Error();

            output = error.stack.split('\n');
            if (!(Array.isArray(output) && output.length >= 1)) throw new Error();

            output = output.filter((line) => line.includes('/src/'));
            if (!(Array.isArray(output) && output.length >= 1)) throw new Error();

            output = output.filter((line) => line.trim().startsWith('at '));
            if (!(Array.isArray(output) && output.length >= 1)) throw new Error();

            delete error.stack;
        } catch (ex) {
            // Ignore
        }
        return output;
    }

    assertEquals({ job, expected, actual, message }) {
        message = `${job.id}@${job.data.step} | Assertion failed | Expecting EQUALS | Expected: [${expected}] | Actual: [${actual}] | ${message}`;
        this.assert({ job, trueValue: expected === actual, message });
    }

    assertNotEquals({ job, expected, actual, message }) {
        message = `${job.id}@${job.data.step} | Assertion failed | Expecting NOT EQUALS | Expected: [${expected}] | Actual: [${actual}] | ${message}`;
        this.assert({ job, trueValue: expected !== actual, message });
    }

    assertHasData({ job, value, message }) {
        if (!value) {
            message = `${job.id}@${job.data.step} | Assertion failed | Validating if data is present | ${message}`;
            this.logError({ value, message });
            throw new Error(JSON.stringify({ value, message }));
        }
    }

    assertOption({ job, value, listValues, message }) {
        if (!Array.isArray(listValues)) {
            message = `${job.id}@${job.data.step} | Assertion failed | [listValues] must be an array! | ${message}`;
            this.logError({ value, listValues, message });
            throw new Error(JSON.stringify({ value, listValues, message }));
        }
        if (!listValues.includes(value)) {
            message = `${job.id}@${job.data.step} | Assertion failed | Value [${value}] is not in list [${listValues}] | ${message}`;
            this.logError({ value, listValues, message });
            throw new Error(JSON.stringify({ value, listValues, message }));
        }
    }

    assert({ job, trueValue, message }) {
        if (typeof trueValue !== 'boolean') {
            message = `${job.id}@${job.data.step} | Assertion failed | Boolean expression was expected! [${trueValue}] | ${message}`;
            this.logError({ trueValue, message });
            throw new Error(JSON.stringify({ trueValue, message }));
        }
        if (!trueValue) {
            this.logError({ trueValue, message });
            throw new Error(message);
        }
    }
};
