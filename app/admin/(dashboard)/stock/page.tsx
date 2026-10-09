import { saveStockAction } from '@/app/actions/admin'
import { getAllProducts } from '@/lib/content'
import { getStock } from '@/lib/stock'

export const metadata = { title: 'Stok — blabla hijab' }

const INPUT =
  'h-10 w-24 rounded-lg border border-zinc-300 px-3 text-sm tabular-nums outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100'

export default async function AdminStockPage() {
  const [products, stock] = await Promise.all([getAllProducts(), getStock()])
  const byKey = new Map(stock.map((row) => [`${row.productSlug}:${row.variantKey}`, row]))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Stok</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Varian tanpa baris stok tidak dilacak. Menyimpan akan membuat barisnya.
        </p>
      </div>

      {products.map((product) => (
        <section key={product.slug} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{product.title}</h2>
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {product.colors.map((color) => {
              const row = byKey.get(`${product.slug}:${color.key}`)

              return (
                <li
                  key={color.key}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden
                    />
                    {color.name}
                    {row ? null : (
                      <span className="rounded-full bg-zinc-200 px-2 text-xs dark:bg-zinc-800">
                        tidak dilacak
                      </span>
                    )}
                  </span>

                  <form action={saveStockAction} className="flex items-center gap-2">
                    <input type="hidden" name="productSlug" value={product.slug} />
                    <input type="hidden" name="variantKey" value={color.key} />
                    <input
                      name="onHand"
                      type="number"
                      min={0}
                      required
                      defaultValue={row?.onHand ?? 0}
                      aria-label={`Stok ${product.title} ${color.name}`}
                      className={INPUT}
                    />
                    <button
                      type="submit"
                      className="h-10 rounded-full border border-zinc-300 px-4 font-medium dark:border-zinc-700"
                    >
                      Simpan
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
