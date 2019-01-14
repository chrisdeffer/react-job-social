const express = require('express')
const router = express.Router()
const mongose = require('mongoose')
const passport = require('passport')

const keys = require('../../config/keys')

// Load mongoose db Profile model
const Profile = require('../../models/Profile')
    // Load mongoose db User model
const User = require('../../models/User')
    // Load validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')
    // @route GET /api/profile
    // @desc  get curr user profile
    // @access Private
router.get('/', passport.authenticate('jwt', {
        session: false
    }), (req, res) => {
        const errors = {}
        Profile.findOne({
            user: req.user.id
                // Using populate below, we can bring in fields from user model
                // When users Gets profile, lets also associate the 'name' and 'avatar'
                // from User model
        }).populate('user', ['name', 'avatar']).then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile associated with this user'
                return res.status(404).json(errors)
            }
            res.json(profile)
        }).catch(err => res.status(404).json(err))
    })
    // @route GET /api/profile/all
    // @desc  Get all profile. Anyone can see profiles
    // @access Public
    // Note it may not be in best interest to allow all to see all profiles,
    // If not, change to private route
router.get('/all', (req, res) => {
    const errors = {}
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = 'There are no profiles'
                return res.status(404).json(errors)
            }
            res.json(profiles)
        }).catch(err => res.status(404).json({
            profile: 'There are no profiles'
        }))
})

// @route GET /api/profile/handle/:handle
// @desc  Get profile route by handle backend route. Anyone can see profiles
// @access Public
// Note it may not be in best interest to allow all to see all profiles,
// If not, change to private route
router.get('/handle/:handle', (req, res) => {
        const errors = {}
        Profile.findOne({
                handle: req.params.handle
            })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = "There is no profile for this user"
                    res.status(404).json(errors)
                }

                res.json(profile)
            })
            .catch(err => res.status(404).json(err))
    })
    // @route GET /api/profile/user/:user_id
    // @desc  Get profile route by user_id backend route. Anyone can see profiles
    // @access Public
    // Note it may not be in best interest to allow all to see all profiles,
    // If not, change to private route
router.get('/user/:user_id', (req, res) => {
        const errors = {}
        Profile.findOne({
                user: req.params.user_id
            })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = "There is no profile for this user"
                    res.status(404).json(errors)
                }

                res.json(profile)
            })
            .catch(err => res.status(404).json({
                profile: "-There is no profile for this user"
            }))
    })
    // @route POST /api/profile
    // @desc  create or edit curr user profile
    // @access Private
    // Get Everything in request.body ...
router.post('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const {
        errors,
        isValid
    } = validateProfileInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors)
    }
    // Get fields
    // Fill the profile fields including social stuff object ....
    const profileFields = {}
    profileFields.user = req.user.id
    if (req.body.handle) profileFields.handle = req.body.handle
    if (req.body.company) profileFields.company = req.body.company
    if (req.body.website) profileFields.website = req.body.website
    if (req.body.bio) profileFields.bio = req.body.bio
    if (req.body.location) profileFields.location = req.body.location
    if (req.body.status) profileFields.status = req.body.status
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername
        // Skills - Split into array because they individual items
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',')
    }
    // Social
    profileFields.social = {}
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin

    // Search for user by logged id ...
    Profile.findOne({
        user: req.user.id
    }).then(profile => {
        if (profile) {
            // Update
            // If user has profile, update with below ...
            Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                })
                .then(profile => res.json(profile))
        } else {
            // Create profile if handle exists
            // If no user profile, make sure handle doesn't exist for user id
            Profile.findOne({
                handle: profileFields.handle
            }).then(profile => {
                if (profile) {
                    errors.handle = 'That handle already exists'
                    res.status(400).json(errors)
                }
                // If no handle, create profile
                new Profile(profileFields).save().then(profile => res.json(profile))
            })
        }
    })
})

// @route POST /api/profile/experience
// @desc  add work experience to profile
// @access Private
// router.post(`/${keys.testval}`, passport.authenticate('jwt', {
router.post('experience', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const {
        errors,
        isValid
    } = validateExperienceInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors)
    }
    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to experience array
            profile.experience.unshift(newExp)
            profile.save().then(profile => res.json(profile))
        })
})

// @route POST /api/profile/education
// @desc  add education to profile
// @access Private
router.post('/education', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const {
        errors,
        isValid
    } = validateEducationInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors)
    }
    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to experience array
            profile.education.unshift(newEdu)
            profile.save().then(profile => res.json(profile))
        })
})

// @route DELETE /api/profile/experience
// @desc  remove experience entries profile
// @access Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
                // splice out array (experience entry)
            profile.experience.splice(removeIndex, 1)
                // save the action
            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err))
        })
})

// @route DELETE /api/profile/education
// @desc  remove education entries profile
// @access Private
router.delete('/education/:edu_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)
                // splice out array (education entry)
            profile.education.splice(removeIndex, 1)
                // save the action
            profile.save().then(profile => res.json(profile)).catch(err => res.status(404).json(err))
        })
})

// @route DELETE user and profile
// @desc  DELETE USER AND PROFILE
// @access Private
router.delete('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOneAndRemove({
            user: req.user.id
        })
        .then(() => {
            User.findOneAndRemove({
                _id: req.user.id
            }).then(() => res.json({
                success: true
            }))
        })

})


module.exports = router;