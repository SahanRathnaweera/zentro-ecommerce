import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  adminCreateProduct,
  adminUpdateProduct,
  getCategories,
  getProductById,
} from '../services/api'
import type { Category } from '../types/category'

interface VariantRow {
  size: string
  color: string
  stock: string
}

function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = id !== undefined
  const { token } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [variants, setVariants] = useState<VariantRow[]>([{ size: '', color: '', stock: '0' }])
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories()
        setCategories(cats)

        if (isEdit) {
          const p = await getProductById(Number(id))
          setName(p.name)
          setDescription(p.description ?? '')
          setBrand(p.brand ?? '')
          setPrice(String(p.price))
          setDiscountPrice(p.discountPrice === null ? '' : String(p.discountPrice))
          setCategoryId(String(p.categoryId))
          setVariants(
            p.variants.map((v) => ({ size: v.size, color: v.color, stock: String(v.stock) })),
          )
          setImageUrls(p.imageUrls.length > 0 ? p.imageUrls : [''])
        } else if (cats.length > 0) {
          setCategoryId(String(cats[0].id))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id, isEdit])

  function updateVariant(index: number, field: keyof VariantRow, value: string) {
    setVariants((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  function validate(): string | null {
    if (!name.trim()) return 'Product name is required'
    const priceNum = Number(price)
    if (price === '' || Number.isNaN(priceNum) || priceNum < 0) return 'Enter a valid price'
    if (discountPrice !== '') {
      const d = Number(discountPrice)
      if (Number.isNaN(d) || d < 0) return 'Enter a valid discount price'
      if (d > priceNum) return 'Discount price cannot be higher than the price'
    }
    if (!categoryId) return 'Choose a category'
    if (variants.length === 0) return 'Add at least one variant'
    for (const v of variants) {
      if (!v.size.trim() || !v.color.trim()) return 'Every variant needs a size and a colour'
      const s = Number(v.stock)
      if (v.stock === '' || !Number.isInteger(s) || s < 0) {
        return 'Stock must be a whole number, 0 or more'
      }
    }
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const problem = validate()
    if (problem) return setError(problem)
    if (!token) return setError('Please log in again')

    const data = {
      name: name.trim(),
      description: description.trim(),
      brand: brand.trim(),
      price: Number(price),
      discountPrice: discountPrice === '' ? null : Number(discountPrice),
      categoryId: Number(categoryId),
      variants: variants.map((v) => ({
        size: v.size.trim(),
        color: v.color.trim(),
        stock: Number(v.stock),
      })),
      imageUrls: imageUrls.map((u) => u.trim()).filter((u) => u !== ''),
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await adminUpdateProduct(token, Number(id), data)
      } else {
        await adminCreateProduct(token, data)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

  if (loading) return <p className="text-neutral-500">Loading...</p>

  return (
    <div className="max-w-2xl">
      <Link to="/admin/products" className="text-sm text-neutral-500 hover:text-black">
        ← Back to products
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-neutral-900">
        {isEdit ? 'Edit product' : 'Add product'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Brand</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Price (Rs.)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Discount price (optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700">Variants (size / colour / stock)</p>
          <div className="mt-2 space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Size"
                  value={v.size}
                  onChange={(e) => updateVariant(i, 'size', e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Colour"
                  value={v.color}
                  onChange={(e) => updateVariant(i, 'color', e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setVariants((rows) => rows.filter((_, idx) => idx !== i))}
                  disabled={variants.length === 1}
                  className="px-2 text-red-600 disabled:opacity-30"
                  aria-label="Remove variant"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVariants((rows) => [...rows, { size: '', color: '', stock: '0' }])}
            className="mt-2 text-sm underline"
          >
            + Add variant
          </button>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700">
            Image URLs (first one is the main image, e.g. /images/SlimFit.jpg)
          </p>
          <div className="mt-2 space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) =>
                    setImageUrls((urls) => urls.map((u, idx) => (idx === i ? e.target.value : u)))
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setImageUrls((urls) => urls.filter((_, idx) => idx !== i))}
                  disabled={imageUrls.length === 1}
                  className="px-2 text-red-600 disabled:opacity-30"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setImageUrls((urls) => [...urls, ''])}
            className="mt-2 text-sm underline"
          >
            + Add image
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-black px-8 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </div>
  )
}

export default ProductForm