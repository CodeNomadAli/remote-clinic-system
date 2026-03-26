'use client'

import type { ColumnDef } from '@tanstack/react-table'

import DynamicTable from '@/components/DynamicTable'
import type { ExtendedCompanies } from '@/utils/types'

interface CompaniesListClientProps {
    companies: ExtendedCompanies[]
    totalRecords: number
    totalPages: number
    page: number
    pageSize: number
}

const CompaniesListClient: React.FC<CompaniesListClientProps> = ({
    companies,
    totalRecords,
    totalPages,
    page,
    pageSize,
}) => {
    const columns: ColumnDef<ExtendedCompanies>[] = [
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
            accessorKey: 'email',
            header: 'Email',
            cell: ({ getValue }) => getValue() || 'N/A',
            size: 200,
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ getValue }) => getValue() || 'N/A',
            size: 200,
        },
        {
            accessorKey: 'companyType',
            header: 'Company Type',
            cell: ({ row }) => row.original.companiesTypes?.name || 'N/A',
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
            resource="companies"
            permissionKey="company"
            data={companies}
            columns={columns}
            pagination={{ totalRecords, totalPages, page, pageSize }}
        />
    )
}

export default CompaniesListClient
