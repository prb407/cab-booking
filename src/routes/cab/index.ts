import { Application, Request, Response } from 'express';
import { CustomeResponse } from '../../constant';
import { defaultCabs } from '../../constant/default-cabs-data';
import logger from '../../logger';
import { ICabsListInterface, StatusCode } from '../../types';
import { CommonRoutesConfig } from '../common/common.routes.config.ts';
import { nanoid } from 'nanoid'
import { calculateDistance } from '../../helpers';

export class CabRoutes extends CommonRoutesConfig {
    cabs: ICabsListInterface[] = defaultCabs()
    bookings: ICabsListInterface[] = []
    constructor(app: Application) {
        super(app, 'CabRoutes');
    }
    /**
     * list and details of cabs
     */
    configureRoutes(): Application {
        /**
         * cabs routes
         */
        this.app.route(`/cabs`).get((req: Request, res: Response) => {
            logger.debug(`inside >>> get cabs handler`)
            try {
                logger.debug(`list of cabs has ${this.cabs.length} number of cabs`)
                logger.debug(`responding with success response`)
                res.status(StatusCode.OK).json(CustomeResponse.success({
                    data: { cabs: this.cabs },
                    message: 'List of cabs available',
                    success: true
                }))
            } catch (error) {
                logger.debug(`error occured while getting list of cabs >>> ${JSON.stringify(error)}`)
                logger.debug(`responding with error response`)
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json(CustomeResponse.error({
                    data: { message: error.message },
                    message: 'error occured while getting list of cabs',
                }))

            }
        })
        /**
         * cab booking routing
         */
        this.app.route(`/cab/book`).post((req: Request, res: Response) => {
            logger.debug(`inside >>> post cab booking handler`)
            try {
                const {
                    longitude,
                    latitude,
                    color
                } = req.body as any
                logger.debug(`req body values : ${JSON.stringify({
                    longitude,
                    latitude,
                    color
                })}`)
                if (
                    !longitude ||
                    !latitude
                ) {
                    return res.status(StatusCode.BAD_REQUEST).json(CustomeResponse.success({
                        data: {
                            error: !longitude ? 'Longitude is missing.'
                                : !latitude
                                    ? 'Longitude is missing.'
                                    : ''
                        },
                        message: 'logitude and latitude are mandatory fields.',
                        success: true
                    }))
                }
                /**
                 * getting list of available cabs from the array
                 */
                logger.debug(`this.cabs : ${JSON.stringify(this.cabs)}`)
                const nearestCab = this.cabs
                    .filter(({ booked, color: cabColor }) => {
                        if (color) {
                            return !booked && color === cabColor
                        } else {
                            return !booked
                        }
                    })
                    .map(({ id, latitude: cabLat, longitude: cabLong, booked, color, name }) => {
                        const distance = calculateDistance({
                            /**
                             * users position
                             */
                            firstPosistion: {
                                lat1: latitude,
                                lon1: longitude
                            },
                            /**
                             * available cab's positions
                             */
                            secondPosistion: {
                                lat2: cabLat,
                                lon2: cabLong
                            },
                            unit: 'K'
                        })
                        return {
                            id,
                            latitude: cabLat,
                            longitude: cabLong,
                            booked,
                            color,
                            distance,
                            name
                        }
                    }).sort(({ distance: distanceA }, { distance: distanceB }) => distanceA - distanceB) // sorting in asceding order
                [0] // index 0 is nearest cab with given distance and color preference if given
                logger.debug(`nearestCab : ${JSON.stringify(nearestCab)}`)
                if (!nearestCab) {
                    logger.debug(`there is no cab near you.`)
                    return res.status(StatusCode.BAD_REQUEST).json(CustomeResponse.success({
                        data: {},
                        message: 'There is no cab near you.',
                        success: true
                    }))
                }
                const bookingId = nanoid(6)
                this.bookings.push({
                    ...nearestCab,
                    bookingId
                })
                const cabIndex = this.cabs.findIndex(({ id }) => id === nearestCab.id)
                const updatedCabData = {
                    ...nearestCab,
                    ...{
                        booked: true
                    }
                }
                this.cabs[cabIndex] = {
                    ...updatedCabData
                }
                console.log('this.cabs')
                console.log(this.cabs)
                console.log('this.bookings')
                console.log(this.bookings)
                res.status(StatusCode.OK).json(CustomeResponse.success({
                    data: {
                        cab: {
                            color: nearestCab.color,
                            distance: nearestCab.distance,
                            name: nearestCab.name
                        },
                        bookingId
                    },
                    message: 'cab booked successfully',
                    success: true
                }))
            } catch (error) {
                logger.debug(`error occured while booking cab >>> ${JSON.stringify(error)}`)
                logger.debug(`responding with error response`)
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json(CustomeResponse.error({
                    data: { message: error.message },
                    message: 'error occured while booking cab',
                }))

            }
        })
        /**
         * complete ride
         */
        this.app.route(`/cab/ride/complete`).post((req: Request, res: Response) => {
            logger.debug(`inside >>> post ride complete handler`)
            try {
                const {
                    longitude,
                    latitude,
                    bookingId
                } = req.body as any
                logger.debug(`req body values : ${JSON.stringify({
                    longitude,
                    latitude,
                    bookingId
                })}`)
                if (
                    !longitude ||
                    !latitude ||
                    !bookingId
                ) {
                    return res.status(StatusCode.BAD_REQUEST).json(CustomeResponse.success({
                        data: {
                            error: !longitude ? 'Longitude is missing.'
                                : !latitude
                                    ? 'Longitude is missing.'
                                    : !bookingId
                                        ? 'Booking id is missing.'
                                        : ''
                        },
                        message: 'logitude, latitude and bookingId are mandatory fields.',
                        success: true
                    }))
                }
                const foundBooking = this.bookings.findIndex(({ bookingId }) => bookingId === bookingId)
                const bookingDetails = this.bookings[foundBooking]
                this.bookings.splice(foundBooking, 1)

                const cabIndex = this.cabs.findIndex(({ id }) => id === bookingDetails.id)
                const distance = calculateDistance({
                    firstPosistion: {
                        lat1: bookingDetails.latitude,
                        lon1: bookingDetails.longitude,
                    },
                    secondPosistion: {
                        lat2: latitude,
                        lon2: longitude,
                    },
                    unit: 'K'
                })
                this.cabs[cabIndex] = {
                    ...this.cabs[cabIndex],
                    ...{
                        latitude,
                        longitude,
                        booked: false
                    }
                }
                console.log('this.cabs')
                console.log(this.cabs)
                console.log('this.bookings')
                console.log(this.bookings)
                res.status(StatusCode.OK).json(CustomeResponse.success({
                    data: {
                        distance,
                        bookingId
                    },
                    message: 'ride completed',
                    success: true
                }))
            } catch (error) {
                logger.debug(`post ride complete handler >>> ${JSON.stringify(error)}`)
                logger.debug(`responding with error response`)
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json(CustomeResponse.error({
                    data: { message: error.message },
                    message: 'error occured in complete ride',
                }))

            }
        })
        return this.app;
    }

}