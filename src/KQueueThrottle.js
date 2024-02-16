
/**
 * {@link KQueueIterator} simple queue with functions for worker, callback, stop, retry and finally. 
 * Stop and retry alter the delay between worker items.
 * Flow: .push -> .start 
 *                  -> ( worker(inData) -> callback ) -> Retry controler + throtle controler     
 *                  -> finally                 
 * @version 2024-02-16T1800
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KQueueIterator {
    static SUCCESS = 0;
    static RETRY = 1;
    static STOP = 3;
    queueStartedCount = 0;
	workFunc = function(){};
	finallyFunc = function(){};
	maximumTimeout = 3000;
	itemResultSuccess = [];
    itemActions_T = { thenFunc: function(){}}
    itemResult_T = {result: false, delay: 0, fail: 0, sucess: 0}
    constructor(workerFunc, finallyFunc = function(){}, maximumTimeout = 3000) {
        this.workFunc = workerFunc;
        this.finallyFunc = finallyFunc;
        this.maximumTimeout = maximumTimeout;
		this._reset();
		console.assert( true, `construct()   ${typeof this.workFunc}, ${workerFunc}`);
	}
    iterate(iterableClass, thenFunc){
		console.assert(true, 'iterate(')
        if(iterableClass){
            if(typeof iterableClass.hasNext != 'function' || typeof iterableClass.next != 'function' )
            {throw new Error(`iterableClass must contain methods 'boolean hasNext()' and 'array next()', ${typeof iterableClass.hasNext} ${typeof iterableClass.next} `)}
            this.iterable = iterableClass;
            this.thenFunc = thenFunc;
			if(this.iterable.hasNext()){
				this._push(this.iterable.next(), this.thenFunc);
			}
        }
    }
    _reset(){
        this.timeDelay = 500;
        this.itemsQueue = [];
        this.itemsQueueIntervalId = undefined;
        this.itemsInProcess = [];
        this.itemResults = [];
        this.itemResultSuccess = [this.maximumTimeout];
        this.itemResultRetry = [0];
        this.queueTimerStarted = (new Date());
        this.queueTimerNextSplit = (new Date());
        console.assert( true, `_reset() ${this.itemsQueue.length}`);
		
	}
    _restartInterval(){
        console.warn( true, `_restartInterval() interval: ${this.itemsQueueIntervalId}`);
        clearInterval(this.itemsQueueIntervalId);
        this.itemsQueueIntervalId = undefined;
        this._startSynchronous();
    }
    _stopInterval(){
        console.assert( true, `_stopInterval() interval: ${this.itemsQueueIntervalId}`);
        clearInterval(this.itemsQueueIntervalId);
        this.itemsQueueIntervalId = undefined;
        KBrowserWindow.showMessage('STOPPED');
        this.finallyFunc();
        this._reset();
    }
    _push(inData, thenFunc) {
        console.assert( true, 'push')
		let inObj = Object.create(this.itemActions_T);
		console.assert( true,`${typeof inData} ${typeof thenFunc}`)
        if(typeof inData != 'object' || typeof thenFunc != 'function')
		{ throw new Error(`usage: _push(inData = {}, thenFunc = function(){}), ${typeof inData} ${typeof thenFunc}`)}
        if (!Array.isArray(inData)) { inData = [inData]; }
        for (let idx in inData){ this.itemsQueue.push( { dat: inData[idx], thenFunc: thenFunc }); }
        console.assert( true, 'items in queue', this.itemsQueue.length);
        if (!this.itemsQueueIntervalId) { this.queueTimerStarted = (new Date()); this._startSynchronous(); };
    }
    _startSynchronous(){
        let me = this; let meStartId = me.queueStartedCount++;
        console.assert( true, `_start() ${me.itemsQueue.length} items at ${me.timeDelay} sec`);
        if(me.itemsQueueIntervalId){me._stopInterval();}
        //if(!me.itemsQueue || me.itemsQueue.length < 1){return;}
        me.itemsQueueIntervalId = setInterval(async function () {
            console.assert( true, `next item, cyc: ${meStartId}; ${me.itemsQueueIntervalId}  ${me.itemsQueue.length}, ${me.itemsInProcess.length}`);
            let itm = me.itemsQueue.pop();
            let minSinceStartDate = (((new Date()) - me.queueTimerStarted) / (1000 * 60)).toFixed(2);
            let lastSplitMs = ((new Date()) - me.queueTimerNextSplit).toFixed(0);
            me.queueTimerNextSplit = new Date();
            let msg = `got: ${meStartId}/${me.itemResults.length} of ${me.itemsQueue.length + me.itemsInProcess.length}; runTime: ${minSinceStartDate} min; sinceLast: ${lastSplitMs} ms `;
            console.assert( true, msg);
            KBrowserWindow.showMessage(msg);
            if (itm) {
                me.itemsInProcess.push(me.timeDelay);
				console.assert(true, `_start() ${itm.dat} ${typeof me.workFunc}`)
                me.workFunc(itm.dat).then(rslt => {
					let outcome = itm.thenFunc(rslt)
					switch( outcome ){
                        case KQueueIterator.SUCCESS: 
                            me._onSuccess(itm);
                            break;
                        case KQueueIterator.RETRY:
                            me._onRetry(itm);  console.warn('KQueueIterator: re-queued.'); 
                            break;
						case undefined:
						case KQueueIterator.STOP:
                            console.assert( true, `stopping at KQueueIterator.STOP. ${me.itemsQueueIntervalId }`);
                            me._stopInterval(); return;
                            break;
                        default:
                            console.assert( true, `stopping at default. ${me.itemsQueueIntervalId }`);
                            me._stopInterval();
                            throw new Error(`KQueueIterator: thenFunc returned ${outcome} expected KQueueIterator.SUCCESS, KQueueIterator.RETRY or KQueueIterator.STOP`);
                    }
	                /* if(me.itemsQueue.length < 1 && me.itemsInProcess.length < 1) { 
						if(me.iterable.hasNext()){me._push(me.iterable.next(), me.thenFunc); console.warn('KQueue: fetch next.'); }
		                else {me._reset(); console.warn('KQueueIterator: empty A STOPPED');  return;}
					} */
                });
            }
            else { 
				if(me.iterable.hasNext()){me._push(me.iterable.next(), me.thenFunc); console.warn('KQueueIterator: fetch next.'); }
				else if (me.itemsQueue.length < 1 && me.itemsInProcess.length < 1){ console.assert( true, `stopping at ELSE. ${me.itemsQueueIntervalId }`); me._stopInterval(); return;}
            }
        }, me.timeDelay);
		console.assert( true, 'KQueueIterator: setInterval( exit.');
    }
    _onRetry(itm){
        this.itemsInProcess.pop();
        this.itemsQueue.push(itm); 
        this.itemResultRetry.push(this.timeDelay);
        this.itemResults.push(Object.assign(Object.create(this.itemResult_T),{
                result: false, queueCount: this.itemsQueue.length, okCount: this.itemResultSuccess.length
                , delay: this.timeDelay, fail: Math.max(...this.itemResultRetry), success: Math.min(...this.itemResultSuccess)
        }));
        /* restart queue with INCREASED time delay */
        this.timeDelay = Math.ceil(Math.max(...this.itemResultRetry) * 1.5);
        this.itemResultRetry = [Math.max(...this.itemResultRetry)];
        this._restartInterval()
    }
    _onSuccess(itm){
        this.itemsInProcess.pop();
        this.itemResultSuccess.push(this.timeDelay);
        if(this.itemResultSuccess.length > 10 && this.timeDelay > 100){
			console.assert( true, `successResult ${this.itemResultSuccess.length} items`)
	        this.itemResults.push(Object.assign(Object.create(this.itemResult_T),{
	                result: true, queueCount: this.itemsQueue.length, okCount: this.itemResultSuccess.length
	                , delay: this.timeDelay, fail: Math.max(...this.itemResultRetry), success: Math.min(...this.itemResultSuccess)
	        }));
	        /* restart queue with DECREASED time delay */
	        this.timeDelay = Math.ceil(this.timeDelay - (Math.abs(Math.min(...this.itemResultSuccess) - Math.max(...this.itemResultRetry)) / 4));
	        this.itemResultSuccess = [Math.min(...this.itemResultSuccess)];
            this._restartInterval();
		}
    }
}
