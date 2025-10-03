export interface RouteType {
    route: string;
    title: string;
    filePathTemplate: string;
    useLayout: string | false | undefined;
    styles?: string[];
    scripts?: string[];
    load?: () => void;
    unload?: () => void;
}