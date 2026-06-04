const Category = require('../models/Category');

// POST /admin/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const normalizedName = name.trim();

    // Prevent duplicate category names
    const existing = await Category.findOne({ name: new RegExp(`^${normalizedName}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category name already exists' });
    }

    const category = new Category({
      name: normalizedName,
      description: description ? description.trim() : '',
      icon: icon ? icon.trim() : '',
      isActive: isActive !== undefined ? !!isActive : true
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// GET /categories & GET /admin/categories
const getCategories = async (req, res, next) => {
  try {
    const filter = {};
    
    // For non-admin public requests, we can optionally filter by isActive
    // Check if request is authenticated as admin
    const isAdmin = !!(req.admin && req.admin.role === 'admin');
    if (!isAdmin) {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, error: 'Category name cannot be empty' });
      }
      const normalizedName = name.trim();
      // Check for duplicate name if changed
      if (normalizedName.toLowerCase() !== category.name.toLowerCase()) {
        const existing = await Category.findOne({ name: new RegExp(`^${normalizedName}$`, 'i') });
        if (existing) {
          return res.status(400).json({ success: false, error: 'Category name already exists' });
        }
      }
      category.name = normalizedName;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (icon !== undefined) {
      category.icon = icon.trim();
    }

    if (isActive !== undefined) {
      category.isActive = !!isActive;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};
