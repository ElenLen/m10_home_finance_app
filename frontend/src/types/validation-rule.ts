import {ValidationOptions} from "./validation-options";

export interface ValidationRule {
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    options?: ValidationOptions;
}