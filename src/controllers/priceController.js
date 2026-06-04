const Price = require('../models/Price');

// POST /admin/prices
const createPrice = async (req, res, next) => {
  try {
    const { materialName, pricePerKg, priceChange, city } = req.body;

    if (!materialName || !materialName.trim()) {
      return res.status(400).json({ success: false, error: 'Material name is required' });
    }

    if (pricePerKg === undefined || isNaN(pricePerKg) || pricePerKg < 0) {
      return res.status(400).json({ success: false, error: 'Valid price per KG is required' });
    }

    const price = new Price({
      materialName: materialName.trim(),
      pricePerKg: Number(pricePerKg),
      priceChange: priceChange !== undefined ? Number(priceChange) : 0,
      city: city ? city.trim() : 'Mumbai',
      updatedBy: req.admin.adminId
    });

    await price.save();

    return res.status(201).json({
      success: true,
      message: 'Price record created successfully',
      price
    });
  } catch (error) {
    next(error);
  }
};

// GET /prices & GET /admin/prices
const getPrices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.city) {
      filter.city = new RegExp(req.query.city.trim(), 'i');
    }

    const prices = await Price.find(filter)
      .populate('updatedBy', 'name email')
      .sort({ materialName: 1 });

    return res.status(200).json({
      success: true,
      count: prices.length,
      prices
    });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/prices/:id
const updatePrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { materialName, pricePerKg, priceChange, city } = req.body;

    const priceRecord = await Price.findById(id);
    if (!priceRecord) {
      return res.status(404).json({ success: false, error: 'Price record not found' });
    }

    if (materialName !== undefined) {
      if (!materialName.trim()) {
        return res.status(400).json({ success: false, error: 'Material name cannot be empty' });
      }
      priceRecord.materialName = materialName.trim();
    }

    if (pricePerKg !== undefined) {
      if (isNaN(pricePerKg) || pricePerKg < 0) {
        return res.status(400).json({ success: false, error: 'Valid price per KG is required' });
      }
      // Compute change dynamically relative to previous price
      const oldPrice = priceRecord.pricePerKg;
      const newPrice = Number(pricePerKg);
      priceRecord.priceChange = newPrice - oldPrice;
      priceRecord.pricePerKg = newPrice;
    } else if (priceChange !== undefined) {
      priceRecord.priceChange = Number(priceChange);
    }

    if (city !== undefined) {
      priceRecord.city = city.trim();
    }

    priceRecord.updatedBy = req.admin.adminId;
    await priceRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Price record updated successfully',
      price: priceRecord
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/prices/:id
const deletePrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const priceRecord = await Price.findByIdAndDelete(id);

    if (!priceRecord) {
      return res.status(404).json({ success: false, error: 'Price record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Price record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrice,
  getPrices,
  updatePrice,
  deletePrice
};
