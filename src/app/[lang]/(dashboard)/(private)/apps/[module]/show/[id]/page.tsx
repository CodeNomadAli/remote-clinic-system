import { Container, Grid } from "@mui/material";

import DynamicShowComponent from "@/components/dynamicComponent";
import { fetchByModule } from "@/libs/fetchByModule";

interface Props {
    params: {
        module: string;
        id: string;
    };
}

const DynamicShowPage = async ({ params }: Props) => {
    const { module, id } = params;

    const data = await fetchByModule(module, id);

    if (!data) return <div>Not Found</div>;

    return (
        <Container>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <DynamicShowComponent module={module} data={data} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default DynamicShowPage;
