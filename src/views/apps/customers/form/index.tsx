'use client'
import { useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText' // Added for error display
import { Controller, useForm } from 'react-hook-form'
import type { Countries, CompaniesTypes } from '@prisma/client'

import CreatableMultiSelect from '@/components/CreatableMultiSelect'
import CreatableSelect from '@/components/CreateTableSelect'
import { showLoading, hideLoading, showSuccess, showError } from '@/utils/frontend-helper'
import Form from '@components/Form'
import type { ExtendedProducts, ExtendedCompanies, ExtendedCustomers } from '@/utils/types'

interface CustomerFormProps {
    customers?: ExtendedCustomers
    companies?: ExtendedCompanies[]
    products?: ExtendedProducts[]
    countries?: Countries[]
    companiesTypes?: CompaniesTypes[]
}

const CustomerForm = ({ customers, companies, products, countries, companiesTypes }: CustomerFormProps) => {
    const router = useRouter()
    const params = useParams()

    const [productsValues, setProductsValues] = useState<string[]>(
        customers?.customerProducts?.map(product => product.products.name).filter((name): name is string => name !== null && name !== undefined) || []
    )

    const [companyTypeId, setCompanyTypeId] = useState<string>(customers?.companies?.companiesTypes?.id || '')

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: customers?.firstName || '',
            lastName: customers?.lastName || '',
            email: customers?.email || '',
            address: customers?.address || '',
            phoneCode: customers?.countries?.phonecode || '',
            phoneNumber: customers?.phoneNumber || '',
            countriesId: customers?.countriesId || (countries ? countries[0]?.id : ''),
            companies: customers?.companies?.name || '',
            companiesTypesId: customers?.companies?.companiesTypes?.id || '',
            products: productsValues, // Added to form default values
        },
    })

    const onSubmit = async (data: any) => {
        showLoading()
        data.companiesTypesId = companyTypeId
        data.products = productsValues

        try {
            const url = customers?.id ? `/api/customers?customerId=${params.id}` : '/api/customers'
            const method = customers?.id ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const res = await response.json()

            if (response.ok) {
                showSuccess(res.message)
                router.push('/customers/list')
                router.refresh()
            } else if (res.error) {
                showError(res.message)
                res.error.forEach((err: any) => {
                    setError(err.path[0], { message: err.message })
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            showError('An unexpected error occurred')
        } finally {
            hideLoading()
        }
    }

    const companiesOptions = companies?.map(companies => companies.name).filter((name): name is string => name !== null && name !== undefined) || []
    const productsOptions = products?.map(products => products.name).filter((name): name is string => name !== null && name !== undefined) || []

    return (
        <Grid container spacing={3}>
            <Grid item xs={2} lg={2} md={2} />
            <Grid item xs={12} lg={8} md={12}>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader title="Customer Form" />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="First Name"
                                                variant="outlined"
                                                fullWidth
                                                error={!!errors.firstName}
                                                helperText={errors.firstName?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Last Name"
                                                variant="outlined"
                                                fullWidth
                                                error={!!errors.lastName}
                                                helperText={errors.lastName?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Email"
                                                variant="outlined"
                                                fullWidth
                                                error={!!errors.email}
                                                helperText={errors.email?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller
                                        name="address"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Address"
                                                variant="outlined"
                                                fullWidth
                                                error={!!errors.address}
                                                helperText={errors.address?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name="products"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.products}>
                                                <CreatableMultiSelect
                                                    label="Select or Add Products"
                                                    initialOptions={productsOptions}
                                                    value={productsValues}
                                                    onChange={(newValues) => {
                                                        setProductsValues(newValues)
                                                        field.onChange(newValues) // Update form state
                                                    }}
                                                />
                                                {errors.products && <FormHelperText>{errors.products.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Controller
                                            name="countriesId"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl sx={{ width: '15%' }} error={!!errors.countriesId}>
                                                    <InputLabel id="country-code-label">Code</InputLabel>
                                                    <Select
                                                        {...field}
                                                        value={field.value || (countries ? countries[0]?.id : '')}
                                                        labelId="country-code-label"
                                                        label="Code"
                                                        variant="outlined"
                                                        disabled
                                                    >
                                                        {countries?.map((country) => (
                                                            <MenuItem key={country.id} value={country.id}>
                                                                +{country.phonecode}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.countriesId && <FormHelperText>{errors.countriesId.message}</FormHelperText>}
                                                </FormControl>
                                            )}
                                        />
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Phone Number"
                                                    variant="outlined"
                                                    placeholder="Enter your phone number without country code"
                                                    fullWidth
                                                    inputProps={{ maxLength: 10 }}
                                                    type="text"
                                                    error={!!errors.phoneNumber}
                                                    helperText={errors.phoneNumber?.message}
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name="companies"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.companies}>
                                                <CreatableSelect
                                                    label="Select or Add Company"
                                                    initialOptions={companiesOptions}
                                                    value={field.value}
                                                    onChange={(value) => field.onChange(value)}
                                                />
                                                {errors.companies && <FormHelperText>{errors.companies.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name="companiesTypesId"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.companiesTypesId}>
                                                <InputLabel>Company Type</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Company Type"
                                                    value={companyTypeId || field.value}
                                                    onChange={(e) => {
                                                        setCompanyTypeId(e.target.value)
                                                        field.onChange(e.target.value) // Update form state
                                                    }}
                                                >
                                                    {companiesTypes?.map((companyType) => (
                                                        <MenuItem key={companyType.id} value={companyType.id}>
                                                            {companyType.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.companiesTypesId && <FormHelperText>{errors.companiesTypesId.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ textAlign: 'right', marginTop: 2 }}>
                                        <Button type="submit" variant="contained">
                                            Submit
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Form>
            </Grid>
        </Grid>
    )
}

export default CustomerForm
