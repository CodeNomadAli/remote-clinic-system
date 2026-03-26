import { notFound } from 'next/navigation'

import Grid from '@mui/material/Grid'

import CompaniesTypesForm from '@/views/apps/companiesTypes/form'


import { fetchCompaniesTypesById } from '@/libs/fetchCompaniesTypesById' // you'll create this

interface Props {
    params: {
        id: string
    }
}



const CompaniesTypesFormView = async ({ params }: Props) => {

    const companiesTypes = await fetchCompaniesTypesById(params.id)

    if (!companiesTypes) {
        notFound()
    }

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} lg={12} md={12}>
                    <CompaniesTypesForm companiesTypes={companiesTypes} />
                </Grid>
            </Grid>
        </>
    )
}

export default CompaniesTypesFormView
