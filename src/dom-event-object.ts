export type EventListenerCallback = (event: Event) => any;

export interface EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
}

export class EventObject implements EventTarget {
  protected _eventTarget: EventTarget;

  constructor(target?: EventTarget) {
    this._eventTarget = target || document.createElement('div') || document.createDocumentFragment();
    Object.defineProperty(this._eventTarget, '_eventObject', {
      value: this
    });
  }

  get childEventObjects(): EventObject[] {
    const target = this._eventTarget as Node;
    return Array.prototype.concat.apply([], target.childNodes).map((child: Node) => {
      return child['_eventObject'];
    });
  }

  get parentEventObject(): EventObject {
    const target = this._eventTarget as Node;
    if(('parentElement' in target) && (target.parentNode !== null) && ('_eventObject' in target.parentNode)) {
      return target.parentNode['_eventObject'];
    } else {
      return null;
    }
  }

  appendChild(target: EventObject): EventObject {
    (this._eventTarget as Node).appendChild(target._eventTarget as Node);
    return target;
  }

  removeChild(target: EventObject): EventObject {
    (this._eventTarget as Node).removeChild(target._eventTarget as Node);
    return target;
  }

  addEventListener(type: string, callback: EventListenerCallback, options?: (EventListenerOptions | boolean)): void {
    this._eventTarget.addEventListener(type, callback, options as any);
  }

  dispatchEvent(event: Event): boolean {
    return this._eventTarget.dispatchEvent(event);
  };

  removeEventListener(type: string, callback: EventListenerCallback, options?: (EventListenerOptions | boolean)): void {
    this._eventTarget.removeEventListener(type, callback, options as any);
  }

}
