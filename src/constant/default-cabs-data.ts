import { ICabsListInterface } from "../types"

export const defaultCabs = () => {
    return [{
        color: 'BLACK',
        latitude: 21.198115,
        longitude: 72.770089,
        name: 'monarch',
        booked: false //monarch
    }, {
        color: 'PINK',
        latitude: 21.200845,
        longitude: 72.781871,
        name: 'lp savani circle',
        booked: false
    }, {
        color: 'RED',
        latitude: 21.211171,
        longitude: 72.789413,
        name: 'dwrakadhish society',
    }].map(({ booked,
        longitude, latitude,
        color,
        name
    }, index) => (
        {
            booked,
            longitude, latitude,
            color,
            id: index + 1,
            name
        }
    )) as ICabsListInterface[]
}