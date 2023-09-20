import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import { 
    VALIDATOR_REQUIRE, 
    VALIDATOR_MINLENGTH 
} from '../../shared/util/validators'; 
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './PlaceForm.css';

const UpdatePlace = (props) => {
    const authCtx = useContext(AuthContext);
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [loadedPlace, setLoadedPlace] = useState();
    const placeId = useParams().placeId;
    
    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        },
        address: {
            value: '',
            isValid: false
        }
    }, false);

    const history = useHistory();

    useEffect(() => {
        sendRequest(`http://localhost:5000/api/places/${placeId}`)
            .then((resData) => {
                setLoadedPlace(resData.place);
                setFormData({
                    title: {
                        value: resData.place.title,
                        isValid: true
                    },
                    description: {
                        value: resData.place.description,
                        isValid: true
                    },
                    address: {
                        value: resData.place.address,
                        isValid: true
                    }
                }, true);
            })
            .catch((err) => {});
    }, [sendRequest, placeId, setFormData])

    if (isLoading) {
        return (
            <div className='center'>
                <LoadingSpinner />
            </div>
        );
    }

    if (!loadedPlace && !error) {
        return (
            <div className='center'>
                <Card>
                    <h2>Could not find place</h2>
                </Card>
            </div>
        );
    }

    const placeUpdateSubmitHandler = (event) => {
        event.preventDefault();
        sendRequest(`http://localhost:5000/api/places/${placeId}`, 'PATCH', JSON.stringify({
                title: formState.inputs.title.value,
                description: formState.inputs.description.value,
            }),
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authCtx.token
            }
        )
        .then(() => history.push(`/${authCtx.userId}/places`))
        .catch((err) => {});
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {!isLoading && loadedPlace && <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
                <Input 
                    id='title'
                    element='input'
                    type='text'
                    label='Title'
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText='Please enter a valid title.'
                    onInput={inputHandler}
                    initialValue={loadedPlace.title}
                    initialValid={true}
                />
                <Input 
                    id='description'
                    element='textarea'
                    type='text'
                    label='Description'
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText='Please enter a valid description (at least 5 characters).'
                    onInput={inputHandler}
                    initialValue={loadedPlace.description}
                    initialValid={true}
                />
                {/* <Input 
                    id='address'
                    element='input' 
                    type='text' 
                    label='Address' 
                    validators={[VALIDATOR_REQUIRE()]} 
                    errorText='Please enter a valid address.' 
                    onInput={inputHandler}
                    initialValue={formState.inputs.address.value}
                    initialValid={formState.inputs.address.isValid}
                /> */}
                <Button type='submit' disabled={!formState.isValid}>UPDATE PLACE</Button>
            </form>}
        </React.Fragment>
    );
}

export default UpdatePlace;