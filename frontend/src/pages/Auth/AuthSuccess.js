import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleSuccess } = useAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    
    const token = searchParams.get('token');
    
    if (token) {
      setProcessed(true);
      handleGoogleSuccess(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, handleGoogleSuccess, navigate, processed]);

  return <LoadingSpinner message="Completing authentication..." />;
};

export default AuthSuccess;
