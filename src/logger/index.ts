/**
 *
 *
 * different levels: error, warn, info, verbose, debug, silly
 */

import { get } from 'config';
import * as winston from 'winston';

const { combine, label, timestamp, printf } = winston.format;
const appName: string = get('logger.appName');

const myFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

const options: winston.LoggerOptions = {
	level: get('logger.level'),
	format: combine(label({ label: appName }), timestamp(), myFormat),
	transports: [new winston.transports.Console()],
};

const logger = winston.createLogger(options);
export default logger;
