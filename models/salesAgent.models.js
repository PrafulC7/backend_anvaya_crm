const mongoose = require('mongoose');

// Sales Agent Schema
const salesAgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sales Agent name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Sales Agent email is required'],
    unique: true,  // Email must be unique across agents
    lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('SalesAgent', salesAgentSchema);
