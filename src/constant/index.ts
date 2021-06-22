export class CustomeResponse {
    static success = ({
        data,
        message,
        success
    }: {
        data: any;
        success: boolean;
        message: string;
    }): ({
        data: any;
        success: boolean;
        message: string;
    }) => {
        return {
            data,
            message,
            success
        }
    }
    static error = ({
        data,
        message,
    }: {
        data: any;
        message: string;
    }): ({
        data: any;
        success: boolean;
        message: string;
    }) => {
        return {
            data,
            message,
            success: false
        }
    }
}