
import Grid from '@mui/material/Grid'

import CompaniesForm from '@/views/apps/companies/form'
import { fetchAllCompaniesTypes } from '@/libs/fetchAllCompaniesTypes'

import { fetchCompaniesById } from '@/libs/fetchCompaniesById' // you'll create this
import type { ExtendedCompanies } from '@/utils/types'

interface Props {
    params: {
        id: string
    }
}



const CompaniesFormView = async ({ params }: Props) => {
    const [companies, companiesTypes] = await Promise.all([
        fetchCompaniesById(params.id),
        fetchAllCompaniesTypes()
    ])


    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} lg={12} md={12}>
                    <CompaniesForm companies={companies as ExtendedCompanies} companiesTypes={companiesTypes} />
                </Grid>
            </Grid>
        </>
    )
}

export default CompaniesFormView
