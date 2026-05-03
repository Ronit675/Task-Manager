import mongoose from 'mongoose'

import { PROJECT_MEMBER_ROLES, PROJECT_STATUSES } from '../constants/domain.js'

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: PROJECT_MEMBER_ROLES,
      default: 'MEMBER',
    },
  },
  {
    _id: false,
  },
)

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: 'ACTIVE',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: 'Project must have at least one member',
      },
    },
  },
  {
    timestamps: true,
  },
)

const Project = mongoose.model('Project', projectSchema)

export default Project
