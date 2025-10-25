import FoodTemplate from '../models/FoodTemplate.js';

// Get food templates (with optional search)
export const getFoodTemplates = async (req, res) => {
  try {
    const userId = req.userId; // Changed from req.user._id
    const { search } = req.query;

    let query = { userId };

    // If search parameter provided, filter by name prefix
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      query.nameLowerCase = { $regex: `^${searchLower}` };
    }

    const templates = await FoodTemplate.find(query)
      .sort({ timesUsed: -1, lastUsed: -1 }) // Most used and recent first
      .limit(10)
      .select('name category defaultWeeks defaultDays timesUsed');

    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update food template
export const createOrUpdateTemplate = async (req, res) => {
  try {
    const userId = req.userId; // Changed from req.user._id
    const { name, category, defaultWeeks, defaultDays } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const nameLowerCase = name.trim().toLowerCase();

    // Check if template already exists for this user
    let template = await FoodTemplate.findOne({ userId, nameLowerCase });

    if (template) {
      // Update existing template
      template.name = name.trim();
      template.category = category;
      template.defaultWeeks = defaultWeeks || 0;
      template.defaultDays = defaultDays || 0;
      template.timesUsed += 1;
      template.lastUsed = Date.now();
      await template.save();
    } else {
      // Create new template
      template = await FoodTemplate.create({
        userId,
        name: name.trim(),
        nameLowerCase,
        category,
        defaultWeeks: defaultWeeks || 0,
        defaultDays: defaultDays || 0,
        timesUsed: 1,
        lastUsed: Date.now()
      });
    }

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
