export class StatusCode {
	static OK: number = 200;
	static INTERNAL_SERVER_ERROR: number = 500;
	static BAD_REQUEST: number = 400;
	static UNAUTHORIZED: number = 401;
}

export interface ICabsListInterface {
	id: number;
	color: 'RED' | 'PINK' | 'BLACK' | 'WHITE';
	longitude: number;
	latitude: number;
	name: string;
	booked?: boolean;
	bookingId?: string;
}