import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AutoScholar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered research publication retrieval system
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" display="block">Home</Link>
            <Link href="/search" color="inherit" display="block">Search</Link>
            <Link href="/topics" color="inherit" display="block">Topics</Link>
            <Link href="/trending" color="inherit" display="block">Trending</Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/about" color="inherit" display="block">About</Link>
            <Link href="/help" color="inherit" display="block">Help</Link>
            <Link href="/privacy" color="inherit" display="block">Privacy Policy</Link>
            <Link href="/terms" color="inherit" display="block">Terms of Service</Link>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' AutoScholar. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;