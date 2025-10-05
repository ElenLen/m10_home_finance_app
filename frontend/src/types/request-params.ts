export interface RequestParams {
    method: string;
    headers: {
        'Content-type': string;
        'Accept': string;
        'x-auth-token'?: string;
    };
    body?: string;
}