### Add  EventTarget methods to any class by extending them with EventObject

```ts
export declare type EventListenerCallback = (event: Event) => any;
export interface EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
}

export declare class EventObject implements EventTarget {

	protected _eventTarget: EventTarget;  // the original element which will receive events binding

    constructor(target?: EventTarget);  // if required a specific target can be selected

    // because Events can bubbles, you can append or remove children like in a Node tree
    readonly childEventObjects: EventObject[];
    readonly parentEventObject: EventObject;

	appendChild(target: EventObject): EventObject;
	removeChild(target: EventObject): EventObject;

    // standard EventTarget methods
    addEventListener(type: string, callback: EventListenerCallback, options?: (EventListenerOptions | boolean)): void;
    dispatchEvent(event: Event): boolean;
    removeEventListener(type: string, callback: EventListenerCallback, options?: (EventListenerOptions | boolean)): void;

```
