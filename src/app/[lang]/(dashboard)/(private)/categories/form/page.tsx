import Grid from '@mui/material/Grid'

import CategoriesForm from '@/views/apps/categories/form'


const CategoriesFormView = async () => {


    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12} lg={12} md={12}>
                    <CategoriesForm />
                </Grid>
            </Grid>
        </>
    )
}

export default CategoriesFormView
