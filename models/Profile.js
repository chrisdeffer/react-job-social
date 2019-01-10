const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProfileSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    company: {
        type: String
    },
    website: {},
    location: {},
    status: {},
    skills: {
        type: [String],
        required: true
    },
    bio: {
        type: String
    },
    githubusername: {},
    experience: [],
    education: [],
    social: {},
    date: {}



})

module.exports = Profile = mongoose.model('profile', ProfileSchema)