import Grid from '@mui/material/Grid'

import CompaniesForm from '@/views/apps/companies/form'
import { fetchAllCompaniesTypes } from '@/libs/fetchAllCompaniesTypes'

const CustomerFormView = async () => {
  const companiesTypes = await fetchAllCompaniesTypes()

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={12} md={12}>
          <CompaniesForm companiesTypes={companiesTypes} />
        </Grid>
      </Grid>
    </>
  )
}

export default CustomerFormView
