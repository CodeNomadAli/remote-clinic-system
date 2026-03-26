import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';



import type { ExtendedProducts } from '@/utils/types';

interface Props {
  products: ExtendedProducts;
}

const ProductsShow = ({ products }: Props) => {
  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={8} lg={6}>
        <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardHeader title="Product Detail" />
          <CardContent sx={{ textAlign: 'center' }}>
            <Table >
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align='right'>{products?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Category Name</TableCell>
                <TableCell align='right'>{products?.categories?.name || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} align="center">
                  {products?.product_img ? (
                    <img
                      src={products.product_img}
                      alt="Product Image"
                      style={{ maxWidth: '100%', height: 'auto', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                    />
                  ) : (
                    <span style={{ display: 'block', textAlign: 'center' }}>No Picture Available For This Product</span>
                  )}
                </TableCell>
              </TableRow>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProductsShow;
