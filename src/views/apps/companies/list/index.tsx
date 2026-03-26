import { Card, CardHeader, Button } from '@mui/material'

import CompaniesListClient from './CompaniesListTable'
import type { ExtendedCompanies } from '@/utils/types'

// Props interface
interface CompaniesListProps {
    companies: ExtendedCompanies[]
    totalRecords: number
    totalPages: number
    page: number
    pageSize: number
}

// Server Component
const CompaniesList: React.FC<CompaniesListProps> = ({ companies, totalRecords, totalPages, page, pageSize }) => {
    return (
        <Card sx={{ padding: 2, marginTop: 2 }}>
            <CardHeader
                title='Companies List'
                action={
                    <>
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            startIcon={<i className='tabler-plus' />}
                            href='/companies/form'
                        >
                            Add Company
                        </Button>
                    </>
                }
            />
            <CompaniesListClient
                companies={companies}
                totalRecords={totalRecords}
                totalPages={totalPages}
                page={page}
                pageSize={pageSize}
            />
        </Card>
    )
}

export default CompaniesList
