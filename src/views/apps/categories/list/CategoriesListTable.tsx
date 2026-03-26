// views/apps/categories/list/CategoriesListTable.tsx
'use client'

import type { Categories } from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'

import DynamicTable from '@/components/DynamicTable'

interface CategoriesListTableProps {
    categories: Categories[]
    totalRecords: number
    totalPages: number
    page: number
    pageSize: number
}

const CategoriesListTable: React.FC<CategoriesListTableProps> = ({
    categories,
    totalRecords,
    totalPages,
    page,
    pageSize,
}) => {
    const columns: ColumnDef<Categories>[] = [
        {
            accessorKey: 'id',
            header: 'No',
            cell: ({ row }) => (page - 1) * pageSize + row.index + 1, size: 100,
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
    ]

    return (
        <DynamicTable
            resource="categories"
            permissionKey="category"
            data={categories}
            columns={columns}
            pagination={{ totalRecords, totalPages, page, pageSize }}
        />
    )
}

export default CategoriesListTable
