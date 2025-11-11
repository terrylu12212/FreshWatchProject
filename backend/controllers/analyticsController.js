import Item from '../models/Item.js';

// GET /api/analytics
// Computes summary stats and simple 6-week time series based on item status & dates.
// Assumptions: An item is "consumed" if status === 'consumed'; "expired" if status === 'expired'; otherwise it's active.
// Efficiency = consumed / (consumed + expired) among items that have left the active state.
// WasteRate = expired / (consumed + expired).
// Avg Shelf Life = average (expirationDate - purchaseDate) in days for items with both dates.
// Soon Expiring = active items with expirationDate within next 3 days.
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const items = await Item.find({ userID: userId }).lean();
    const now = Date.now();
    let consumed = 0, expired = 0;
    let shelfLifeTotal = 0, shelfLifeCount = 0;
    let soonExpiring = 0;
    let activeCount = 0;
    let total = items.length;

    // Prepare 6 week buckets (oldest first)
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      const end = now - (5 - i) * 7 * 86400000; // inclusive end of bucket
      const start = end - 7 * 86400000;         // start of bucket
      weeks.push({ label: `W${i + 1}`, start, end, consumed: 0, expired: 0 });
    }

    items.forEach(it => {
      const status = it.status;
      if (status === 'consumed') consumed++;
      else if (status === 'expired') expired++;
      else if (status === 'active') activeCount++;

      if (it.expirationDate && it.purchaseDate) {
        const lifeDays = (new Date(it.expirationDate).getTime() - new Date(it.purchaseDate).getTime()) / 86400000;
        if (lifeDays > 0 && lifeDays < 365) { // sanity cap at 1 year
          shelfLifeTotal += lifeDays;
          shelfLifeCount++;
        }
      }

      if (status === 'active' && it.expirationDate) {
        const daysLeft = (new Date(it.expirationDate).getTime() - now) / 86400000;
        if (daysLeft >= 0 && daysLeft <= 3) soonExpiring++;
      }

      // Time series: use purchaseDate or creationTime to bin when item entered system, then mark outcome.
      const ts = (it.purchaseDate ? new Date(it.purchaseDate).getTime() : new Date(it.creationTime || 0).getTime());
      weeks.forEach(w => {
        if (ts >= w.start && ts < w.end) {
          if (status === 'consumed') w.consumed++;
          else if (status === 'expired') w.expired++;
        }
      });
    });

    const outcomeTotal = consumed + expired;
    const efficiency = outcomeTotal ? consumed / outcomeTotal : 0;
    const wasteRate = outcomeTotal ? expired / outcomeTotal : 0;
    const avgShelfLife = shelfLifeCount ? shelfLifeTotal / shelfLifeCount : 0;

    res.json({
      summary: {
        totalItems: total,
        activeCount,
        consumed,
        expired,
        efficiency, // 0-1
        wasteRate,   // 0-1
        avgShelfLifeDays: avgShelfLife,
        soonExpiring,
      },
      weekly: weeks.map(w => ({ label: w.label, consumed: w.consumed, expired: w.expired }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute analytics', detail: e.message });
  }
};
