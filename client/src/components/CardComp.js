import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import React from "react";

const CardComp = ({ children }) => {
  return (
    <Card sx={{ maxWidth: 450 }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" align="center">
            {children}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CardComp;
