export class HttpResponseAPI {
    success: boolean;
    statusCode: number;
    message: string;
    result: any;

    static handleError(err) {
        console.log(err);
    }

}
