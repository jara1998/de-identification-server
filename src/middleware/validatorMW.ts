import { validationResult } from 'express-validator';

class ValidatorMW {
    async checkErrors(req, res, next) {
        // error check layer
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
}

export default new ValidatorMW();