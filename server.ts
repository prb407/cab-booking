import server, { routes } from './src';
import logger from './src/logger';
import { CommonRoutesConfig } from './src/routes';
const port = process.env.PORT || 8081;

server.listen(port, () => {
	logger.info(`server started on port ${port}`);
	routes.forEach((route: CommonRoutesConfig) => {
		logger.debug(`routing for ${route.getName()} intialized.`)
	})
});
