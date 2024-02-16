/**
 * {@link KQueueWithThrottle} Example of a simple queue that can adjust its delay
 * @version 2024-02-09T1800
 * @author Daniel Kearney <http://github.com/dank8>
 */
class KQueueWithThrottle{
    
    constructor(){
        this.results = []
        this.result = {result: false, delay: 0, fail: 0, sucess: 0}
        this.queueData = [];
        this.itemSuccessDelay = [32000]; // min success is delay ceil
        this.itemRetryDelay = [0]; // max failure is delay floor
        this.timeDelay = 100;
        for(let idx = 0; idx < 100; idx++){
            this.queueData.push(idx);
        }
        this._startSynchronous()
    }
    _startSynchronous(){
        while(this.queueData.length > 0 ){
            this.queueData.pop()
            const coin = Math.round(Math.random() * 10);
            (2 < coin) ? this.onSuccess() : this.onRetry();
        }
    }
    onRetry(){
        this.itemRetryDelay.push(this.timeDelay);
        this.results.push(Object.assign(Object.create(this.result),{result: false, queueCount: this.queueData.length, okCount: this.itemSuccessDelay.length, delay: this.timeDelay, fail: Math.max(...this.itemRetryDelay), success: Math.min(...this.itemSuccessDelay)}));
        this.timeDelay = Math.ceil(Math.max(...this.itemRetryDelay) * 1.5);
        this.itemRetryDelay = [Math.max(...this.itemRetryDelay)]  
    }
    onSuccess(){
        this.itemSuccessDelay.push(this.timeDelay);
        if(this.itemSuccessDelay.length < 10 ){return;}
        this.results.push(Object.assign(Object.create(this.result),{result: true, queueCount: this.queueData.length, okCount: this.itemSuccessDelay.length, delay: this.timeDelay, fail: Math.max(...this.itemRetryDelay), success: Math.min(...this.itemSuccessDelay)}));
        this.timeDelay = Math.ceil(this.timeDelay - (Math.abs(Math.min(...this.itemSuccessDelay) - Math.max(...this.itemRetryDelay)) / 4));
        this.itemSuccessDelay = [Math.min(...this.itemSuccessDelay)];
    }
}

console.warn('Begin...');
const kq = new KQueueWithThrottle();
console.log(JSON.stringify(kq.results).replaceAll(/},{/g,'}\r\n,{'),null,"\t")
console.warn('FIN');
