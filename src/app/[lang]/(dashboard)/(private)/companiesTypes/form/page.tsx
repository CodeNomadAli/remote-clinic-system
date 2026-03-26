import Grid from '@mui/material/Grid'

import CompaniesTypesForm from '@/views/apps/companiesTypes/form'

const CompaniesTypesFormView = () => {
    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} lg={12} md={12}>
                    <CompaniesTypesForm />
                </Grid>
            </Grid>
        </>
    )
}

export default CompaniesTypesFormView
