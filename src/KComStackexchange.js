/**
 * {@link KComStackexchange} fetch paged results from stackexchange sites
 * 
 * @version 2023-08-29t1000
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KComStackexchange{
    static incrementQuery(urlQuery = {}, prevResp = undefined) {
        let returnValue = undefined
        if (KObject.isEmpty(urlQuery)) { return urlQuery; }
        if (!prevResp || typeof prevResp.has_more == 'undefined') {
            urlQuery.pagesize = 100
            urlQuery.page = 1
            returnValue = urlQuery
        }
        else if (prevResp.has_more == true) {
            urlQuery.pagesize = 100
            urlQuery.page = (urlQuery.page ?? 0) + 1
            returnValue = urlQuery
        }
        else if (prevResp.has_more == false) { returnValue = undefined }
        console.assert( true, 'next Query', JSON.stringify(urlQuery))
        return returnValue;
    }
}
