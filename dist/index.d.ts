import { Mongoose } from "mongoose";
declare var EventEmitter: any;
export interface MMConfig {
    name: string;
    durable: boolean;
    handler: Function;
}
export declare class Service extends EventEmitter {
    constructor(mongoUrl: string, rabbitUrl: string);
    addQueues(queueConfigs: Array<MMConfig>): void;
    getMongooseReference(): Mongoose;
    start(): void;
    publish(queueName: string, payload: object): void;
    _onReady(): void;
    _onLost(): void;
    stop(): void;
}
export {};
