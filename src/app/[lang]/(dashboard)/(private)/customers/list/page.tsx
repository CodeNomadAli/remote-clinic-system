// app/[lang]/(dashboard)/(private)/customers/list/page.tsx
import { fetchCustomers } from '@/libs/fetchCustomers'
import CustomersList from '@/views/apps/customers/list'

export const dynamic = 'force-dynamic'

interface Props {
    searchParams: {
        page?: string
        pageSize?: string
    }
}

const CustomersPage = async ({ searchParams }: Props) => {
    const page = parseInt(searchParams.page || '1', 10)
    const pageSize = parseInt(searchParams.pageSize || '10', 10)

    const data = await fetchCustomers(page, pageSize)

    return (
        <div>
            <CustomersList
                customers={data.customers}
                totalPages={data.totalPages}
                totalRecords={data.totalRecords}
                page={page}
                pageSize={pageSize}
            />
        </div>
    )

}

export default CustomersPage
