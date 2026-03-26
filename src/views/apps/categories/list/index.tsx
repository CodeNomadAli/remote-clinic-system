import type { Categories } from '@prisma/client'
import { Card, CardHeader, Button } from '@mui/material'

import CategoriesListClient from './CategoriesListTable'

// Props interface
interface CategoriesListProps {
    categories: Categories[]
    totalRecords: number
    totalPages: number
    page: number
    pageSize: number
}

// Server Component
const CategoriesList: React.FC<CategoriesListProps> = ({ categories, totalRecords, totalPages, page, pageSize }) => {
    return (
        <Card sx={{ padding: 2, marginTop: 2 }}>
            <CardHeader
                title='Categories List'
                action={
                    <>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            startIcon={<i className='tabler-plus' />}
                            href='/categories/form'
                        >
                            Add Category
                        </Button>
                    </>
                }
            />
            <CategoriesListClient
                categories={categories}
                totalRecords={totalRecords}
                totalPages={totalPages}
                page={page}
                pageSize={pageSize}
            />
        </Card>
    )
}

export default CategoriesList
