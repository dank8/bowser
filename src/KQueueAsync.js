
/* Example of a simple queue with a worker function that includes a callback
Flow KQueue.push -> KQueue.start -> KQueue.worker -> KItem.response
*/

class KQueue {
    queue = [];
    worker;
    constructor(worker){
        console.log('const')
        this.worker = worker;
    }
  
    push(inData, callback){
        console.log('push')
        let hasItems = (this.queue.length > 0)
        if(!Array.isArray(inData))
        { inData = [inData]; }
        for(let idx in inData)
        { this.queue.push({dat: inData[idx], calbk: callback}); }
        console.log('items in queue', this.queue.length)
        if(!hasItems){this.start()};
    }
      
    start(){
        console.log('start')
      let me = this;
      let interVal = setInterval(async function(){
          let itm = me.queue.pop();
          console.log('next', itm)
          if(!itm){console.log('FIN');clearInterval(interVal); return;}
          me.worker(itm.dat, itm.calbk);
      },998);
    }
}
  
class WorkMsg {
    static async send(data, response) {
        /* generic handling of the response */
        console.log('wrk',data);
        let resp = { greeting:'Hello,' + data.name};
        response(resp);
    } 
}

class OptionOne{
    static response = function(resp){
        
        // arguments.callee no supported in static functions 
        try{console.log('Calling class method:', arguments.callee.caller.name);}catch(e){/* do nothing */}
        let errors = [];


            const paragraph = "The quick brown fox jumps over the lazy dog. It barked.";
            
            const capturingRegex = /(?<animal>fox|cat) jumps over/;
            const found = paragraph.match(capturingRegex);
            console.log('animals',found.groups); // {animal: "fox"}

        
            let errStack = new Error().stack.split('\n').slice(1);
            errStack.forEach( itm => {
                let itms = itm.split(/\s+/g)
                let errRecord = {cls: null, func: null, file: null, lineNum: 0, columnNum: 0 };
                switch(itms.length){
                    case 1:
                        break;
                    case 2:
                        errRecord.file = itms[2];
                        break;
                    default:
                        //console.log('error stack method', itm); 
                        let matches;
                        matches = itms[itms.length -1].trim().match(/\(?(?<file>.+?)\:(?<lineNum>[0-9]+)\:(?<columnNum>[0-9]+)\)?$/);
                        if(matches){ errRecord = Object.assign(errRecord, matches.groups); }
                        matches = itms[2].trim().match(/^(?<cls>[^.]+)\.(?<func>.*)$/);
                        if(matches)
                        { errRecord = Object.assign(errRecord, matches.groups);}
                        else
                        {errRecord.func = itms[2]}

                }
                console.log('error stack method', itm, errRecord); 
                errors.push(errRecord);
            });
            //console.log('error stack method', JSON.stringify(errors)); 


        /* bespoke handling of the response */
        console.log('Option1',resp.greeting)
    }
}
class OptionTwo{
    static response = function(resp){
        /* bespoke handling of the response */
        console.log('Option2',resp.greeting)
    }
}

let myQ = new KQueue(WorkMsg.send)
myQ.push([{name:'Daniel'},{name:'Susan'},{name:'Amy'}], OptionOne.response);
myQ.push([{name:'Daniel'},{name:'Susan'},{name:'Amy'}], OptionTwo.response);
console.log('Main Script FIN.')
