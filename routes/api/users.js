const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

// Form and input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// Load user mongo model
const User = require('../../models/User')

// @route GET /api/users/register
// @desc  register users route
// @access Public
router.post('/register', (req, res) => {
    const {
        errors,
        isValid
    } = validateRegisterInput(req.body)

    // /Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                errors.email = 'Email already exists in system'
                return res.status(400).json(errors)
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //size of image
                    r: 'pg', // rating
                    d: 'mm'
                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: avatar,
                    password: req.body.password
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            console.log('oops')
                        }
                        newUser.password = hash
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))

                    })
                })
            }
        })
})

// @route POST /api/users/login
// @desc  Login User return jwt
// @access Public
router.post('/login', (req, res) => {
        const {
            errors,
            isValid
        } = validateLoginInput(req.body)


        const email = req.body.email
        const password = req.body.password

        // Find user by email
        User.findOne({
                email: email
            })
            .then(user => {
                // Check for user
                if (!user) {
                    errors.email = 'user not found'
                    return res.status(404).json(errors.email)
                }
                // Check Password
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            // User matched
                            const payload = {
                                    id: user.id,
                                    name: user.name,
                                    avatar: user.avatar
                                }
                                // Sign token
                            jwt.sign(payload, keys.secretOrKey, {
                                expiresIn: 9600
                            }, (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            })

                        } else {
                            errors.password = 'invalid password'
                            return res.status(400).json(errors.password)
                        }
                    })
            })
    })
    // @route GET /api/users/current
    // @desc  Return current user
    // @access Private
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    res.json(req.user)
})

module.exports = router;