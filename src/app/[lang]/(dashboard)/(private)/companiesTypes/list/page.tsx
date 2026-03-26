// app/[lang]/(dashboard)/(private)/companiesTypes/list/page.tsx
import { fetchCompaniesTypes } from '@/libs/fetchCompaniesTypes'
import CompaniesTypesList from '@/views/apps/companiesTypes/list'

export const dynamic = 'force-dynamic'

interface Props {
    searchParams: {
        page?: string
        pageSize?: string
    }
}

const CompaniesTypesPage = async ({ searchParams }: Props) => {
    const page = parseInt(searchParams.page || '1', 10)
    const pageSize = parseInt(searchParams.pageSize || '10', 10)

    const data = await fetchCompaniesTypes(page, pageSize)

    return (
        <div>
            <CompaniesTypesList
                companiesTypes={data.companiesTypes}
                totalPages={data.totalPages}
                totalRecords={data.totalRecords}
                page={page}
                pageSize={pageSize}
            />
        </div>
    )
}

export default CompaniesTypesPage
