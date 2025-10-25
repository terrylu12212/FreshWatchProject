import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FoodTemplateSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameLowerCase: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Produce', 'Dairy', 'Meat', 'Seafood', 'Grains', 'Pantry Staples', 'Frozen', 'Beverages', 'Snacks', 'Other'],
    default: 'Other'
  },
  defaultWeeks: {
    type: Number,
    default: 0,
    min: 0
  },
  defaultDays: {
    type: Number,
    default: 0,
    min: 0
  },
  timesUsed: {
    type: Number,
    default: 1,
    min: 1
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient searching by user and name prefix
FoodTemplateSchema.index({ userId: 1, nameLowerCase: 1 });

// Pre-save middleware to update nameLowerCase
FoodTemplateSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.nameLowerCase = this.name.toLowerCase();
  }
  next();
});

const FoodTemplate = mongoose.model('FoodTemplate', FoodTemplateSchema);

export default FoodTemplate;
