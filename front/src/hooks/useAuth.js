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

        const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmhfUFDgBnBquXiui+uv7dPlSZpPMYAiRXTgLdqS+wFX2hadTRFSiyxFEfwun5oPHwIk9GKmKqWODnvTZtmZ+Ig6MiDLybs2uAmo6NxkFAEyD5QZl+V4O4257byDd6GrQXxhyHQVlc9Wu4JiVu99x4nnimOuru20TW33B3o1w1dtWbmAeB8aJDDqMaGscIHes+hqKpkRCjQ29kTUwGMMThJi7Mzg8S9fj/J5D+fUCAmRHUzjQICKkpDNxe6Wh5feEiLOeO7RDnSwA4NUFCkgwteDzi9LVG/aOzMRnVImnFo7eePIUtqBDoTvTM/Vy5+5tmFtq5xvk6ESPz+QdIunxSQIDAQAB\n-----END PUBLIC KEY-----`;

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
