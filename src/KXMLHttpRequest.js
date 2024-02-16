

/**
 * {@link KXMLHttpRequest} helper classes for XMLHttpRequest
 * 
 * @version 2024-01-07T1100
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KXMLHttpRequest {

    /**
     * Enum for status class names.
     */
    static statusNames = {
        OK: 2,
        WARN: 4,
        FATAL: 5
    };
    /** 
     * Structured object for XMLHttpRequest response.
     */
    static response = {
        status: '', statusClass: 0
        , statusCode: 0, response: {}
        , responseType: '', statusText: ''
    }
    /**
     * Clone the {@link XMLHttpRequest.response} into a structured object.
     * @param {object} xhr - XMLHttpRequest.reponse
     */
    static cloneResponse(xhr) {
		let cacheObj = Object.create(KXMLHttpRequest.response);
		cacheObj = Object.assign(cacheObj, {
            status: xhr.status, statusClass: Number.parseInt(Math.ceil(xhr.status / 100))
            , statusCode: Number.parseInt((xhr.status % 100)), response: xhr.response
            , responseType: xhr.getResponseHeader("Content-Type"), statusText: xhr.statusText
        });
		return cacheObj;
    }
    /**
     * send a XMLHttpRequest, and creates a structured object containing the response.
     * @param {object} runParam - containing request data in format: {method: '', path: ''[, query: {item:''}][, headers: {item:''}][, body: ''][, withCredentials: true]} 
     */
    static async sendRequest(runParam) {
        const __version = '2023-11-30T2300';

        let promiseResult = await new Promise(function (resolve, reject) {
            let result = {
                statusClassName: KXMLHttpRequest.statusNames.FATAL, statusClassMessage: 'Should not happen ask Javascript expert for help.'
                , statusClass: 5, statusCode: 18
                , response: null, responseType: null, statusText: null, responseObjectType: null, responseObject: null
            }
            /* validate parameters */
            if (!runParam || !runParam.method || !runParam.path) { result.statusClassMessage = "runParam, Method or Path not provided usage: {method: '', path: ''[, query: {item:''}][, headers: {item:''}][, body: ''][, withCredentials: true]}"; reject(result); }
            if (!KBrowserWindow.getWindowHost(runParam.path, false)) { result.statusClassMessage = `runParam.url and browser window missmatch. Requested: ${window.location.hostname} , Actual: ${targetHostname}`; reject(result); }

            let method = runParam.method;
            let url = runParam.path;
            let urlQuery = runParam.query;
            let urlHeaders = runParam.headers;
            let urlBody = runParam.body;

            /* assemble path and query into url */
            if (urlQuery && typeof urlQuery == 'string' && urlQuery != '') { urlQuery = encodeURI(urlQuery); }
            else if (urlQuery && typeof urlQuery != 'string') {
                urlQuery = Object.entries(urlQuery).reduce(
                    (accum, curr) => (accum != '' ? `${accum}&` : '') + `${curr[0]}=${curr[1]}`
                    , ''
                );
                urlQuery = encodeURI(urlQuery);
            }
            url += (urlQuery ? `?${urlQuery}` : '');

            console.assert(true, `sendRequest`);
            /* initate XHR request */
            let xhr = new XMLHttpRequest();
            console.assert( true, `created, ${url}`);
            xhr.open(method, url);
            /* set headers */
            if (runParam.headers) { Object.keys(runParam.headers).forEach(k => { xhr.setRequestHeader(k, runParam.headers[k]); }); }
            if (runParam.withCredentials) { xhr.withCredentials = true; }
            /* create a status level enum */


            xhr.onload = function () {

                result = Object.assign(KXMLHttpRequest.cloneResponse(this),{
                     statusClassName: KXMLHttpRequest.statusNames.FATAL
                    ,statusClassMessage: `Status Code ${this.status} not recognised.`
                    ,responseType: this.getResponseHeader("Content-Type")
                    ,responseObject: null
                    ,responseObjectType: null
                    ,statusClass: Number.parseInt(Math.ceil(this.status / 100))
                });

                switch (result.statusClass) {
                    case 3:
                    case 5:
                        //console.assert( true, 'case 3,5');
                        result.statusClassName = statusNames.FATAL;
                        result.statusClassMessage = `Suggest response will not be possible.`;
                        break;
                    case 1:
                    case 2:
                    case 4:
                        //console.assert( true, 'case 1,2,4');
                        if (this.status in [423, 429]) { /* network fault, retry later */
                            result.statusClassName = KXMLHttpRequest.statusNames.WARN;
                            result.statusClassMessage = `Non-functional fault, try again later.`;
                            break;
                        }
                        else { result.statusClassName = KXMLHttpRequest.statusNames.OK; result.statusClassMessage = `Response Received.`; }
                        /* store the result */
                        try {
                            let currDom = new DOMParser();

                            if (result.responseType.toLowerCase().indexOf('/json;') > -1) { result.responseObject = JSON.parse(result.response); result.responseObjectType = 'object' }
                            else if (result.responseType.toLowerCase().indexOf('/htm;') > -1 || result.responseType.toLowerCase().indexOf('/html;') > -1) { result.responseObject = currDom.parseFromString(result.response, "text/html"); result.responseObjectType = 'node' }
                            else if (result.responseType.toLowerCase().indexOf('/xml;') > -1) { result.responseObject = currDom.parseFromString(result.response, "text/xml"); result.responseObjectType = 'node' }
                            else { result.responseObject = null; result.responseObjectType = 'unsupported' }
                        } catch (err) { result.statusClassName = KXMLHttpRequest.statusNames.FATAL; result.statusClassMessage = `Response could not be parsed to object.` + err.toString(); break }
                        break;
                    default:
                        console.assert( true, 'case default');
                } /*  switch(statusClass){ */
                if (result.statusClassName == KXMLHttpRequest.statusNames.FATAL) { reject(result); }
                else { resolve(result); }
            };

            xhr.onerror = () => reject(Object.assign(result, KXMLHttpRequest.cloneResponse(this)));

            xhr.onprogress = function (e) {
                if (e.lengthComputable && e.total >= e.loaded) { console.assert( true, `loading...`); /*${e.loaded} B of ${e.total} B loaded!`);*/ }
                else { console.assert( true, `loading...`); /* console.assert( true, `${e.loaded} B loaded!`);*/ }
            }


            console.assert( true, 'sending ...', 'content type:', xhr.getResponseHeader("Content-Type"));
            // finalise the request
            if (urlBody) { xhr.send(urlBody); }
            else { xhr.send(); }
            console.groupEnd();
        });
        return promiseResult;
    }
}
