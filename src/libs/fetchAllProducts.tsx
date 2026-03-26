import prisma from '@/db'

export async function fetchAllProducts() {
    const products = await prisma.products.findMany()

    return products
}
