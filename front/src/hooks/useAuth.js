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

        client.init({ onLoad: "login-required" }).then((res) => {
            setLogin(res);
            setToken(client.token);
        });
    }, []);

    useEffect(() => {
        if (!token) return;
        // if (isRunToken.current) return;
        // isRunToken.current = true;

        const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Ls+NVT5q23OVExuDZCArx9DZbIccrPawxh+Y/GCU9Ot+HSkzQKlgpIwU1EtDC1XqKFbYOEa7lZXy1n5sIOlGlif7NX5XqdJs6pw8+tUXmWyx90WcVqUwJjmabkrfapb+hpjk1rdn2/s+WZdo42dpRBSmV1p04JPniynYT9/Vbm5op9osGI80Snexg+XNjeTvqwUopY0rke0Lu/IzL5eeGxA9RwtHpqZBJVCHFbJ/H+k6hzdk6dNQmeR63TP2widdSDAso3pjg3Aql438nGRlJsSpXnWuVQOjaZW1d9NC36NZYN13Rcbyq45AJu4CIla1KC/PhkNY8eq6vH9IEb7kwIDAQAB\n-----END PUBLIC KEY-----`;

        const decodeToken = async () => {
            try {
                // Import the public key
                const key = await jose.importSPKI(publicKeyPEM, 'RS256');

                // Decode and verify the JWT
                const { payload } = await jose.jwtVerify(token, key);

                // Set the decoded payload to state
                console.log(payload)
                setDecodedToken(payload);
                console.log(payload.preferred_username);
                setUsername(payload.preferred_username);
                setIsUsernameSet(true)
            } catch (error) {
                console.error('Error verifying JWT:', error);
            }
        };

        decodeToken();
    }, [token]);

    //infinite loop or no effect
    // if (decodedToken && username==null) {
    //     setUsername(decodedToken.preferred_username);
    //     console.log(username);
    //     isRunToken.current = true;
    // }

    return [isLogin, isUsernameSet, username];
};

export default useAuth;
