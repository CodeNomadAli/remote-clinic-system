"use client";

import {
  Card,
  Grid,
  Avatar,
  Box,
  Chip,
  Divider,
  Typography,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

// 🎯 Helpers
const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "boolean") {
    return (
      <Chip
        label={value ? "Active" : "Inactive"}
        color={value ? "success" : "default"}
        size="small"
      />
    );
  }

  if (!isNaN(Date.parse(value))) {
    return new Date(value).toLocaleDateString();
  }

  return value.toString();
};

// 🎯 Dynamic Info Section: automatically maps all fields
const InfoSectionDynamic = ({ title, data }: any) => {
  // Exclude some system/internal fields
  const excludeFields = [
    "id",
    "photo",
    "image",
    "isActive",
    "createdAt",
    "updatedAt",
    "password",
  ];

  const keys = Object.keys(data).filter((key) => !excludeFields.includes(key));

  if (!keys.length) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700,  }}>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {keys.map((key) => (
          <Grid item xs={12} md={6} key={key}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(74, 20, 140, 0.05)",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600,  }}>
                {formatLabel(key)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500,  }}>
                {formatValue(data[key])}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mt: 2,  }} />
    </Box>
  );
};

// 💎 VIP PROFILE COMPONENT (Dynamic Fields)
const DynamicShowComponent = ({ module, data }: any) => {
  const router = useRouter();

  return (
    <Card
    className="w-full"
      sx={{
        borderRadius: 4,
        p: 4,
        
      }}
    >
      {/* 🔙 BACK BUTTON */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{
          mb: 3,
          
          
        }}
      >
        Back
      </Button>

      {/* 🔥 HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 5,
          flexWrap: "wrap",
        }}
      >
        <Avatar
          src={data.photo || data.image}
          sx={{
            width: 100,
            height: 100,
            fontSize: 36,
            
            color: "#fff",
          }}
        >
          {(data.firstName || data.username || "U")[0]}
        </Avatar>

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700,  }}>
            {data.firstName || data.username || "User"} {data.lastName || ""}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500,   }}>
            {data.email || "No email"}
          </Typography>
          {data.isActive !== undefined && (
            <Chip
              label={data.isActive ? "Active" : "Inactive"}
              color={data.isActive ? "success" : "default"}
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Box>

      {/* 📄 DYNAMIC INFO SECTION */}
      <InfoSectionDynamic title="Details" data={data} />
    </Card>
  );
};

export default DynamicShowComponent;
