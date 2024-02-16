
/**
 * {@link KObject} helper classes plain-old javascript objects
 * 
 * @version 2024-01-07T1100
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KObject{
    /** 
     * array of unique items.
     * @param {Array} inArrays one or more arrays
     * @returns {Array}
     */
    static distinct(...inArrays) {
        let distinctItems = []
        let argIndex = 0, argItem = undefined;
        let arrIndex = 0, arrItem = undefined;
        if(!Array.isArray(inArrays)){ throw new Error('only supports array.'); }
        for (argIndex in inArrays) {
            argItem = inArrays[argIndex]
            for (arrIndex in argItem) {
                arrItem = argItem[arrIndex]
                if (!distinctItems.includes(arrItem)) { distinctItems.push(arrItem) }
            }
        }
        return distinctItems;
    }
    /** 
     * tests if an object is empty. Returns Inverse of {@link isEmpty}.
     * @param {Object} inArrays any type of object
     * @returns {Boolean}
     */
    static isEmpty(testObj) {
        return !KObject.notEmpty(testObj);
    }
    /** 
     * tests if an object contains data. Peforms multiple tests based on type.
     * @param {Object} inArrays any type of object
     * @returns {Boolean}
     */
    static notEmpty(testObj) {
        if (!testObj) { return false }
        if (typeof testObj == 'undefined') { return false }
        if (typeof testObj == 'undefined') { return false }
        if (typeof testObj == 'string' && testObj == '') { return false }
        if (Array.isArray(testObj)) {
            if (testObj.length < 1) { return false; }
            var hasValue = false;
            for (let objItem of testObj) {
                if (objItem) { hasValue = true; }
            }
            return hasValue;
        }
        if (typeof testObj == 'object') {
            if (Object.keys(testObj).length < 1) { return false }
            //TODO missing test at least one object key has a value 
        }
        return true; /* all empty tests perfrormed assume has value */
    }
    /** 
     * converts array of objects into CSV delimitered strings. One string per object returned..
     * @param {Object} inArrays array of objects
     * @param {Object} sep character to insert between values
     * @param {Object} quote character to enclose values
     * @returns {Array} 
     */
    static toCSV(inArray, sep = ',', quote = '"') {
        /* Validate parameters */
        let targetArray = [];
        targetArray = Array.isArray(inArray) ? inArray : Array.from(inArray)
        let paramAssert = {
            inArray_isArray: Array.isArray(targetArray)
            , sep_isString: typeof sep == 'string'
            , quote_isString: typeof quote == 'string'
            , inArray_listOfObjects: (targetArray ?? []).reduce(
                (prevValue, currValue) => (typeof prevValue == 'boolean' ? prevValue == true : (Object.keys(prevValue) ?? []).length > 0) && (Object.keys(currValue) ?? []).length > 0
            )
        }
        if (Object.values(paramAssert).includes(false)) { throw new Error(this.name + ' invalid parameter, Actual:' + JSON.stringify(paramAssert)); }

        let distinctColumnNames = targetArray.reduce(
            (prevValue, currentValue) => Array.isArray(prevValue) ? prevValue.concat(Object.keys(currentValue)) : Object.keys(currentValue)
        );
        distinctColumnNames = KFetch.distinct(distinctColumnNames)
        let headerCSV = '';
        distinctColumnNames.forEach(
            (zItem) => { headerCSV += quote + zItem.replace(quote, quote + quote) + quote + sep; }
        );
        headerCSV += '\r\n'
        let convertObjectsToStr = '';
        for (let arrIndex = 0; arrIndex < targetArray.length; arrIndex++) {
            let zObject = targetArray[arrIndex];
            distinctColumnNames.forEach((zItem) => {
                let objValue = zObject[zItem] ?? ''
                convertObjectsToStr += quote + objValue.toString().replace(quote, quote + quote) + quote + sep;
            });
            convertObjectsToStr += '\r\n'
        }
        return headerCSV + convertObjectsToStr
    }
    /** 
     * flattens a heirachy of Objects into a single level object based on period delimitered paths.
     * @param {Object} obj the object to query
     * @param {Array} inRowsPath a list of paths to the data being extracted
     * @param {Array} inColumnPaths a list of paths to the columns being extracted
     * @returns {Array} one object returned per row.
     */
    static toDataSet(obj, inRowsPath, inColumnPaths) {
        /* Validate parameters */
        let paramAssert = {
            inRowsPath_isString: typeof inRowsPath == 'string'
            , inColumnPaths_isArray: Array.isArray(inColumnPaths)
            , inColumnPaths_NotString: inColumnPaths.reduce(
                (prevValue, currValue) => (typeof prevValue == 'boolean' ? prevValue == true : typeof prevValue == 'string') && typeof currValue == 'string'
            )
        }
        if (Object.values(paramAssert).includes(false)) { throw new Error(this.name + ' invalid parameter, Actual:' + JSON.stringify(paramAssert)); }

        let rowObjs = inRowsPath.split('.').reduce((o, i) => o[i], obj) ?? [];
        console.assert( true, rowObjs.length)
        let rowIndex = 0, rowObj = {};
        let itemIndex = 0, itemPath = '', itemValue = '', itemName = '';
        let returnObj = {}, returnRows = [];
        for (rowIndex = 0; rowIndex < rowObjs.length; rowIndex++) {
            rowObj = rowObjs[rowIndex];
            for (itemIndex = 0; itemIndex < inColumnPaths.length; itemIndex++) {
                itemName = inColumnPaths[itemIndex]
                itemPath = inRowsPath + '.' + itemName
                itemValue = itemName.split('.').reduce((o, i) => o[i], rowObj) ?? ''
                if (Array.isArray(itemValue)) { itemValue = itemValue.reduce((previousValue, currentValue) => previousValue + ' ' + currentValue.replace(' ', '_')) }
                else if (typeof itemValue == "object" || typeof itemValue == "function") { itemValue = JSON.stringify(itemValue) }
                else { itemValue = itemValue }
                returnObj[itemPath] = itemValue
            }
            returnRows.push(Object.assign({}, returnObj));
            returnObj = {};
        }
        return returnRows
    }
}
