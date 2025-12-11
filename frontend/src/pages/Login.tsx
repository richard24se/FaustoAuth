import { useState } from 'react';
import {
  Box,
  Button,
  Field,
  Input,
  Stack,
  Heading,
  Text,
  Container,
  Card,
  Image,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types';
import { useTranslation } from 'react-i18next';
import { toaster } from '../components/ui/toaster';
import { useColorMode } from '../components/ui/color-mode';
import PhylaxLogo from '../assets/Phylax-logo-1.png';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const bgPage = colorMode === 'dark' ? 'gray.900' : 'gray.50';
  const bgCard = colorMode === 'dark' ? 'gray.800' : 'white';

  const onSubmit = async (data: LoginCredentials) => {
    setErrorMsg('');
    try {
      const response = await authService.login(data);
      login(response);
      toaster.create({
        title: t('loginSuccess'),
        type: 'success',
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid username or password';
      setErrorMsg(message);
      toaster.create({
        title: t('loginFailed'),
        description: message,
        type: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgPage} display="flex" alignItems="center" justifyContent="center">
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', md: '8' }}>
        <Stack gap="8">
          <Stack gap="6" textAlign="center" alignItems="center">
            <Image src={PhylaxLogo} boxSize="150px" alt="Phylax Logo" />
            <Heading size={{ base: 'xl', md: '3xl' }}>{t('loginTitle')}</Heading>
            <Text color="gray.500">{t('loginSubtitle')}</Text>
          </Stack>
          <Card.Root bg={bgCard}>
            <Card.Header></Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="6">
                  <Field.Root invalid={!!errors.username}>
                    <Field.Label>{t('username')} (Email)</Field.Label>
                    <Input
                      type="email"
                      {...register('username', { required: 'Username is required' })}
                    />
                  </Field.Root>
                  <Field.Root invalid={!!errors.password}>
                    <Field.Label>{t('password')}</Field.Label>
                    <Input
                      type="password"
                      {...register('password', { required: 'Password is required' })}
                    />
                  </Field.Root>

                  {errorMsg && (
                    <Text color="red.500" fontSize="sm">
                      {errorMsg}
                    </Text>
                  )}

                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    colorPalette="brand"
                    size="lg"
                    fontSize="md"
                  >
                    {isSubmitting ? '...' : t('signIn')}
                  </Button>
                </Stack>
              </form>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Container>
    </Box>
  );
}
