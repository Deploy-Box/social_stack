import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Linking } from 'react-native';
import { authAPI } from '../api/api';

export default function LoginScreen() {


    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await authAPI.initiateLogin();
            if (response.authorizationUrl) {
                await Linking.openURL(response.authorizationUrl);
            }
            console.log(response);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View>
            <Button title="Login" onPress={handleLogin} />
        </View>
    )
}