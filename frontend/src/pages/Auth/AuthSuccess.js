import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleSuccess } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      handleGoogleSuccess(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, handleGoogleSuccess, navigate]);

  return <LoadingSpinner message="Completing authentication..." />;
};

export default AuthSuccess;
