const bcrypt = require('bcrypt');
const { DeviceRegistration } = require('../models');
const { GenerarToken, TiempoRestanteToken  } = require('../services/jwtoken.service');

let self = {};

self.registerDevice = async function(req,res){
    const {deviceId, registrationToken, platform} = req.body;
    const userId= req.user?.id;

    console.log("DeviceId: ", deviceId);
    console.log("RegistrationToken: ", registrationToken);
    console.log("userI: ", userId );

    try{
        const[device,created] = await DeviceRegistration.upsert({
            user_id: userId,
            device_id: deviceId,
            registration_token: registrationToken,
            platform,
            last_updated: new Date(),
        },{returning: true});

        return res.status(200).json({success: true, device: device});

    }catch(err){
        return res.status(500).json({success: false, message: 'Error al registrar el dispositivo', error: err.message});
    }
}

self.unregisterDevice = async function(req,res){
    const {deviceId} = req.params;
    const userId = req.user.id;

    try{
        await DeviceRegistration.destroy({
            where: {
                user_id: userId,
                device_id: deviceId
            }
        });
    }catch(err){
        return res.status(500).json({success: false, message: 'Error al eliminar el dispositivo', error: err.message});
    }
}

module.exports = self;