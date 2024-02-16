
/**
 * {@link KHtmlDocument} helper classes for HtmlDocument
 * 
 * @version 2024-01-07T1100
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KHtmlDocument{   
    /**
     * flattens attributes into {@link Object} from multiple {@link Element}.
     * @param {Element} inElements one or more elements.
     * @returns {Object}
     */ 
    static getAttributes(inElements) {    
        let elemCollection = undefined, elem = undefined, tagName = '', elementsCollectionList = [];
        for (let elemIndex = 0; elemIndex < inElements.length; elemIndex++) {
            elem = inElements[elemIndex]
            elemCollection = {}
            elemCollection['window.hostname'] = this.windowHost
            elemCollection['tag.name'] = elem.tagName ?? ''
            elemCollection['tag.content'] = elem.innerText ?? ''
            for (const name of inElements[elemIndex].getAttributeNames()) { elemCollection['tag.attr.' + name] = elements[elemIndex].getAttribute(name) ?? ''; }
            elementsCollectionList.push(elemCollection)
        } return elementsCollectionList
    }
    /**
     * flattens attributes into {@link Object} from {@link Element} selected from {@link HTMLDocument}.
     * @param {Document} inDocument document to be queried
     * @param {String} inCssSelector css selector for elements.
     */ 
    static getElementAttributes(inDocument, inCssSelector) {
        /* Validate parameters */
        let paramAssert = {
            inCssSelector_isString: typeof inCssSelector == 'string'
            , inCssSelector_notEmpty: inCssSelector.trim() != ''
        }
        if (Object.values(paramAssert).includes(false)) { throw new Error(this.name + ' invalid parameter, Actual:' + JSON.stringify(paramAssert)); }

        return KHtmlDocument.getAttributes( inDocument.querySelectorAll(inCssSelector) );
    }
    /** 
     * text from {@link Element} selected from {@link HTMLDocument}.
     * @param {Document} inDocument document to be queried
     * @param {String} itemSelector css selector for elements.
     * @returns {String}
     */
    static getElementText(inDocument, itemSelector) {
        let returnText = '';
        let itemElements = inDocument.querySelectorAll(itemSelector);
        for (let nameIndex = 0; nameIndex < itemElements.length; nameIndex++) { returnText += ' ' + itemElements[nameIndex].innerText }
        return returnText
    }
    /** 
     * flattens the selected nodes into structured {@link Object} from {@link Element} selected from {@link HTMLDocument}.
     * @param {Document} inDocument document to be queried
     * @param {String} cssSelector css selector for elements.
     * @param {Boolean} dataAsHeader flag to convert first data row into titles.
     * @returns {String}
     */
    static selectTableAsObject(inDocument, cssSelector, dataAsHeader = false) {
        /* Validate parameters */
        let paramAssert = {
            inDocument_isDocument: inDocument.constructor.name == 'HTMLDocument'
            , cssSelector_isString: typeof cssSelector == 'string'
            , cssSelector_containsTable: 0 <= cssSelector.toLowerCase().indexOf('table')
            , dataAsHeader_isBoolean: typeof dataAsHeader == 'boolean'
        }

        //TODO validate a different scenario where inDocument is 'HTMLTableElement', then ignore the css selector.

        if (Object.values(paramAssert).includes(false)) { throw new Error(this.name + ' invalid parameter, Actual:' + JSON.stringify(paramAssert)); }

        /* extraction variables*/
        let tableElements = [], tableElement, tableIndex = 0;
        let dataElements = [], hasData = false;
        let headElements = [], hasHead = false;
        /* Row Template */
        let rowTemplate = { index: 0 }, rowElements = [];
        let rowResults = [], rowResult = {}, rowKeys = [], rowIndex = -1;
        let valueElements, valueText, rowValueStartIndex = Object.keys(rowTemplate).length - 1, keyName = '';
        tableElements = inDocument.querySelectorAll(cssSelector);
        for (tableIndex = 0; tableIndex < tableElements.length; tableIndex++) {
            tableElement = tableElements[tableIndex];
            /* table header */
            headElements = Array.from(tableElement.querySelectorAll('tr:has(th,thead)')); /* First: quack like header */
            hasHead = (headElements && headElements.length > 0)
            /* table data */
            dataElements = Array.from(tableElement.querySelectorAll('tr:not(:has(th,thead))')); /* all others */
            hasData = (dataElements && dataElements.length > 0)
            /* header store titles */
            if (!hasHead && !hasData) { return undefined }
            else if (dataAsHeader && !hasHead && hasData) {
                /* data as header */
                console.assert( true, 'head from first data row')
                dataElements[0].querySelectorAll('td,th').forEach(
                    (itemValue, itemIndex, listObj) => {
                        let valueResult = itemValue.innerText.replace(/[^A-Za-z0-9 _]/g, '');
                        rowTemplate[valueResult] = undefined
                    });
                dataElements = dataElements.slice(1, dataElements.length)
            } else if (!dataAsHeader && !hasHead && hasData) {
                /* generic as header */
                console.assert( true, 'head is generic')
                valuesLength = dataElements[0].querySelectorAll('td,th').length
                Array(valuesLength).keys().foreach(
                    (index) => { rowTemplate['Column' + index] = undefined }
                );
            } else if (hasHead) {//1
                /* header as header */
                console.assert( true, 'head from table head')
                headElements[0].querySelectorAll('td,th').forEach(
                    (itemValue, itemIndex, listObj) => {
                        var valueResult = itemValue.innerText.replace(/[^A-Za-z0-9 _]/g, '');
                        if (KObject.isEmpty(valueResult)) { valueResult = 'Column' + itemIndex }
                        rowTemplate[valueResult] = undefined
                    });
                console.assert( true, Object.keys(rowTemplate).toString(), Object.keys(rowTemplate).length);
                headElements = headElements.slice(1, headElements.length)
            } else { throw new Error('Should never occur' + [allowDataAsHeader, hasHead, hasData]) }
            /* Rows consolidate */
            rowElements = rowElements.concat(headElements)
            rowElements = rowElements.concat(dataElements)
            /* Data */
            let rowKeys = Object.keys(rowTemplate);
            let valueIndex = rowValueStartIndex;
            rowElements.forEach(
                (rowItem) => {
                    rowIndex++, valueIndex = rowValueStartIndex;
                    let rowValues = Object.assign({}, rowTemplate)
                    rowValues['index'] = rowIndex
                    rowItem.querySelectorAll('td,th').forEach(
                        (itemElement) => {
                            valueIndex++;
                            if (valueIndex > rowKeys.length - 1) { keyName = 'Column' + valueIndex } else { keyName = rowKeys[valueIndex] }
                            rowValues[keyName] = itemElement.innerText
                        });
                    rowResults.push(Object.assign({}, rowValues));
                });
            return rowResults;
        }
    }
    /** 
     * flattens multiple selected table nodes into structured {@link Object} from {@link Element} selected from {@link HTMLDocument}.
     * @param {Document} inDocument document to be queried
     * @param {String} tableSelector css selector must match to a Table {@link Node}.
     * @param {Boolean} allowDataAsHeader flag to convert first data row into the table titles.
     * @returns {String}
     */
    static tableAllToObject(inDocument, tableSelector, allowDataAsHeader = false) {
        let tables = [];
        inDocument.querySelectorAll('table').forEach( tbl => { 
            console.warn('not yet tested.');
            tables.push({ name: tableSelector.replace(/^.+[^a-zA-Z0-9](?=[a-zA-Z0-9]*$)/, '')
                        , table: KHtmlDocument.selectTableAsObject(inDocument, tableSelector, allowDataAsHeader)
            });
        });
        console.assert( true, '>totalFound', this.dataSet.length);
        return tables;
    }
    /** 
     * flattens single selected table nodes into structured {@link Object} from {@link Element} selected from {@link HTMLDocument}.
     * @param {Document} inDocument document to be queried
     * @param {String} tableSelector css selector must match to a Table {@link Node}.
     * @param {Boolean} allowDataAsHeader flag to convert first data row into the table titles.
     * @returns {String}
     */
    static tableToObject(inDocument, tableSelector, allowDataAsHeader = false) {
        inDocument.querySelectorAll('table').forEach( tbl => { 
            console.warn('not yet tested.');
            return { name: tableSelector.replace(/^.+[^a-zA-Z0-9](?=[a-zA-Z0-9]*$)/, '')
                    , table: KHtmlDocument.selectTableAsObject(inDocument, tableSelector, allowDataAsHeader)
            };
        });
        return;
    }
}
