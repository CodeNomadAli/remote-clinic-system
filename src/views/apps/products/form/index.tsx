'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import type { Categories } from '@prisma/client'

import { useForm, Controller } from 'react-hook-form'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { ExtendedProducts } from '@/utils/types'

import { showLoading, hideLoading, showSuccess } from '@/utils/frontend-helper'
import Form from '@components/Form'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import CustomDropZone from '@components/CustomDropZone'
import CreatableSelect from '@/components/CreateTableSelect'

interface ProductsFormProps {
  products?: ExtendedProducts
  categories?: Categories[] // Updated to array
  products_no?: string
}

interface FormData {
  name: string
  category: string | null
  product_img: File | string | null
}

const ProductsForm = ({ products, categories = [] }: ProductsFormProps) => {
  const router = useRouter()

  const [isDropzoneMode, setIsDropzoneMode] = useState(
    !products?.product_img || typeof products.product_img !== 'string'
  )

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: products?.name || '',

      category: products?.categories?.name || null, // Initialize with product category if available
      product_img: products?.product_img || null
    }
  })


  const handleEntertainerId = (file: File | File[]) => {
    setValue('product_img', Array.isArray(file) ? file[0] : file, { shouldValidate: true })
    setIsDropzoneMode(true)
  }

  const handleChangeImage = () => {
    setValue('product_img', null, { shouldValidate: true })
    setIsDropzoneMode(true)
  }

  const submitForm = async (data: FormData) => {

    showLoading()

    try {
      const formData = new FormData()

      formData.append('name', data.name)

      if (data.category) {
        formData.append('category', data.category)
      }

      if (data.product_img) {
        if (data.product_img instanceof File) {
          formData.append('product_img', data.product_img)
        } else if (typeof data.product_img === 'string' && !data.product_img.startsWith('http')) {
          formData.append('product_img', data.product_img)
        }
      }

      if (products?.id) {
        formData.append('id', products.id)
      }

      const response1 = await fetch(
        `/api/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: data.category }),
        }
      );




      if (response1.ok) {

        const response2 = await fetch('/api/products', {
          method: products?.id ? 'PUT' : 'POST',
          body: formData
        })

        const result2 = await response2.json()

        if (response2.ok) {
          showSuccess(result2.message)
          router.push('/products/list')
          router.refresh()
        } else if (result2.errors) {
          result2.errors.forEach((error: { path: string[]; message: string }) => {
            setError(error.path[0] as keyof FormData, { message: error.message })
          })
        }
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      hideLoading()
    }

  }


  const categoryOptions = categories.map(category => category.name) // Adjust 'name' based on your Categories schema

  return (
    <Grid container spacing={3} justifyContent='center'>
      <Grid item xs={12} md={8}>
        <Form onSubmit={handleSubmit(submitForm)}>
          <Card>
            <CardHeader title='Product Form' />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Name'
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        label="Select or Add Category"
                        initialOptions={categoryOptions}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />
                  {errors.category && (
                    <Typography color="error" variant="caption">
                      {errors.category.message}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {isDropzoneMode || !products?.product_img || typeof products.product_img !== 'string' ? (
                    <AppReactDropzone>
                      <CustomDropZone
                        max={1}
                        title='Product Image (Optional)'
                        setFile={handleEntertainerId}
                      />
                    </AppReactDropzone>
                  ) : (
                    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                      <Box
                        component='img'
                        src={products.product_img}
                        sx={{ width: 100, height: 100, objectFit: 'contain', mb: 2 }}
                        alt='Product Image'
                      />
                      <Typography variant='h6'>Product Image</Typography>
                      <Button onClick={handleChangeImage}>Change Image</Button>
                    </Box>
                  )}
                  {errors.product_img && (
                    <Typography color='error' variant='caption'>
                      {errors.product_img.message}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                  <Button type='submit' variant='contained'>
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Form>
      </Grid>
    </Grid>
  )
}

export default ProductsForm
