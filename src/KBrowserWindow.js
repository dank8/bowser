
/**
 * {@link KBrowserWindow} helper functions for browser window information.
 * 
 * @version 2024-02-09T1800
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KBrowserWindow {
    static hostname;
    static isValidState;
    static startDate;
    static minSinceStartDate;
    static timerSplitMs;
    static timerSplit;
    /**
     * synonym for {@link window.location.hostname}.
     */
    static getHostname() {
        return window.location.hostname;
    }
    /** 
     * returns filesafe string of {@link window.location.hostname}.
     */
    static getHostnameFileSafe(){
        return window.location.hostname.replaceAll(/^www\./g, '')
    }
    /**
     *  provided string matches current window hostname. String is first converted to {@link URL} to extract the hostname.
     * 
     * @param urlString string, valid url to compare for match to current window hostname
     * @param throwError boolean throws a sensible error instead of returning boolean
     * @returns boolean
     */
    static matchesHostname(url, throwError = false) {
        if (!throwError && typeof url == 'string' ) { return new URL(url).hostname == window.location.hostname; }
        if (throwError && typeof url == 'string' && new URL(url).hostname != window.location.hostname ) { throw new Error('Window hostname does not support this feature.') }
        return url == window.location.hostname;
    }
    /**
     * Append a div to the current window containing a timestamped message, useful for long running scripts.
     * 
     * @param msgText message to display
     */
    static showMessage(msgText) {
        if (!KBrowserWindow.startDate) { KBrowserWindow.startDate = new Date(); }

        const statID = 'source_BGAGAAFFFBCDECHF';
        if (!document.getElementById(statID)) {
            [(new DOMParser()).parseFromString(
                `<div id='${statID}' style='font-size:20px;position:fixed;top:10px;left:10px;max-width: 100vw;background-color:lightgreen;padding:5px;border:none;z-index:9999'></div>`
                , 'text/html').body.firstChild].forEach(itm => document.body.appendChild(itm));
        }
        [document.getElementById(statID)].forEach(e => e.innerText = `${msgText}, ${(new Date()).toISOString()}`);
    }
}
