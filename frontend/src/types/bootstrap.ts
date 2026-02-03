import {BootstrapModal} from "./bootstrap-modal";

export interface Bootstrap {
    Modal: {
        new (element: HTMLElement, options?: any): BootstrapModal;
    };
}