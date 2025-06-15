const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const ClaimTypes = require('../config/claimTypes');
const GenerarToken = require('../services/jwtoken.service').GenerarToken;


const Authorize = (rol) =>{

    return async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];



        if (!authHeader.startsWith('Bearer ')) {
            
            return res.status(401).json({ message: 'Token no valido'});
            
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);

        if (rol.split(',').indexOf(decodedToken[ClaimTypes.Role]) === -1) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
        }

        req.user = {
            id: decodedToken[ClaimTypes.NameIdentifier],
            username: decodedToken[ClaimTypes.Name],
            fullName: decodedToken[ClaimTypes.GivenName],
            role: decodedToken[ClaimTypes.Role]
      };

        var tiempoRestanteToken = (decodedToken.exp - (new Date()).getTime() / 1000);
        
        
        if (tiempoRestanteToken < 5) {
            var newToken = GenerarToken(decodedToken[ClaimTypes.Name], decodedToken[ClaimTypes.GivenName], decodedToken[ClaimTypes.Role]);
            res.header('Set-Authorization'+ newToken);
        }
        
        
        next();
    }catch(error){
        console.log(error);
        return res.status(401).json();
    }
}
}

module.exports = {
    Authorize
}