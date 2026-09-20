import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../../types';
import { api } from '../../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  Ban,
  X,
  AlertTriangle,
  UploadCloud,
  Coins,
  Crown,
  Briefcase,
  ArrowRightLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { notify } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';

const PRESET_IMAGES = [
  { label: 'Pork Sinigang', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
  { label: 'Chicken Inasal', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Silog / Breakfast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Noodles / Pancit', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80' },
  { label: 'Halo-Halo / Dessert', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Calamansi Juice', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
];

/**
 * Optimizes an uploaded image file using HTML5 canvas before storing.
 * Scales down dimensions if larger than maxWidth/maxHeight to maintain fast load times.
 */
function processImageFile(file: File, maxWidth = 1200, maxHeight = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file must be an image (PNG, JPG, WebP, etc.).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // fallback to raw data url
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ManagerMenu: React.FC = () => {
  const { role, isAdmin, isManager, switchRole } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Add Modal state (Admin authority)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rice Meals',
    price: '',
    description: '',
    image: PRESET_IMAGES[0].url,
    available: true,
    preparationTime: '15 mins',
  });

  // Food picture file upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ name?: string; isUpload?: boolean }>({});

  // Manager Price Setter Modal state (Manager authority)
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceTargetProduct, setPriceTargetProduct] = useState<Product | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Category Manager Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Delete Confirm Modal
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([api.getCategories(), api.getMenu()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------
  // Admin: Adding & Editing Menu Dishes
  // -------------------------------------------------------------
  const handleOpenAdd = async () => {
    if (!isAdmin) {
      const switchNow = await notify.confirm({
        title: 'Admin Permission Required',
        text: 'Adding new menu items and uploading food pictures is reserved for the Administrator. Would you like to switch to Admin mode?',
        confirmButtonText: 'Switch to Admin',
        cancelButtonText: 'Stay as Manager',
      });
      if (switchNow) {
        switchRole('admin');
        notify.toast('Switched to Admin mode. You can now add dishes!');
      }
      return;
    }

    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Rice Meals',
      price: '100',
      description: '',
      image: PRESET_IMAGES[0].url,
      available: true,
      preparationTime: '15 mins',
    });
    setImageMeta({});
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      description: p.description,
      image: p.image,
      available: p.available,
      preparationTime: p.preparationTime || '15 mins',
    });
    setImageMeta({
      isUpload: p.image.startsWith('data:image'),
    });
    setModalOpen(true);
  };

  // Image Upload Handlers (Supports both Drag-and-Drop and Manual Click Selection)
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      notify.error('Invalid File', 'Please upload an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    try {
      setUploadingImage(true);
      const dataUrl = await processImageFile(file);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      setImageMeta({ name: file.name, isUpload: true });
      notify.toast('Food picture uploaded & optimized successfully!');
    } catch (err: unknown) {
      notify.error('Upload Error', (err as Error).message || 'Failed to process image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    if (!formData.name.trim()) {
      notify.warning('Invalid Input', 'Please provide a valid dish name.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      notify.warning('Invalid Price', 'Please provide a valid non-negative price.');
      return;
    }
    if (!formData.image) {
      notify.warning('Picture Required', 'Please upload a food picture or select a preset.');
      return;
    }

    try {
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, {
          name: formData.name.trim(),
          category: formData.category,
          price: priceNum,
          description: formData.description.trim(),
          image: formData.image.trim(),
          available: formData.available,
          preparationTime: formData.preparationTime.trim(),
        });
        setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        notify.toast(`Updated dish "${updated.name}"`);
      } else {
        const created = await api.createProduct({
          name: formData.name.trim(),
          category: formData.category,
          price: priceNum,
          description: formData.description.trim(),
          image: formData.image.trim(),
          available: formData.available,
          preparationTime: formData.preparationTime.trim(),
        });
        setProducts((prev) => [...prev, created]);
        notify.toast(`Admin added "${created.name}" with photo!`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      notify.error('Save Failed', (err as Error).message || 'Failed to save product');
    }
  };

  // -------------------------------------------------------------
  // Manager: Setting & Updating Dish Selling Price
  // -------------------------------------------------------------
  const handleOpenSetPrice = (product: Product) => {
    setPriceTargetProduct(product);
    setNewPriceInput(product.price.toString());
    setPriceModalOpen(true);
  };

  const handleQuickDeltaPrice = (delta: number) => {
    const current = parseFloat(newPriceInput) || priceTargetProduct?.price || 0;
    const calculated = Math.max(0, current + delta);
    setNewPriceInput(calculated.toString());
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceTargetProduct) return;

    const val = parseFloat(newPriceInput);
    if (isNaN(val) || val < 0) {
      notify.warning('Invalid Price', 'Please enter a valid price equal to or greater than 0.');
      return;
    }

    setSavingPrice(true);
    try {
      const updated = await api.updatePrice(priceTargetProduct.id, val);
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      notify.toast(
        `Price for "${updated.name}" updated to ₱${updated.price.toFixed(2)} by Manager!`
      );
      setPriceModalOpen(false);
      setPriceTargetProduct(null);
    } catch (err: unknown) {
      notify.error('Price Update Failed', (err as Error).message || 'Could not update price');
    } finally {
      setSavingPrice(false);
    }
  };

  // Instant availability toggle
  const handleToggleAvailability = async (p: Product) => {
    try {
      const updated = await api.toggleAvailability(p.id, !p.available);
      setProducts((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
      notify.toast(
        `${p.name} is now ${!p.available ? 'Available' : 'Sold Out'}`,
        !p.available ? 'success' : 'info'
      );
    } catch (err) {
      notify.error('Error', 'Failed to toggle availability');
    }
  };

  const handleDeleteItem = async (p: Product) => {
    const confirmed = await notify.confirm({
      title: `Delete "${p.name}"?`,
      text: 'Are you sure you want to remove this dish permanently from Lovely Eatery?',
      confirmButtonText: 'Yes, delete dish',
      isDanger: true,
    });
    if (!confirmed) return;
    try {
      await api.deleteProduct(p.id);
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      notify.toast(`Deleted "${p.name}"`, 'info');
    } catch (err) {
      notify.error('Delete Failed', 'Failed to delete dish');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    try {
      await api.deleteProduct(deleteProduct.id);
      setProducts((prev) => prev.filter((item) => item.id !== deleteProduct.id));
      notify.toast(`Deleted "${deleteProduct.name}"`, 'info');
      setDeleteProduct(null);
    } catch (err) {
      notify.error('Delete Failed', 'Failed to delete dish');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const created = await api.createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
      notify.toast(`Category "${created.name}" added`);
    } catch (err) {
      notify.error('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (catId: string, catName?: string) => {
    const confirmed = await notify.confirm({
      title: 'Remove Category?',
      text: `Are you sure you want to remove ${catName ? `"${catName}"` : 'this category'}? Dishes will remain unassigned.`,
      confirmButtonText: 'Yes, remove',
      isDanger: true,
    });
    if (!confirmed) return;
    try {
      await api.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      notify.toast('Category removed', 'info');
    } catch (err) {
      notify.error('Error', 'Failed to remove category');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20 font-sans">
      {/* Role Context & Guidance Banner */}
      <div className={`p-4 rounded-3xl border transition-all ${
        isAdmin
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
          : 'bg-sky-500/10 border-sky-500/30 text-sky-950'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isAdmin ? 'bg-amber-600 text-white' : 'bg-sky-600 text-white'
            }`}>
              {isAdmin ? <Crown className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight uppercase">
                  {isAdmin ? '👑 Administrator Mode' : '💼 Manager Mode'}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-amber-200 text-amber-900' : 'bg-sky-200 text-sky-900'
                }`}>
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {isAdmin
                  ? 'As Admin, you can add new menus and upload food pictures. Selling prices are set & adjusted by the Manager.'
                  : 'As Manager, you can set and update selling prices for all dishes. Menu additions and photo uploads are handled by the Admin.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="role-banner-switch-btn"
            onClick={() => {
              const targetRole = isAdmin ? 'manager' : 'admin';
              switchRole(targetRole);
              notify.toast(`Switched to ${targetRole === 'admin' ? 'Administrator' : 'Manager'} mode`);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-98 ${
              isAdmin
                ? 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-300'
                : 'bg-white hover:bg-sky-50 text-sky-900 border border-sky-300'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch to {isAdmin ? 'Manager (Set Prices)' : 'Admin (Add Menus)'}</span>
          </button>
        </div>
      </div>

      {/* Header & Main Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
            Menu Management
          </h1>
          <p className="text-xs text-stone-500">
            {isAdmin
              ? 'Admin controls: Add dishes & upload high-res food photos'
              : 'Manager controls: Set & adjust selling prices'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
          >
            Categories
          </button>
          <button
            id="add-food-btn"
            onClick={handleOpenAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 active:scale-95 ${
              isAdmin
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
            }`}
            title={isAdmin ? 'Add new dish to menu' : 'Admin privilege: Switch to Admin to add dishes'}
          >
            <Plus className="w-4 h-4" />
            <span>{isAdmin ? '+ Add Food' : '+ Add Food (Admin)'}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by name or description..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                selectedCategory.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs text-stone-400">Loading menu...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-xs text-stone-400">
          No food items found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-3.5 sm:p-4 border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                p.available ? 'border-stone-200 shadow-xs' : 'border-stone-200 bg-stone-50/70 opacity-85'
              }`}
            >
              {/* Dish Picture & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200/80 shadow-inner"
                  />
                  {p.image.startsWith('data:image') && (
                    <span
                      className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs"
                      title="Custom uploaded food picture"
                    >
                      Photo
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                    <span className="text-xs text-stone-400">ID: #{p.id.slice(0, 6)}</span>
                  </div>
                  <h3 className="font-black text-sm text-stone-900 truncate mt-0.5">{p.name}</h3>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-amber-800">₱{p.price.toFixed(2)}</span>
                    <span className="text-[10px] text-stone-400">• Prep: {p.preparationTime || '15 mins'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Manager Set Price, Availability Toggle, Edit, Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                {/* Manager Price Setter Trigger Button */}
                <button
                  id={`set-price-btn-${p.id}`}
                  onClick={() => handleOpenSetPrice(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs active:scale-95 ${
                    isManager
                      ? 'bg-sky-600 hover:bg-sky-700 text-white ring-2 ring-sky-500/20'
                      : 'bg-stone-100 hover:bg-sky-50 text-sky-800 border border-sky-200'
                  }`}
                  title="Manager: Set or adjust selling price"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Set Price</span>
                </button>

                {/* Instant Availability Button */}
                <button
                  id={`toggle-avail-${p.id}`}
                  onClick={() => handleToggleAvailability(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                    p.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                  }`}
                  title="Toggle available or sold out"
                >
                  {p.available ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Sold Out</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                    title={isAdmin ? 'Edit Dish & Picture' : 'View / Edit Dish'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(p)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition"
                    title="Delete Food"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* Manager: Dedicated Set Price Modal                        */}
      {/* ========================================================= */}
      {priceModalOpen && priceTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase">
                    Set Selling Price
                  </h3>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                    💼 Manager Authority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPriceModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item Summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <img
                src={priceTargetProduct.image}
                alt={priceTargetProduct.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                  {priceTargetProduct.category}
                </span>
                <h4 className="font-black text-xs text-stone-900 truncate mt-0.5">
                  {priceTargetProduct.name}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Current: <strong className="text-stone-900">₱{priceTargetProduct.price.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Price Setting Form */}
            <form onSubmit={handleSavePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  New Selling Price (PHP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-stone-500">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    autoFocus
                    value={newPriceInput}
                    onChange={(e) => setNewPriceInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 text-lg font-black focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Quick adjustment buttons */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 block mb-1">
                  Quick Adjustments:
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[-10, -5, 5, 10, 20].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleQuickDeltaPrice(delta)}
                      className={`py-1.5 rounded-xl text-[11px] font-black border transition ${
                        delta < 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {delta > 0 ? `+₱${delta}` : `-₱${Math.abs(delta)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time comparison */}
              {parseFloat(newPriceInput) !== priceTargetProduct.price && !isNaN(parseFloat(newPriceInput)) && (
                <div className="p-2.5 rounded-xl bg-stone-100 text-xs flex items-center justify-between">
                  <span className="text-stone-500">Price Adjustment:</span>
                  <span className={`font-black ${
                    parseFloat(newPriceInput) > priceTargetProduct.price ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {parseFloat(newPriceInput) > priceTargetProduct.price ? '+' : ''}
                    ₱{(parseFloat(newPriceInput) - priceTargetProduct.price).toFixed(2)} (
                    {(((parseFloat(newPriceInput) - priceTargetProduct.price) / priceTargetProduct.price) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  id="save-price-confirm-btn"
                  type="submit"
                  disabled={savingPrice}
                  className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Coins className="w-4 h-4" />
                  <span>{savingPrice ? 'Saving...' : 'Save Price'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Admin: Add / Edit Menu Item with Food Picture Upload      */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase">
                    {editingProduct ? 'Edit Menu Dish' : 'Add New Menu Item'}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    👑 Admin Food Creator
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              {/* Dish Name */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Crispy Lechon Kawali, Chicken Inasal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-stone-700">Initial Price (₱) *</label>
                    <span className="text-[9px] text-sky-700 font-bold bg-sky-50 px-1.5 py-0.2 rounded">
                      Manager Sets Live
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 120"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Delicious details, viand ingredients, Antique style spices..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* ======================================================= */}
              {/* FOOD PICTURE UPLOAD (Drag-and-Drop + Manual Click File) */}
              {/* ======================================================= */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-black text-stone-800 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Food Picture *</span>
                  </label>
                  <span className="text-[10px] text-stone-400">
                    Drag &amp; drop or click to upload
                  </span>
                </div>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Drag-and-Drop & Click Area */}
                <div
                  id="food-picture-dropzone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 transition-all text-center ${
                    isDragging
                      ? 'border-amber-600 bg-amber-500/10 scale-101'
                      : 'border-stone-300 hover:border-amber-500 hover:bg-stone-50/70 bg-stone-50/40'
                  }`}
                >
                  {formData.image ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-left">
                      <img
                        src={formData.image}
                        alt="Food preview"
                        className="w-20 h-20 rounded-xl object-cover bg-stone-100 border border-stone-200 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Photo Loaded
                          </span>
                          {imageMeta.isUpload && (
                            <span className="text-[9px] text-amber-700 font-bold">
                              Custom Upload
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-stone-800 mt-1 truncate">
                          {imageMeta.name || 'Food Picture Preview'}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Click or drag another photo here to replace
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs"
                      >
                        Browse File
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 text-xs">
                          {uploadingImage ? 'Optimizing photo...' : 'Click to upload or drag & drop food picture'}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset Specialty Photos as Secondary Option */}
                <div className="pt-1">
                  <span className="text-[10px] text-stone-400 font-bold block mb-1">
                    Or choose from Lovely Eatery preset specialties:
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: preset.url });
                          setImageMeta({ name: preset.label, isUpload: false });
                        }}
                        className={`p-1.5 rounded-xl border text-[10px] whitespace-nowrap transition flex items-center gap-1.5 ${
                          formData.image === preset.url
                            ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prep Time & Availability */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    placeholder="e.g., 10-15 mins"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Initial Status</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      id="avail-check"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <label htmlFor="avail-check" className="font-bold text-stone-700 text-xs cursor-pointer">
                      Available Now
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  id="save-food-submit-btn"
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Crown className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Changes' : 'Add to Menu (Admin)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-black text-stone-900 uppercase">Manage Categories</h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name"
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-xs hover:bg-amber-700"
              >
                Add
              </button>
            </form>

            <div className="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-stone-100 pr-1">
              {categories.map((c) => (
                <div key={c.id} className="pt-1.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">{c.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(c.id, c.name)}
                    className="p-1 text-stone-400 hover:text-rose-600"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCategoryModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-stone-900">Delete Food Item?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to remove &ldquo;{deleteProduct.name}&rdquo; from Lovely Eatery&apos;s menu?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteProduct(null)}
                className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
