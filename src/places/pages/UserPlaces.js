import React from 'react';
import { useParams } from 'react-router-dom'

import PlaceList from '../components/PlaceList';

export const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Bulding',
        description: 'One of the most famous scy scrapers in the world!',
        imageURL: 'https://lh3.googleusercontent.com/p/AF1QipOBBZgukGcL1DRhiwcJhYG_2o-1pPv5Wvs2M29B=s680-w680-h510',
        address: '20 W 34th St., New York, NY 10001',
        creator: 'u1',
        location: {
            lat: 40.748351,
            lng: -73.985885
        }
    },
    {
        id: 'p2',
        title: 'Emp Stateeeeee Buldingggggg',
        description: 'One of the most famous scy scrapers in the world!',
        imageURL: 'https://lh3.googleusercontent.com/p/AF1QipOBBZgukGcL1DRhiwcJhYG_2o-1pPv5Wvs2M29B=s680-w680-h510',
        address: '20 W 34th St., New York, NY 10001',
        creator: 'u2',
        location: {
            lat: 40.748351,
            lng: -73.985885
        }
    }
]

const UserPlaces = props => {
    const userId = useParams().userId;
    const loadedPlaces = DUMMY_PLACES.filter(place => place.creator === userId);
    return <PlaceList items={loadedPlaces}/>;
};

export default UserPlaces;
