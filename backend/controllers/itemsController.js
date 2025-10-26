import Item from '../models/Item.js';

// GET /api/items - list current user's items
export const listItems = async (req, res) => {
  try {
    const userId = req.userId;
    const items = await Item.find({ userID: userId, status: { $ne: 'archived' } })
      .sort({ creationTime: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/items/:id - delete an item by id for the current user
export const deleteItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const item = await Item.findOneAndDelete({ _id: id, userID: userId });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    res.status(200).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/items - create an item for current user
export const createItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, expirationDate, purchaseDate, status } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });

    const doc = await Item.create({
      userID: userId,
      name: String(name).trim(),
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      status: status || 'active',
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
