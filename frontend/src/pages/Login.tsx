import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const toast = useToast();
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useTranslation();

  const onSubmit = async (data: LoginCredentials) => {
    setErrorMsg('');
    try {
      const response = await authService.login(data);
      login(response);
      toast({
        title: t('loginSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid username or password';
      setErrorMsg(message);
      toast({
        title: t('loginFailed'),
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} display="flex" alignItems="center" justifyContent="center">
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', md: '8' }}>
        <Stack spacing="8">
          <Stack spacing="6" textAlign="center">
            <Heading size={{ base: 'xs', md: 'sm' }}>{t('loginTitle')}</Heading>
            <Text color="gray.500">{t('loginSubtitle')}</Text>
          </Stack>
          <Card bg={useColorModeValue('white', 'gray.800')}>
            <CardHeader></CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing="6">
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel>{t('username')} (Email)</FormLabel>
                    <Input 
                      type="email" 
                      {...register('username', { required: 'Username is required' })} 
                    />
                  </FormControl>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>{t('password')}</FormLabel>
                    <Input 
                      type="password" 
                      {...register('password', { required: 'Password is required' })} 
                    />
                  </FormControl>
                  
                  {errorMsg && <Text color="red.500" fontSize="sm">{errorMsg}</Text>}
                  
                  <Button isLoading={isSubmitting} type="submit" colorScheme="brand" size="lg" fontSize="md">
                    {t('signIn')}
                  </Button>
                </Stack>
              </form>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
