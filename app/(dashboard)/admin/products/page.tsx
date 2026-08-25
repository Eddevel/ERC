"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  imageUrl: "",
  active: true,
};

export default function AdminProductsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Admin only");
      router.replace("/dashboard");
    }
  }, [authLoading, user, isAdmin, router]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
      );
    } catch (err) {
      // fallback if createdAt index missing
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
        );
      } catch (e) {
        console.error(e);
        toast.error("Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadProducts();
  }, [isAdmin]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || 0,
      stock: p.stock ?? 0,
      category: p.category || "",
      imageUrl: p.imageUrl || "",
      active: p.active ?? true,
    });
    setOpen(true);
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        category: form.category.trim(),
        imageUrl: form.imageUrl,
        active: form.active,
      };

      if (editId) {
        await updateDoc(doc(db, "products", editId), payload);
        toast.success("Product updated");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Product created");
      }

      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted");
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      await updateDoc(doc(db, "products", p.id), { active: !p.active });
      toast.success(p.active ? "Hidden from shop" : "Visible in shop");
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Shop <span className="text-orange-500">Products</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload images to Cloudinary and manage inventory.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add product
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground text-sm">
          No products yet. Click <strong>Add product</strong> to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-card p-3 sm:p-4"
            >
              <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold truncate">{p.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.active
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="text-sm text-orange-600 font-medium">
                  {formatCurrency(p.price)} · Stock {p.stock}
                </p>
                {p.category && (
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive(p)}
                >
                  {p.active ? "Hide" : "Show"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-background p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editId ? "Edit product" : "Add product"}
              </h2>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name *</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Description
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Category
                </label>
                <input
                  className={inputClass}
                  placeholder="Apparel, Accessories..."
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm"
                />
                {uploading && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading to Cloudinary...
                  </p>
                )}
                {form.imageUrl && (
                  <div className="relative mt-3 h-40 w-full rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={form.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                Active (visible in shop)
              </label>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}