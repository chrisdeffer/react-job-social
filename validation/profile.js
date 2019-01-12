const Validator = require('validator')
    //import isEmpty from './is-empty'
const isEmpty = require('./is-empty')

// For each one of routes in routes folder where user puts inputs into form (POST),
// a validation javascript file is created in the validation folder.
// In this file, validation for the /api/profile takes place
module.exports = function validateProfileInput(data) {
    let errors = {}


    data.handle = !isEmpty(data.handle) ? data.handle : ''
    data.status = !isEmpty(data.status) ? data.status : ''
    data.skills = !isEmpty(data.skills) ? data.skills : ''

    if (!Validator.isLength(data.handle, {
            min: 2,
            max: 40
        })) {
        errors.handle = 'handle must be btw 2 and 40 characters'
    }
    if (Validator.isEmpty(data.handle)) {
        errors.handle = 'handle must not be empty'
    }

    if (Validator.isEmpty(data.status)) {
        errors.status = 'status must not be empty'
    }
    if (Validator.isEmpty(data.skills)) {
        errors.skills = 'skills must not be empty'
    }
    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website)) {
            errors.website = 'Not a valid URL'
        }
    }
    // Social sites validate URL (isURL)
    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website)) {
            errors.website = 'Not a valid URL'
        }
    }

    if (!isEmpty(data.facebook)) {
        if (!Validator.isURL(data.facebook)) {
            errors.facebook = 'Not a valid URL'
        }
    }

    if (!isEmpty(data.twitter)) {
        if (!Validator.isURL(data.twitter)) {
            errors.twitter = 'Not a valid URL'
        }
    }

    if (!isEmpty(data.instagram)) {
        if (!Validator.isURL(data.instagram)) {
            errors.instagram = 'Not a valid URL'
        }
    }

    if (!isEmpty(data.linkedin)) {
        if (!Validator.isURL(data.linkedin)) {
            errors.linkedin = 'Not a valid URL'
        }
    }



    return {
        errors,
        isValid: isEmpty(errors)
    }
}