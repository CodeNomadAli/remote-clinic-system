// views/apps/products/list/index.tsx
import { Card, CardHeader, Button } from '@mui/material'

import type { ExtendedProducts } from '@/utils/types'

import ProductsListTable from './ProductsListTable'

// Props interface
interface ProductsListProps {
  products: ExtendedProducts[]
  totalRecords: number
  totalPages: number
  page: number
  pageSize: number
}

// Server Component
const ProductsList: React.FC<ProductsListProps> = ({ products, totalRecords, totalPages, page, pageSize }) => {
  return (
    <Card sx={{ padding: 2, marginTop: 2 }}>
      <CardHeader
        title="Products List"
        action={
          <>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<i className="tabler-plus" />}
              href="/products/form"
            >
              Add Product
            </Button>
          </>
        }
      />
      <ProductsListTable
        products={products}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
      />
    </Card>
  )
}

export default ProductsList
