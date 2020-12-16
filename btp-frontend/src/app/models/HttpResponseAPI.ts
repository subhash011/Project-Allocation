export class HttpResponseAPI {
    statusCode: number;
    message: string;
    result: any;

    static handleError(err) {
        console.log(err);
    }
}
