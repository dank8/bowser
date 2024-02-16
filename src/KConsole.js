/**
 * KConsole logging that limits message based on caller name and threshold
 */
class KConsole{
    __class_version = '2024-02-09T1100'
    __source = 'http://github.com/dank8/codeOort/tree/main/js_browser_scripts'
    __author = 'By Dan, http://github.com/dank8'
    __note = 'logging that limits message based on caller name and threshold'
    static calleeName;
    static calleeNameType = 0; // 0: null, 1:value, 2: empty value
    static threshold = 0; // 3: log,  4: warn, 5: error
    static callDetail;
    static init(callName, threshold){
        if(typeof threshold != 'number' || typeof callName != 'string'){ throw new Error('usage: init(string, number)')}
        KConsole.setMinimumLevel(threshold);
        KConsole.setCalleeName(callName);
        
    }
    static setMinimumLevel(threshold){
        if(threshold > -1 && threshold < 7)
        {KConsole.threshold = threshold;}
    }
    static reset(){
        KConsole.calleeName = null;
        KConsole.calleeNameType = 0;
        KConsole.threshold = 0;
    }
    static setCalleeName(callName){
        
        if(typeof callName == 'string' )
        {
            KConsole.calleeName = callName;
            if(callName == '')
            { KConsole.calleeNameType = 2; }
            else
            { KConsole.calleeNameType = 1; }
        }
    }
    static log(msg){
        if(3 < KConsole.threshold){return;}
        if(KConsole.calleeNameType == 0){console.assert( true, msg); return;}
        if( KConsole.isWritable(KConsole._callee(new Error().stack) ) );
        {console.log(`[${KConsole.callDetail.callee}] ${msg}`);}
    }
    static warn(msg){
        if(4 < KConsole.threshold){return;}
        if(KConsole.calleeNameType == 0){console.warn(msg); return;}
        if(KConsole.isWritable( KConsole._callee(new Error().stack) ) );
        {console.warn(`[${KConsole.callDetail.callee}] ${msg}`);}
    }
    static error(msg){
        if(5 < KConsole.threshold){return;}
        if(KConsole.calleeNameType == 0){console.error(msg); return;}
        if(KConsole.isWritable(KConsole._callee(new Error().stack) ) );
        {console.error(`[${KConsole.callDetail.callee}] ${msg}`);}
    }
    static isWritable(callName){
        console.assert( true, 'iswrite', typeof callName, callName)
        let allowByName = {
              isEmpty: KConsole.calleeNameType == 2 && callName == ''
            , isValue: KConsole.calleeNameType == 1 && callName != '' && KConsole.calleeName.startsWith(callName)
        }
        console.assert( true, 'isWritable',Object.values(allowByName), Object.values(allowByName).includes(true))
        return Object.values(allowByName).includes(true);
    }
    static _callee(errorStack){
        let myCall = KConsole._parse(errorStack)[1].callee
        if(typeof myCall != 'string'){throw new Error('_callee(), Expected: string, Actual:' + (typeof myCall) ); }
        return  myCall;
    }
    static _parse(errorStack){
        let returnStack = [];
        errorStack.split('\n').slice(1).forEach( itm => {
            
            let itms = itm.split(/\s+/);
            let errRecord = {callee: '', file: '', lineNum: 0, columnNum: 0 };
            switch(itms.length){
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    errRecord.file = itms[2];
                    break;
                default: /* 4 or more */
                    errRecord.callee = itms[2];
                    if(itms[2] == 'new'){errRecord.callee = itms[3];}
                    errRecord.file = itms[itms.length -1];
            }
            if(errRecord.file){
                let matches = errRecord.file.trim().match(/\(?(?<file>.+?)\:(?<lineNum>[0-9]+)\:(?<columnNum>[0-9]+)\)?$/);
                if(matches){ errRecord = Object.assign(errRecord, matches.groups); }
            }
            returnStack.push(errRecord);
        });
        KConsole.callDetail = returnStack[1]
        return returnStack;
    }
}

class KConsole_Test{
    constructor(){
        KConsole.log('Log msgs do not return');
        KConsole.warn('Warn msgs do not return');
        KConsole.error('Error msgs Yes Please!');
    }
    run(){
        KConsole.log('Log msgs do not return');
        KConsole.warn('Warn msgs do not return');
        KConsole.error('Error msgs Yes Please!');
    }
    
    static mthd(){
        KConsole.log('Log msgs do not return');
        KConsole.warn('Warn msgs do not return');
        KConsole.error('Error msgs Yes Please!');
    }

    static _assert(){
        console.warn('Begin _assert');
        KConsole.init('KConsole_Test', 2);
        console.log(KConsole.calleeNameType, KConsole.calleeName,  KConsole.threshold);
        console.assert( KConsole.isWritable('KConsole_Test') , 'Named callee matches, Expect: Allow'); 
        console.assert( KConsole.isWritable('x') == false  , 'Name value doesnt match, Expect: Block'); 
        console.assert( KConsole.isWritable('') == false , 'Caller Empty not match, Expect: Block'); 
        KConsole.reset();
        KConsole.setCalleeName('');
        console.assert( KConsole.isWritable('KConsole_Test') == false, 'Name not match empty Callee, Expect: Block');
        console.assert( KConsole.isWritable(''), 'Empty match empty Callee, Expect: Allow');
    }
}

function test(){
        console.assert( true, 'function',KConsole._parse(new Error().stack));
        KConsole.log('Log msgs do not return');
        KConsole.warn('Warn msgs do not return');
        KConsole.error('Error msgs Yes Please!');
}

const unnamed = function(){
        console.assert( true, 'anonomous',KConsole._callee(new Error().stack));
        KConsole.log('Log msgs do not return');
        KConsole.warn('Warn msgs do not return');
        KConsole.error('Error msgs Yes Please!');
}


KConsole_Test._assert();

if(true){

//only errors should print from KConsole_Test.run
KConsole.init('KConsole_Test.run', 5);
console.log(KConsole.calleeName, KConsole.calleeNameType, KConsole.threshold)
unnamed;
(new KConsole_Test()).run();
KConsole_Test.mthd();
KConsole.log('Log msgs do not return');
KConsole.warn('Warn msgs do not return');
KConsole.error('Error msgs Yes Please!');
}
