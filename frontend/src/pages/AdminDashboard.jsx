import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, LogOut, FileText, Calendar, Filter, UserCheck, Eye, Plus, Trash2, Edit, X } from 'lucide-react';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [prices, setPrices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending_review'); // 'pending_review' | 'approved' | 'rejected' | 'all' | 'prices' | 'categories'
  const navigate = useNavigate();

  // Price Modal States
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceMaterialName, setPriceMaterialName] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [priceCity, setPriceCity] = useState('Mumbai');
  const [priceChange, setPriceChange] = useState('0');

  // Category Modal States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [catIsActive, setCatIsActive] = useState(true);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token');
    if (!adminToken) {
      toast.error('Session expired. Please log in again.');
      navigate('/admin/login');
      return;
    }

    if (activeTab === 'prices') {
      fetchPrices();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else {
      fetchUsers(activeTab);
    }
  }, [activeTab]);

  const fetchUsers = async (tab) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
      
      let res;
      if (tab === 'pending_review') {
        res = await api.get('/admin/kyc/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users || []);
      } else {
        const statusParam = tab === 'all' ? '' : `status=${tab}`;
        res = await api.get(`/admin/kyc/all?${statusParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch users');
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
      const res = await api.get('/admin/prices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrices(res.data.prices || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch price records');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
      const res = await api.get('/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    toast.success('Admin logged out');
    navigate('/admin/login');
  };

  // Price CRUD Handlers
  const openAddPriceModal = () => {
    setEditingPrice(null);
    setPriceMaterialName('');
    setPricePerKg('');
    setPriceCity('Mumbai');
    setPriceChange('0');
    setPriceModalOpen(true);
  };

  const openEditPriceModal = (price) => {
    setEditingPrice(price);
    setPriceMaterialName(price.materialName);
    setPricePerKg(price.pricePerKg.toString());
    setPriceCity(price.city || 'Mumbai');
    setPriceChange(price.priceChange ? price.priceChange.toString() : '0');
    setPriceModalOpen(true);
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    if (!priceMaterialName.trim() || !pricePerKg.trim()) {
      toast.error('All fields are required');
      return;
    }

    try {
      const token = sessionStorage.getItem('admin_token');
      const payload = {
        materialName: priceMaterialName.trim(),
        pricePerKg: parseFloat(pricePerKg),
        city: priceCity.trim(),
        priceChange: parseFloat(priceChange)
      };

      if (editingPrice) {
        await api.put(`/admin/prices/${editingPrice._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Price record updated');
      } else {
        await api.post('/admin/prices', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Price record created');
      }
      setPriceModalOpen(false);
      fetchPrices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handlePriceDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this price record?')) return;
    try {
      const token = sessionStorage.getItem('admin_token');
      await api.delete(`/admin/prices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Price record deleted');
      fetchPrices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Deletion failed');
    }
  };

  // Category CRUD Handlers
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setCatIcon('');
    setCatIsActive(true);
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatIcon(cat.icon || '');
    setCatIsActive(cat.isActive);
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const token = sessionStorage.getItem('admin_token');
      const payload = {
        name: catName.trim(),
        description: catDescription.trim(),
        icon: catIcon.trim(),
        isActive: catIsActive
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await api.post('/admin/categories', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = sessionStorage.getItem('admin_token');
      await api.delete(`/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Deletion failed');
    }
  };

  const tabConfigs = [
    { key: 'pending_review', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All Users' },
    { key: 'prices', label: 'Manage Prices' },
    { key: 'categories', label: 'Manage Categories' }
  ];

  return (
    <div className="min-h-screen bg-lightBg flex flex-col font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-darkText flex items-center justify-center rounded-xl text-white font-extrabold text-sm">
            L
          </div>
          <div>
            <h1 className="text-md font-extrabold text-darkText tracking-tight">Loopozone</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Compliance Auditing</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Admin Control</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-xl border border-rose-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-darkText">
              {activeTab === 'prices' ? 'Live Indicative Prices List' :
               activeTab === 'categories' ? 'Material Categories List' :
               'KYC Verification Dashboard'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'prices' ? 'Add, edit, or remove indicative scrap market prices per KG.' :
               activeTab === 'categories' ? 'Configure recyclable material categories for the marketplace.' :
               'Review onboarding documentation uploads and approve or reject requests.'}
            </p>
          </div>
          
          {/* Admin CMS Add Buttons */}
          {activeTab === 'prices' && (
            <button
              onClick={openAddPriceModal}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-primary/20 active:scale-[0.98] transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Price Record</span>
            </button>
          )}

          {activeTab === 'categories' && (
            <button
              onClick={openAddCategoryModal}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-primary/20 active:scale-[0.98] transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-6 overflow-x-auto pb-1 sm:pb-0">
          {tabConfigs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 text-sm font-bold border-b-2 px-1 whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20">
            <Loader size="large" />
          </div>
        ) : (
          <>
            {/* 1. Standard KYC Lists (pending_review, approved, rejected, all) */}
            {activeTab !== 'prices' && activeTab !== 'categories' && (
              users.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
                  <Filter className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-bold text-darkText">No Users Found</p>
                  <p className="text-xs mt-1">There are no records matching the selected status.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Seller Type</th>
                          <th className="px-6 py-4">Submitted Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="font-bold text-darkText">{u.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{u.phone}</div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-xs font-bold capitalize bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200">
                                {u.sellerType}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                                u.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                u.kycStatus === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                u.kycStatus === 'pending_review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>
                                {u.kycStatus === 'pending_review' ? 'Pending Review' : u.kycStatus}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() => navigate(`/admin/user/${u._id}`)}
                                className="bg-darkText hover:bg-black text-white font-bold text-xs py-2 px-4 rounded-lg inline-flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Review</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* 2. Admin Price CMS Table */}
            {activeTab === 'prices' && (
              prices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
                  <p className="text-sm font-bold text-darkText">No Price Records Found</p>
                  <p className="text-xs mt-1">Create dynamic material prices using the "Add Price Record" button.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-4">Material Name</th>
                          <th className="px-6 py-4">Price Per KG</th>
                          <th className="px-6 py-4">Price Change</th>
                          <th className="px-6 py-4">City</th>
                          <th className="px-6 py-4">Last Updated By</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm font-semibold">
                        {prices.map((p) => (
                          <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 font-bold text-darkText">{p.materialName}</td>
                            <td className="px-6 py-5 text-darkText">₹{p.pricePerKg}</td>
                            <td className="px-6 py-5">
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                p.priceChange > 0 ? 'bg-emerald-50 text-emerald-600' :
                                p.priceChange < 0 ? 'bg-rose-50 text-rose-600' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {p.priceChange > 0 ? `+₹${p.priceChange}` :
                                 p.priceChange < 0 ? `-₹${Math.abs(p.priceChange)}` :
                                 'Stable'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-gray-500">{p.city}</td>
                            <td className="px-6 py-5 text-xs text-gray-400 font-medium">
                              {p.updatedBy ? p.updatedBy.name : 'System Seed'}
                            </td>
                            <td className="px-6 py-5 text-right space-x-2">
                              <button
                                onClick={() => openEditPriceModal(p)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all inline-flex items-center"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handlePriceDelete(p._id)}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all inline-flex items-center"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* 3. Admin Category CMS Table */}
            {activeTab === 'categories' && (
              categories.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400">
                  <p className="text-sm font-bold text-darkText">No Categories Found</p>
                  <p className="text-xs mt-1">Configure recyclable material categories using the "Add Category" button.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-4">Category Name</th>
                          <th className="px-6 py-4">Description</th>
                          <th className="px-6 py-4">Icon Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm font-semibold">
                        {categories.map((c) => (
                          <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 font-bold text-darkText">{c.name}</td>
                            <td className="px-6 py-5 text-gray-500 text-xs max-w-xs truncate">{c.description || 'N/A'}</td>
                            <td className="px-6 py-5 text-gray-400 font-mono text-xs">{c.icon || 'default'}</td>
                            <td className="px-6 py-5">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                c.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'
                              }`}>
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right space-x-2">
                              <button
                                onClick={() => openEditCategoryModal(c)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all inline-flex items-center"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCategoryDelete(c._id)}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all inline-flex items-center"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* 4. Price Modal Dialog */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 w-full max-w-md animate-scale relative">
            <button
              onClick={() => setPriceModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-darkText transition-colors p-1.5 rounded-lg hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-extrabold text-darkText mb-4">
              {editingPrice ? 'Edit Indicative Price' : 'Add Live Indicative Price'}
            </h3>

            <form onSubmit={handlePriceSubmit} className="space-y-4 font-semibold text-xs text-darkText">
              <div>
                <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">Material Name</label>
                <input
                  type="text"
                  value={priceMaterialName}
                  onChange={(e) => setPriceMaterialName(e.target.value)}
                  placeholder="e.g. Pet Bottles, Cardboard, Glass"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">Price per KG (₹)</label>
                <input
                  type="number"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={priceCity}
                  onChange={(e) => setPriceCity(e.target.value)}
                  placeholder="e.g. Mumbai, Bengaluru"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold"
                />
              </div>

              {editingPrice && (
                <div>
                  <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">Override Price Change (₹)</label>
                  <input
                    type="number"
                    value={priceChange}
                    onChange={(e) => setPriceChange(e.target.value)}
                    placeholder="e.g. 2 (leave blank to compute automatically)"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-3 px-5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md shadow-primary/15 transition-all"
                >
                  {editingPrice ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Category Modal Dialog */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 w-full max-w-md animate-scale relative">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-darkText transition-colors p-1.5 rounded-lg hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-extrabold text-darkText mb-4">
              {editingCategory ? 'Edit Category' : 'Add Material Category'}
            </h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4 font-semibold text-xs text-darkText">
              <div>
                <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Plastic, Paper, Metal"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="e.g. PET Bottles, HDPE containers, PVC pipes"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5 uppercase tracking-wider">Icon Identifier</label>
                <input
                  type="text"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="e.g. Trash2, Leaf, Settings"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="isActiveCheckbox"
                  checked={catIsActive}
                  onChange={(e) => setCatIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded text-primary focus:ring-primary border-gray-200 cursor-pointer"
                />
                <label htmlFor="isActiveCheckbox" className="text-gray-600 select-none cursor-pointer">
                  Activate this category (Make visible to public users)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-3 px-5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md shadow-primary/15 transition-all"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
