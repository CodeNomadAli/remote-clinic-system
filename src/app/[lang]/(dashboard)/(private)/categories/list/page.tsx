import { fetchCategories } from '@/libs/fetchCategories'
import CategoriesList from '@/views/apps/categories/list'

export const dynamic = 'force-dynamic'

interface Props {
    searchParams: {
        page?: string
        pageSize?: string
    }
}

const CategoriesPage = async ({ searchParams }: Props) => {
    const page = parseInt(searchParams.page || '1', 10)
    const pageSize = parseInt(searchParams.pageSize || '10', 10)

    const data = await fetchCategories(page, pageSize)

    return (
        <div>
            <CategoriesList
                categories={data.categories}
                totalPages={data.totalPages}
                totalRecords={data.totalRecords}
                page={page}
                pageSize={pageSize}
            />
        </div>
    )

}

export default CategoriesPage
