/* eslint-disable @typescript-eslint/no-explicit-any */
/** @module RESTManager */
import { RequestOptions } from "../types/RequestHandler";

export class RestManager {
    private readonly baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async sendRequest<T>(options: RequestOptions): Promise<T> {
        const { method, path, body, headers } = options;
        const url = `${this.baseURL}/${path}`;

            let requestBody = body;
            const contentType = headers?.["Content-Type"] || headers?.["content-type"];
            if (body && contentType === "application/json") {
                requestBody = JSON.stringify(body) ;
            }
        const response = await fetch(url, {
            method,
            body:    requestBody as any,
            headers: {
                "Content-Type": contentType || "application/json",
                ...headers,
                "User-Agent":   "@game28/smartschool.js"
            }
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`${response.status}: ${JSON.stringify(responseData)}`);
        }

        const responseData = await response.json();
        return responseData as T;
    }

    async delete<T>(path: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
        const urlParams = new URLSearchParams(params).toString();
        const urlPath = urlParams ? `${path}?${urlParams}` : path;
        return this.sendRequest<T>({
            method:  "DELETE",
            path:    urlPath,
            headers: options?.headers
        });
    }
    async get<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        const urlParams = new URLSearchParams(params).toString();
        const urlPath = urlParams ? `${path}?${urlParams}` : path;
        console.log("URL Params:", urlParams);
        console.log("Full URL Path:", urlPath);
        return this.sendRequest<T>({
            method: "GET",
            path:   urlPath,
            headers
        });
    }

    async post<T>(path: string, body: any, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
        const urlParams = new URLSearchParams(params).toString();
        const urlPath = urlParams ? `${path}?${urlParams}` : path;
        return this.sendRequest<T>({
            method:  "POST",
            path: urlPath,
            body,
            headers: options?.headers
        });
    }

    async put<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
        return this.sendRequest<T>({
            method:  "PUT",
            path,
            body,
            headers: options?.headers
        });
    }

    async patch<T>(path: string, body: any, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
        const urlParams = new URLSearchParams(params).toString();
        const urlPath = urlParams ? `${path}?${urlParams}` : path;
        return this.sendRequest<T>({
            method:  "PATCH",
            path: urlPath,
            body,
            headers: options?.headers
        });
    }
}
