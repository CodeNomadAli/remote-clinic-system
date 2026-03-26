import Grid from '@mui/material/Grid'

import CustomersForm from '@/views/apps/customers/form'

import { fetchCustomersById } from '@/libs/fetchCustomersById'
import { fetchAllCompanies } from '@/libs/fetchAllCompanies'
import { fetchAllProducts } from '@/libs/fetchAllProducts'
import { fetchAllCountries } from '@/libs/fetchAllCountries'
import { fetchAllCompaniesTypes } from '@/libs/fetchAllCompaniesTypes'

import type { ExtendedProducts, ExtendedCompanies, ExtendedCustomers } from '@/utils/types'


interface Props {
    params: {
        id: string
    }
}



const CustomerFormView = async ({ params }: Props) => {

    const [customers, products, companies, countries, companiesTypes] = await Promise.all([
        fetchCustomersById(params.id),
        fetchAllProducts(),
        fetchAllCompanies(),
        fetchAllCountries(),
        fetchAllCompaniesTypes()
    ]);

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} lg={12} md={12}>
                    <CustomersForm customers={customers as ExtendedCustomers} products={products as ExtendedProducts[]} companies={companies as ExtendedCompanies[]} countries={countries} companiesTypes={companiesTypes} />
                </Grid>
            </Grid>
        </>
    )
}

export default CustomerFormView
