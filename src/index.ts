/**
 * @description Server and REST API config
 */
import * as bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import http from 'http';
import {
	CabRoutes, CommonRoutesConfig
} from './routes';

export const routes: Array<CommonRoutesConfig> = [];
const app = express();
const server = new http.Server(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const health = (req: Request, res: Response) => {
	res.json({ message: 'working', env: process.env.NODE_ENV, headers: req.headers });
};
app.get('/', health);

routes.push(new CabRoutes(app));

export default server;
