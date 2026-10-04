import type { Product } from '../types/product'

interface ProductCardProps {
  product: Product
}

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function ProductCard({ product }: ProductCardProps) {
  const image = product.imageUrls[0]
  const hasDiscount = product.discountPrice !== null
  const outOfStock = product.totalStock === 0

  return (
    <div className="group overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            No image
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded bg-neutral-900 px-2 py-1 text-xs text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {product.brand ?? product.categoryName}
        </p>
        <h2 className="mt-1 font-semibold text-neutral-900">{product.name}</h2>

        <div className="mt-2 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-semibold text-neutral-900">
                {formatPrice(product.discountPrice as number)}
              </span>
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-neutral-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard