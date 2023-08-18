import React from 'react';

import UsersList from '../components/UsersList';

const Users = () => {
    const USERS = [
        {
            id: 'u1',
            image: 'https://www.bemytravelmuse.com/wp-content/uploads/2016/01/DSC03000-1.jpg',
            name: 'Max',
            places: 1
        }
    ]
    return (
        <UsersList items={USERS} />
    );
}

export default Users;