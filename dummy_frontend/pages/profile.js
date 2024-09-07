import React from 'react';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, Avatar, Typography, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  margin: 'auto',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
  '&:hover': {
    boxShadow: '0 16px 70px -12.125px rgba(0,0,0,0.3)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  margin: 'auto',
  border: '4px solid #fff',
  // boxShadow: theme.shadows[3],
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.spacing(2),
  backgroundColor: '#9de2ff',
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
}));

export default function AestheticProfile() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading" || !session) {
        return;
      }

      try {
        const { data: csrfData } = await axios.get('http://127.0.0.1:8000/api/csrf_token');
        const { data: userData } = await axios.get("http://127.0.0.1:8000/api/getUserinfo", {
          headers: {
            'X-CSRFToken': csrfData.csrfToken,
            'Authorization': `Bearer ${session.user.email}`,
          }
        });
        setUserData(userData.data);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error || !userData) {
    return <Typography color="error">{error || "No user data available"}</Typography>;
  }

  return (
    <StyledCard>
      <CardContent>
        <StyledAvatar src={session?.user?.image || '/default-avatar.png'} alt={session?.user?.name || 'User'} />
        <Typography variant="h4" align="center" gutterBottom sx={{ mt: 2 }}>
          {session?.user?.name || "User Name"}
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          {session?.user?.email || "user@example.com"}
        </Typography>
        
        <StatBox>
          <StatItem>
            {/* <IconWrapper>
              <i className="bi bi-globe-americas"></i>
            </IconWrapper> */}
            <Typography variant="h6">{userData.company_num}</Typography>
            <Typography variant="body2">Websites</Typography>
          </StatItem>
          <StatItem>
            {/* <IconWrapper>
              <i className="bi bi-cookie"></i>
            </IconWrapper> */}
            <Typography variant="h6">{userData.cookie_num}</Typography>
            <Typography variant="body2">Cookies</Typography>
          </StatItem>
          <StatItem>
            {/* <IconWrapper>
              <i className="bi bi-cone-striped"></i>
            </IconWrapper> */}
            <Typography variant="h6">{userData.danger}</Typography>
            <Typography variant="body2">Danger Level</Typography>
          </StatItem>
        </StatBox>
      </CardContent>
    </StyledCard>
  );
}