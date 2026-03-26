// lib/fetchCustomers.ts
import type { Customers } from '@prisma/client'

import prisma from '@/db'

export interface CustomersResponse {
    customers: Customers[]
    totalRecords: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export async function fetchCustomers(page: number, pageSize: number): Promise<CustomersResponse> {
    const totalRecords = await prisma.customers.count()
    const totalPages = Math.ceil(totalRecords / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const customers = await prisma.customers.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
    })

    return {
        customers,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPrevPage
    }
}
