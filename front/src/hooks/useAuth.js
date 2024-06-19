import React, {useState, useEffect, useRef} from "react";
import Keycloak from 'keycloak-js';

const useAuth = ()=>{
    const isRun = useRef(false);
    const [isLogin, setLogin] = useState(false);
    useEffect(() => {
        //prevents React strict mode from executing this twice
        if (isRun.current) {return}
        isRun.current=true;
        const client = new Keycloak({
            url: 'http://localhost:8888',
            realm: 'checkers',
            clientId: 'react-client',
        });
        client.init({onLoad: "login-required"}).then((res) => setLogin(res));
    }, []);

    return isLogin;
}

export default useAuth;

