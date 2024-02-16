/**
 * {@link ComEligreyFileSaver} Download data from browser to local file. 
 * Simplified from {@link FileSaver.js|https://github.com/eligrey/FileSaver.js} library, last tested on Edge Version 105.0.1343.53.
 * 
 * @version 2022-10-31T1130
 * @author Eli Grey <http://eligrey.com>
 */
class ComEligreyFileSaver {

    /**
     * The saveAs function then downloads the file.
     * The saveAs function is part of the FileSaver.js library.
     * @param inData - The data to be saved.
     * @param inFile_name - The name of the file to be saved.
     */
    static saveBlob(inData, inFile_name) {
        var blob = new Blob([inData], { type: "text/plain;charset=utf-8" });
        (new ComEligreyFileSaver).saveAs(blob, inFile_name);
    }
    static saveToFile(inDescriptor, inContent, inFileType) {
        //Trigger file download
        let file_name = inDescriptor.replaceAll(/[^a-zA-Z0-9]+/g, '_') + '.' + inFileType;
        let a_element = document.createElement('a')
        a_element.href = 'data:attachment/' + inFileType + ',' + encodeURI(inContent);
        a_element.target = '_blank';
        a_element.download = file_name;
        a_element.text = "download results";
        a_element.click();
        console.assert( true, 'Browser Download triggered filename: ' + file_name);
        ComEligreyFileSaver.saveBlob(inContent, file_name);
        return
    }
    /**
     * If the blob is a string, then it's a regular link, so we just click it. 
     * If the blob is a blob, then we create a URL from it, and then click it.
     * @param blob - The blob to download.
     * @param name - The name of the file to be downloaded.
     * @param opts - ??
     */
    saveAs(blob, name, opts) {
        var URL = window.URL
        /* Namespace is used to prevent conflict w/ Chrome Poper Blocker extension (Issue #561) */
        var aElement = window.document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
        name = name || blob.name || 'download'
        aElement.download = name
        aElement.rel = 'noopener' // tabnabbing
        if (typeof blob === 'string') {
            console.assert( true, 'Regular link');
            aElement.href = blob
            if (aElement.origin !== location.origin) {
                corsEnabled(aElement.href)
                    ? download(blob, name, opts)
                    : click(aElement, aElement.target = '_blank')
            } else {
                click(aElement)
            }
        } else {
            console.assert( true, 'Blob download');
            aElement.href = URL.createObjectURL(blob)
            setTimeout(function () { URL.revokeObjectURL(aElement.href) }, 4E4) // 40s
            setTimeout(function () { aElement.dispatchEvent(new MouseEvent('click')) }, 0)
        }
    }
    download(url, name, opts) {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.responseType = 'blob'
        xhr.onload = function () {
            saveAs(xhr.response, name, opts)
        }
        xhr.onerror = function () {
            console.error('could not download file')
        }
        xhr.send()
    }
    corsEnabled(url) {
        var xhr = new XMLHttpRequest()
        /* use sync to avoid popup blocker */
        xhr.open('HEAD', url, false)
        try {
            xhr.send()
        } catch (e) { }
        return xhr.status >= 200 && xhr.status <= 299
    }
    click(node) {
        try {
            node.dispatchEvent(new MouseEvent('click'))
        } catch (e) {
            var evt = document.createEvent('MouseEvents')
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
                20, false, false, false, false, 0, null)
            node.dispatchEvent(evt)
        }
    }
}
