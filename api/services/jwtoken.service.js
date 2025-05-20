const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const ClaimTypes = require('../config/claimTypes');


const GenerarToken = (id, email, username, role) => {
    const token = jwt.sign({
        [ClaimTypes.NameIdentifier]: id,
        [ClaimTypes.Name]: email,
        [ClaimTypes.GivenName]: username,
        [ClaimTypes.Role]: role,
        "iss": "cocteles",
        "aud": "coctelesUsuarios"
    },
    jwtSecret, {
        expiresIn: '1h',
        algorithm: 'HS256'
    }
)
    return token;
} 


const TiempoRestanteToken = (req) => {

    try{
        const authHeader = req.headers['authorization'];
        if (!authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);

        const time = (decodedToken.exp * 1000) - Date.now();
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        return { minutes, seconds };
    }catch(error){
        console.log(error);
        return null;
    }

}

module.exports = {
    GenerarToken,
    TiempoRestanteToken
}