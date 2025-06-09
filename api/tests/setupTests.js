const jwt = require('jsonwebtoken');
const ClaimTypes = require('../config/claimTypes');



beforeAll(() => {

    global.adminToken = jwt.sign({
                [ClaimTypes.NameIdentifier]: 1,
                [ClaimTypes.Name]: 'admin',
                [ClaimTypes.GivenName]: 'Admin',
                [ClaimTypes.Role]: 'admin'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    global.userToken = jwt.sign({
                [ClaimTypes.NameIdentifier]: 2,
                [ClaimTypes.Name]: 'userTests',
                [ClaimTypes.GivenName]: 'Usuario Tests',
                [ClaimTypes.Role]: 'user'
    },process.env.JWT_SECRET, { expiresIn: '1h' });
});
