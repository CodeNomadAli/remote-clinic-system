import { notFound } from 'next/navigation'

import Grid from '@mui/material/Grid'

import CategoriesForm from '@/views/apps/categories/form'

import { fetchCategoriesById } from '@/libs/fetchCategoriesById'

interface Props {
    params: {
        id: string
    }
}

const CategoriesFormView = async ({ params }: Props) => {

    const categories = await fetchCategoriesById(params.id)

    if (!categories) {
        notFound()
    }

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} lg={12} md={12}>
                    <CategoriesForm categories={categories} />
                </Grid>
            </Grid>
        </>
    )
}

export default CategoriesFormView
