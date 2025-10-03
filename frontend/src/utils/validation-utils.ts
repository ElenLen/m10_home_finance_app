interface ValidationOptions {
    pattern?: RegExp;
    compareTo?: string;
    checkProperty?: boolean;
    checked?: boolean;
}

interface ValidationRule {
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    options?: ValidationOptions;
}

export class ValidationUtils {
    static validateForm(validations: ValidationRule[]): boolean {
        let isValid = true;

        for (let i = 0; i < validations.length; i++) {
            if (!ValidationUtils.validateField(validations[i].element, validations[i].options)) {
                isValid = false;
            }
        }
        return isValid;
    }

    static validateField(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, options?: ValidationOptions): boolean {
        let condition: boolean | RegExpMatchArray | null = !!element.value;

        if (options) {
            if (options.pattern !== undefined) {
                condition = element.value ? element.value.match(options.pattern) : null;
            } else if (options.compareTo !== undefined) {
                condition = element.value ? element.value === options.compareTo : false;
            } else if (options.checkProperty !== undefined) {
                condition = options.checkProperty;
            } else if (options.checked !== undefined) {
                if ("checked" in element) {
                    condition = element.checked;
                }
            }
        }

        if (condition) {
            element.classList.remove('is-invalid');
            return true;
        } else {
            element.classList.add('is-invalid');
            return false;
        }
    }
}