const Validator = require('validator')
    //import isEmpty from './is-empty'
const isEmpty = require('./is-empty')

//const validatePostInput = require('../../validation/post')

module.exports = function validatePostInput(data) {
    let errors = {}


    data.text = !isEmpty(data.text) ? data.text : ''

    if (!Validator.isLength(data.text, {
            min: 10,
            max: 300
        })) {
        errors.text = 'Post must be between 10 - 300 characters'
    }
    if (Validator.isEmpty(data.text)) {
        errors.text = 'Text field is required'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}