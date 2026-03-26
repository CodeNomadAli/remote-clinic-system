// views/apps/products/list/ProductsListTable.tsx
'use client'
import type { ColumnDef } from '@tanstack/react-table'

import type { ExtendedProducts } from '@/utils/types';


import DynamicTable from '@/components/DynamicTable'

interface ProductsListTableProps {
  products: ExtendedProducts[]
  totalRecords: number
  totalPages: number
  page: number
  pageSize: number
}

const ProductsListTable: React.FC<ProductsListTableProps> = ({
  products,
  totalRecords,
  totalPages,
  page,
  pageSize,
}) => {
  const columns: ColumnDef<ExtendedProducts>[] = [
    {
      id: 'index',
      header: 'No',
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1, size: 80,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 200,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-GB'),
      size: 150,
    },
    {
      accessorKey: 'categories',
      header: 'Category',
      cell: ({ row }) => row.original.categories?.name || 'N/A',
      size: 150,
    }

  ]


  return (
    <DynamicTable
      resource="products"
      permissionKey="product"
      data={products || []}
      columns={columns}
      pagination={{ totalRecords, totalPages, page, pageSize }}
    />
  )
}

export default ProductsListTable
