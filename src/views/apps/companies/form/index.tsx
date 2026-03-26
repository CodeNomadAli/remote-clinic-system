'use client'

import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import { Controller, useForm } from 'react-hook-form'
import type { CompaniesTypes } from '@prisma/client'

import type { ExtendedCompanies } from '@/utils/types'

import { showLoading, hideLoading, showSuccess, showError } from '@/utils/frontend-helper'
import Form from '@components/Form'

interface CompaniesFormProps {
    companies?: ExtendedCompanies
    companiesTypes?: CompaniesTypes[]
}

const CompaniesForm = ({ companies, companiesTypes }: CompaniesFormProps) => {
    const router = useRouter()
    const { id } = useParams()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: companies?.name || '',
            email: companies?.email || '',
            address: companies?.address || '',
            companiesTypesId: companies?.companiesTypesId || ''
        }
    })



    const onSubmit = async (data: any) => {
        showLoading()
        const url = companies?.id ? `/api/companies?companiesId=${id}` : '/api/companies'

        try {
            const response = await fetch(url, {
                method: companies?.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const res = await response.json()

            if (response.ok) {
                showSuccess(res.message)
                router.push('/companies/list')
                router.refresh()
            } else if (res.error) {
                showError(res.message)
                res.error.forEach((err: any) => {
                    setError(err.path[0], { message: err.message })
                })
            }
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            hideLoading()
        }
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={2} lg={2} md={2} />
            <Grid item xs={12} lg={8} md={12}>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader title='Company Form' />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Controller
                                        name='name'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label='Name'
                                                variant='outlined'
                                                fullWidth
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name='email'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label='Email'
                                                variant='outlined'
                                                fullWidth
                                                error={!!errors.email}
                                                helperText={errors.email?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name='address'
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label='Address'
                                                variant='outlined'
                                                fullWidth
                                                error={!!errors.address}
                                                helperText={errors.address?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller
                                        name='companiesTypesId'
                                        control={control}
                                        rules={{ required: 'Company type is required' }}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.companiesTypesId}>
                                                <InputLabel>Company Type</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Company Type"
                                                    displayEmpty
                                                >
                                                    {companiesTypes?.map(companyType =>
                                                        <MenuItem key={companyType.id} value={companyType.id}>{companyType.name}</MenuItem>
                                                    )
                                                    }
                                                </Select>
                                                {errors.companiesTypesId && <FormHelperText>{errors.companiesTypesId.message}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ textAlign: 'right', marginTop: 2 }}>
                                        <Button type='submit' variant='contained'>
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

export default CompaniesForm
