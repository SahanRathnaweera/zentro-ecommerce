import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductById } from '../services/api'
import type { Product } from '../types/product'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError(null)
      try {
        const data = await getProductById(Number(id))
        setProduct(data)
        setSelectedColor(data.variants[0]?.color ?? null)
        setSelectedSize(null)
        setActiveImage(0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void loadProduct()
  }, [id])

  if (loading) {
    return <p className="px-4 py-16 text-center text-neutral-500">Loading...</p>
  }

  if (error || !product) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{error ?? 'Product not found'}</p>
        <Link to="/products" className="mt-4 inline-block underline">
          Back to products
        </Link>
      </div>
    )
  }

  // Values worked out from the product's variants (derived data)
  const colors = Array.from(new Set(product.variants.map((v) => v.color)))
  const variantsOfColor = product.variants.filter((v) => v.color === selectedColor)
  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  )
  const hasDiscount = product.discountPrice !== null

  function stockMessage() {
    if (!selectedVariant) return 'Select a size'
    if (selectedVariant.stock === 0) return 'Out of stock'
    if (selectedVariant.stock <= 5) return `Only ${selectedVariant.stock} left`
    return 'In stock'
  }

  const canAddToCart = selectedVariant !== undefined && selectedVariant.stock > 0

  function handleAddToCart() {
    if (!selectedVariant || !product) return

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrls[0] ?? null,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: product.discountPrice ?? product.price,
      quantity: 1,
      maxStock: selectedVariant.stock,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Link to="/products" className="text-sm text-neutral-500 hover:text-black">
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
            {product.imageUrls[activeImage] ? (
              <img
                src={product.imageUrls[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                No image
              </div>
            )}
          </div>

          {product.imageUrls.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.imageUrls.map((url, index) => (
                <button
                  key={url}
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-16 overflow-hidden rounded border-2 ${
                    index === activeImage ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {product.brand ?? product.categoryName}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatPrice(product.discountPrice as number)}
                </span>
                <span className="text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-neutral-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-neutral-600">{product.description}</p>
          )}

          {/* Colour */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-neutral-900">
              Colour: <span className="font-normal">{selectedColor}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedSize(null)
                  }}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    color === selectedColor
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 text-neutral-700 hover:border-black'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-900">Size</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {variantsOfColor.map((variant) => {
                const soldOut = variant.stock === 0
                return (
                  <button
                    key={variant.id}
                    disabled={soldOut}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`min-w-12 rounded border px-4 py-2 text-sm transition ${
                      variant.size === selectedSize
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 text-neutral-700 hover:border-black'
                    } ${soldOut ? 'cursor-not-allowed line-through opacity-40' : ''}`}
                  >
                    {variant.size}
                  </button>
                )
              })}
            </div>
          </div>

          <p
            className={`mt-4 text-sm ${
              selectedVariant && selectedVariant.stock === 0
                ? 'text-red-600'
                : 'text-neutral-600'
            }`}
          >
            {stockMessage()}
          </p>

          <button
            disabled={!canAddToCart}
            onClick={handleAddToCart}
            className="mt-6 w-full rounded-full bg-black px-6 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {added ? 'Added to cart ✓' : 'Add to cart'}
          </button>

          <Link to="/cart" className="mt-3 block text-center text-sm underline">
            View cart
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails