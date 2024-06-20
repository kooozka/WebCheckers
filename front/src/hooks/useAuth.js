// useAuth.js or your relevant React component file

import React, { useState, useEffect, useRef } from "react";
import Keycloak from 'keycloak-js';
import * as jose from 'jose';

const useAuth = () => {
    const isRunKC = useRef(false);
    const isRunToken = useRef(false);
    const [isLogin, setLogin] = useState(false);
    const [token, setToken] = useState(null);
    const [decodedToken, setDecodedToken] = useState(null);
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);

    useEffect(() => {
        if (isRunKC.current) return;
        isRunKC.current = true;

        const client = new Keycloak({
            url: 'http://localhost:8888/',
            realm: 'checkers',
            clientId: 'react-client',
        });
        try{
            client.init({ onLoad: "login-required" }).then((res) => {
                setLogin(res);
                setToken(client.token);
            });
        }catch (error){
            console.error(error);
        }

    }, []);

    useEffect(() => {
        if (!token) return;

        const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtNQ28qkn5dGJ7fcVB8BTYj9MMcZepO6HkPx/JPgeGX4okWBkoGADJDQ1VDnKuGgDs6FbJhJiByNalIrZcxT1eg4z+u2Cv+F7Fr92gSQDWUz/YgGYWHGpPPpY+CIuBLCeXTeHzNeNRoLx7BUdCJrjcyRF/ruUGoRV0ceasIO3YJYWu6sDzMLoPt7v9Tft4uubaUyXxg2YG6lRhBK4vFDhcxFaKkrAJa44k4AWgedjRfcPxuQvTBc2r9ziSSykpSza2zBAmUGPgPJdrnWxgpR7uiOjRt5181FeHSfqYotZUR5NENez7AsIJefi9lpH6TcpnqlEwuicqpfHNwhvFxd5hQIDAQAB\n-----END PUBLIC KEY-----`;

        const decodeToken = async () => {
            try {
                // Import the public key
                const key = await jose.importSPKI(publicKeyPEM, 'RS256');

                // Decode and verify the JWT
                const { payload } = await jose.jwtVerify(token, key);

                // Set the decoded payload to state
                console.log(payload)
                // setDecodedToken(payload);
                //here we could send the token to backend for authorization
                console.log(payload.preferred_username);
                setUsername(payload.preferred_username);
                setIsUsernameSet(true)
            } catch (error) {
                console.error('Error verifying JWT:', error);
            }
        };

        decodeToken();
    }, [token]);

    return [isLogin, isUsernameSet, username];
};

export default useAuth;
