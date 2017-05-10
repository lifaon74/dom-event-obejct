export type EventListenerCallback = (event: Event) => any;

export interface EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
}

export class EventObject implements EventTarget {
  protected _eventTarget: EventTarget;

  constructor(target?: EventTarget) {
    this._eventTarget = target || document.createDocumentFragment();
  }

  addEventListener(type: string, callback: EventListenerCallback, options?: (EventListenerOptions | boolean)): void {
    this._eventTarget.addEventListener(type, callback, <any>options);
  }

  dispatchEvent(event: Event): boolean {
    return this._eventTarget.dispatchEvent(event);
  };

  removeEventListener(type: string, callback: EventListenerCallback, options?: (EventListenerOptions | boolean)): void {
    this._eventTarget.removeEventListener(type, callback, <any>options);
  }

  appendChild(target: (EventObject | any)) {
    if('appendChild' in this._eventTarget) {
      if(target instanceof EventObject) {
        (<Element>this._eventTarget).appendChild((<Element>target._eventTarget));
      } else {
        (<Element>this._eventTarget).appendChild(target);
      }
    } else {
      throw new Error('Target doen\'t support appendChild');
    }
  }

  removeChild(target: (EventObject | any)) {
    if('removeChild' in this._eventTarget) {
      if(target instanceof EventObject) {
        (<Element>this._eventTarget).removeChild((<Element>target._eventTarget));
      } else {
        (<Element>this._eventTarget).removeChild(target);
      }
    } else {
      throw new Error('Target doen\'t support removeChild');
    }
  }

}
