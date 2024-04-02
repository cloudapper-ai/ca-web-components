import { EventEmitter } from "@angular/core";

/**
 * Represents a class that encapsulates a function and its parameter for queuing asynchronous operations.
 * @template T - The type of parameter for the encapsulated function.
 */
export class QueueClass<T> {
    constructor(public func: (param: T) => Promise<void>, public param: T) { }
}

/**
 * Manages a queue of asynchronous operations, executing them sequentially.
 * @template T - The type of parameter for the encapsulated functions in the queue.
 */
export class QueueManager<T> {
    private queue: QueueClass<T>[] = [];

    /**
     * Adds an item to the queue.
     * @param item - The QueueClass instance representing the encapsulated function and its parameter.
     */
    public addInQueue(item: QueueClass<T>) { this.isResetFlag = false; this.queue.push(item); }

    /**
     * Indicates whether the queue is currently processing an item.
     */
    private isRunning: boolean = false;

    /**
     * Returns the current length of the queue.
     * @returns The number of items in the queue.
     */
    public length(): number { return this.queue.length; }


    public onQueueEmpty: EventEmitter<void> = new EventEmitter();

    /**
     * Executes the next item in the queue sequentially.
     * @param inside - A flag indicating if the execution is triggered internally (used for recursive execution).
     */
    public execute(inside: boolean = false) {
        // If the queue is already running and not triggered internally, exit early.
        if (this.isRunning && !inside) { return; }

        // Retrieve the next item from the queue.
        const item = this.queue.pop();

        // If there is an item, mark the queue as running and execute the encapsulated function.
        if (item) {
            this.isRunning = true;
            item.func(item.param).then(() => { this.execute(true); });
        } else {
            // If no more items in the queue, mark the queue as not running.
            this.isRunning = false;
            if (!this.isResetFlag) { if (!this.onQueueEmpty.closed) this.onQueueEmpty.next(); }
        }
    }

    private isResetFlag: boolean = false;
    public reset() {
        this.isResetFlag = true;
        this.queue = []
        this.isRunning = false;
    }
}
