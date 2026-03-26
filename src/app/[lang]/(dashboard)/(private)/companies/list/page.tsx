// app/[lang]/(dashboard)/(private)/customers/list/page.tsx
import { fetchCompanies } from '@/libs/fetchCompanies'
import CompaniesList from '@/views/apps/companies/list'
import type { ExtendedCompanies } from '@/utils/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: {
    page?: string
    pageSize?: string
  }
}

const CompaniesPage = async ({ searchParams }: Props) => {
  const page = parseInt(searchParams.page || '1', 10)
  const pageSize = parseInt(searchParams.pageSize || '10', 10)

  const data = await fetchCompanies(page, pageSize)

  return (
    <div>
      <CompaniesList
        companies={data.companies as ExtendedCompanies[]}
        totalPages={data.totalPages}
        totalRecords={data.totalRecords}
        page={page}
        pageSize={pageSize}
      />
    </div>
  )
}

export default CompaniesPage
