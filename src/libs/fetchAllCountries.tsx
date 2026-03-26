import prisma from '@/db'

export async function fetchAllCountries() {
    const companies = await prisma.countries.findMany()

    return companies
}
